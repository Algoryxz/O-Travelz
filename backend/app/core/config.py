"""Application settings, loaded from environment variables. Owner: Smarak."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://otravelz:otravelz@localhost:5432/otravelz"
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
