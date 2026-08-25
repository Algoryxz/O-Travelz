"""Azure Blob Storage adapter for destination image assets."""
from __future__ import annotations

from typing import Any, Dict, Optional

from app.storage.base import ImageStorage, ImageStorageError, StorageAuthenticationError, StoredAsset


class AzureBlobImageStorage(ImageStorage):
    """Stores image assets in Azure Blob Storage with optional CDN URL mapping."""

    def __init__(
        self,
        connection_string: Optional[str] = None,
        account_name: Optional[str] = None,
        account_key: Optional[str] = None,
        container_name: str = "otravelz-images",
        cdn_base_url: Optional[str] = None,
        client: Optional[Any] = None,
    ):
        self.container_name = container_name
        self.cdn_base_url = cdn_base_url.rstrip("/") if cdn_base_url else None
        self.account_name = account_name
        self._client = client

        if self._client is None:
            if not connection_string and not account_name:
                # Lazy initialization: do not fail on startup if Azure is not configured
                self._client = None
            else:
                try:
                    from azure.storage.blob import BlobServiceClient

                    if connection_string:
                        self._client = BlobServiceClient.from_connection_string(connection_string)
                        if hasattr(self._client, "account_name") and self._client.account_name:
                            self.account_name = self._client.account_name
                    elif account_name and account_key:
                        account_url = f"https://{account_name}.blob.core.windows.net"
                        self._client = BlobServiceClient(account_url=account_url, credential=account_key)
                    elif account_name:
                        # Managed Identity / Entra ID / DefaultAzureCredential
                        account_url = f"https://{account_name}.blob.core.windows.net"
                        try:
                            from azure.identity import DefaultAzureCredential

                            self._client = BlobServiceClient(account_url=account_url, credential=DefaultAzureCredential())
                        except Exception:
                            self._client = None
                except ImportError:
                    self._client = None
                except Exception:
                    self._client = None


    def _ensure_authenticated(self) -> Any:
        if self._client is None:
            raise StorageAuthenticationError(
                "Azure Blob Storage is not configured or missing valid credentials."
            )
        return self._client

    def save_image(
        self,
        key: str,
        data: bytes,
        content_type: str = "image/webp",
        metadata: Optional[Dict[str, str]] = None,
    ) -> StoredAsset:
        client = self._ensure_authenticated()
        clean_key = key.lstrip("/\\").replace("\\", "/")
        sha256 = self.calculate_sha256(data)
        meta = dict(metadata or {})
        meta["sha256"] = sha256

        try:
            container_client = client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(clean_key)

            try:
                from azure.storage.blob import ContentSettings

                content_settings = ContentSettings(content_type=content_type)
                blob_client.upload_blob(
                    data,
                    overwrite=True,
                    content_settings=content_settings,
                    metadata=meta,
                )
            except (ImportError, TypeError):
                blob_client.upload_blob(
                    data,
                    overwrite=True,
                    metadata=meta,
                )

            url = self.get_url(clean_key)
            return StoredAsset(
                key=clean_key,
                url=url,
                content_type=content_type,
                size_bytes=len(data),
                content_sha256=sha256,
                metadata=meta,
            )
        except StorageAuthenticationError:
            raise
        except Exception as e:
            raise ImageStorageError(f"Failed to upload image to Azure Blob {clean_key}: {e}") from e

    def get_image(self, key: str) -> Optional[bytes]:
        client = self._ensure_authenticated()
        clean_key = key.lstrip("/\\").replace("\\", "/")
        try:
            container_client = client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(clean_key)
            if hasattr(blob_client, "exists") and not blob_client.exists():
                return None
            stream = blob_client.download_blob()
            return stream.readall()
        except StorageAuthenticationError:
            raise
        except Exception as e:
            raise ImageStorageError(f"Failed to download image from Azure Blob {clean_key}: {e}") from e

    def get_url(self, key: str) -> str:
        clean_key = key.lstrip("/\\").replace("\\", "/")
        if self.cdn_base_url:
            return f"{self.cdn_base_url}/{clean_key}"
        account = self.account_name or (getattr(self._client, "account_name", None) if self._client else None)
        if account:
            return f"https://{account}.blob.core.windows.net/{self.container_name}/{clean_key}"
        return f"https://azure-blob/{self.container_name}/{clean_key}"

    def delete_image(self, key: str) -> bool:
        client = self._ensure_authenticated()
        clean_key = key.lstrip("/\\").replace("\\", "/")
        try:
            container_client = client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(clean_key)
            if hasattr(blob_client, "exists") and not blob_client.exists():
                return False
            blob_client.delete_blob()
            return True
        except StorageAuthenticationError:
            raise
        except Exception as e:
            raise ImageStorageError(f"Failed to delete image from Azure Blob {clean_key}: {e}") from e

    def exists(self, key: str) -> bool:
        try:
            client = self._ensure_authenticated()
            clean_key = key.lstrip("/\\").replace("\\", "/")
            container_client = client.get_container_client(self.container_name)
            blob_client = container_client.get_blob_client(clean_key)
            if hasattr(blob_client, "exists"):
                return bool(blob_client.exists())
            return True
        except Exception:
            return False
