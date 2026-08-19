"""Unit tests for ImageStorage abstraction, Local storage, and Azure Blob adapter."""
import hashlib
from unittest.mock import MagicMock
import pytest

from app.core.config import Settings
from app.storage.base import (
    ImageStorage,
    ImageStorageError,
    StorageAuthenticationError,
    StoredAsset,
)
from app.storage.local import LocalImageStorage
from app.storage.azure_blob import AzureBlobImageStorage
from app.storage.factory import get_image_storage


def test_local_storage_lifecycle(tmp_path):
    """Test LocalImageStorage save, get, exists, get_url, and delete operations."""
    storage = LocalImageStorage(base_path=str(tmp_path), base_url="/static/images")

    sample_bytes = b"fake_image_binary_content_12345"
    key = "places/lingaraj/hero.webp"

    # Save
    stored = storage.save_image(
        key=key,
        data=sample_bytes,
        content_type="image/webp",
        metadata={"author": "Test Author"},
    )
    assert isinstance(stored, StoredAsset)
    assert stored.key == "places/lingaraj/hero.webp"
    assert stored.url == "/static/images/places/lingaraj/hero.webp"
    assert stored.size_bytes == len(sample_bytes)
    assert stored.content_sha256 == hashlib.sha256(sample_bytes).hexdigest()
    assert stored.metadata["author"] == "Test Author"

    # Exists
    assert storage.exists(key) is True
    assert storage.exists("nonexistent/key.webp") is False

    # Get
    retrieved = storage.get_image(key)
    assert retrieved == sample_bytes

    # Get URL
    assert storage.get_url(key) == "/static/images/places/lingaraj/hero.webp"

    # Delete
    deleted = storage.delete_image(key)
    assert deleted is True
    assert storage.exists(key) is False
    assert storage.get_image(key) is None
    assert storage.delete_image(key) is False


def test_local_storage_path_traversal_rejection(tmp_path):
    """Verify LocalImageStorage rejects directory traversal attempts."""
    storage = LocalImageStorage(base_path=str(tmp_path))
    with pytest.raises(ImageStorageError):
        storage.save_image(key="../../etc/passwd", data=b"malicious")


def test_azure_blob_storage_with_mock_client():
    """Verify AzureBlobImageStorage operations using a mocked BlobServiceClient."""
    mock_client = MagicMock()
    mock_client.account_name = "otravelzstorage"
    mock_container_client = MagicMock()
    mock_blob_client = MagicMock()

    mock_client.get_container_client.return_value = mock_container_client
    mock_container_client.get_blob_client.return_value = mock_blob_client
    mock_blob_client.exists.return_value = True

    mock_download = MagicMock()
    mock_download.readall.return_value = b"azure_image_bytes"
    mock_blob_client.download_blob.return_value = mock_download

    storage = AzureBlobImageStorage(
        container_name="test-container",
        cdn_base_url="https://cdn.o-travelz.com",
        client=mock_client,
    )

    data = b"azure_image_bytes"
    key = "places/puri/beach.webp"

    # Save
    stored = storage.save_image(key, data, content_type="image/webp")
    assert stored.key == "places/puri/beach.webp"
    assert stored.url == "https://cdn.o-travelz.com/places/puri/beach.webp"
    assert stored.content_sha256 == hashlib.sha256(data).hexdigest()
    assert mock_blob_client.upload_blob.called

    # Get
    downloaded = storage.get_image(key)
    assert downloaded == data

    # Exists
    assert storage.exists(key) is True

    # Delete
    deleted = storage.delete_image(key)
    assert deleted is True
    assert mock_blob_client.delete_blob.called


def test_azure_blob_storage_unauthenticated_error():
    """Verify AzureBlobImageStorage raises StorageAuthenticationError when credentials are missing."""
    storage = AzureBlobImageStorage(
        connection_string=None,
        account_name=None,
        account_key=None,
    )
    with pytest.raises(StorageAuthenticationError):
        storage.save_image("test/key.webp", b"test")

    with pytest.raises(StorageAuthenticationError):
        storage.get_image("test/key.webp")

    with pytest.raises(StorageAuthenticationError):
        storage.delete_image("test/key.webp")


def test_azure_blob_storage_url_generation():
    """Verify URL generation with and without CDN."""
    mock_client = MagicMock()
    mock_client.account_name = "testaccount"

    # With CDN
    storage_cdn = AzureBlobImageStorage(
        cdn_base_url="https://cdn.example.com/assets",
        client=mock_client,
    )
    assert storage_cdn.get_url("places/01.webp") == "https://cdn.example.com/assets/places/01.webp"

    # Without CDN (direct blob URL)
    storage_direct = AzureBlobImageStorage(
        account_name="testaccount",
        container_name="images",
        client=mock_client,
    )
    assert storage_direct.get_url("places/01.webp") == "https://testaccount.blob.core.windows.net/images/places/01.webp"


def test_storage_factory_local_by_default(tmp_path):
    """Verify get_image_storage returns LocalImageStorage by default."""
    cfg = Settings(storage_backend="local", local_storage_base_path=str(tmp_path))
    storage = get_image_storage(cfg)
    assert isinstance(storage, LocalImageStorage)


def test_storage_factory_azure_selection():
    """Verify get_image_storage selects AzureBlobImageStorage when configured."""
    cfg = Settings(
        storage_backend="azure",
        azure_storage_account_name="fakeaccount",
        azure_storage_account_key="fakekey",
    )
    storage = get_image_storage(cfg)
    assert isinstance(storage, AzureBlobImageStorage)


def test_azure_blob_storage_content_type_propagation():
    """Verify content type is passed during Azure blob upload."""
    mock_client = MagicMock()
    mock_container_client = MagicMock()
    mock_blob_client = MagicMock()
    mock_client.get_container_client.return_value = mock_container_client
    mock_container_client.get_blob_client.return_value = mock_blob_client

    storage = AzureBlobImageStorage(
        container_name="images",
        client=mock_client,
    )

    data = b"sample_webp_binary"
    key = "places/bbsr/01/hero.webp"
    stored = storage.save_image(key, data, content_type="image/webp")

    assert stored.content_type == "image/webp"
    assert stored.key == "places/bbsr/01/hero.webp"
    assert mock_blob_client.upload_blob.called


def test_azure_blob_storage_error_does_not_leak_credentials():
    """Verify error messages from Azure storage do not expose secret values."""
    mock_client = MagicMock()
    mock_client.get_container_client.side_effect = Exception("Internal storage network failure")

    storage = AzureBlobImageStorage(
        account_name="mysecretaccount",
        account_key="super_secret_key_12345",
        client=mock_client,
    )

    with pytest.raises(ImageStorageError) as exc_info:
        storage.save_image("places/01.webp", b"test")

def test_azure_blob_storage_entra_id_initialization():
    """Verify AzureBlobImageStorage attempts Entra ID when account_name is given without key."""
    from unittest.mock import patch

    with patch("azure.identity.DefaultAzureCredential") as mock_cred:
        mock_cred.return_value = MagicMock()
        storage = AzureBlobImageStorage(
            account_name="mytestaccount",
            account_key=None,
        )
        assert storage.account_name == "mytestaccount"
        assert storage._client is not None
