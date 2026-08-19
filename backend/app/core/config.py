from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://otravelz:otravelz@localhost:5432/otravelz"
    environment: str = "development"

    # Image Storage Configuration (provider-neutral)
    storage_backend: str = "local"
    local_storage_base_path: str = "./data/images"

    # Azure Blob Storage Configuration (environment variables only, placeholders in .env.example)
    azure_storage_connection_string: Optional[str] = None
    azure_storage_account_name: Optional[str] = None
    azure_storage_account_key: Optional[str] = None
    azure_storage_container_name: str = "otravelz-images"
    azure_storage_cdn_base_url: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
