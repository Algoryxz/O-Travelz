"""Storage factory to instantiate configured storage backend."""
from __future__ import annotations

from typing import Optional

from app.core.config import Settings, settings
from app.storage.azure_blob import AzureBlobImageStorage
from app.storage.base import ImageStorage
from app.storage.local import LocalImageStorage


def get_image_storage(app_settings: Optional[Settings] = None) -> ImageStorage:
    """Return configured ImageStorage implementation based on settings."""
    cfg = app_settings or settings
    backend = (cfg.storage_backend or "local").lower()

    if backend in ("azure", "azure_blob"):
        return AzureBlobImageStorage(
            connection_string=cfg.azure_storage_connection_string,
            account_name=cfg.azure_storage_account_name,
            account_key=cfg.azure_storage_account_key,
            container_name=cfg.azure_storage_container_name,
            cdn_base_url=cfg.azure_storage_cdn_base_url,
        )

    return LocalImageStorage(
        base_path=cfg.local_storage_base_path,
        base_url="/static/images",
    )
