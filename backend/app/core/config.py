from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://otravelz:otravelz@localhost:5432/otravelz"
    environment: str = "development"
    cors_origins: str = "*"

    # Database Connection Pooling Configuration (Production Hardening)
    db_pool_pre_ping: bool = True
    db_pool_recycle: int = 1800  # 30 minutes
    db_pool_size: int = 10
    db_max_overflow: int = 20


    # Image Storage Configuration (provider-neutral)
    storage_backend: str = "local"
    local_storage_base_path: str = "./data/images"

    # Azure Blob Storage Configuration (environment variables only, placeholders in .env.example)
    azure_storage_connection_string: Optional[str] = None
    azure_storage_account_name: Optional[str] = None
    azure_storage_account_key: Optional[str] = None
    azure_storage_container_name: str = "otravelz-images"
    azure_storage_cdn_base_url: Optional[str] = None

    # AI Provider Configuration (provider-neutral)
    ai_provider: str = "mock"
    ai_allow_external_provider: bool = False
    ai_allow_paid_provider: bool = False
    ai_fallback_provider: str = "rule_based"

    ai_model_name: Optional[str] = None
    ai_api_key: Optional[str] = None
    ai_api_base_url: Optional[str] = None
    ai_timeout_seconds: float = 30.0
    ai_max_retries: int = 2

    # Azure OpenAI Configuration (Primary Free-Tier Provider)
    ai_azure_api_version: str = "2024-12-01-preview"
    ai_azure_deployment_name: Optional[str] = None

    # Google Gemini Configuration (Secondary Free-Tier Provider)
    ai_gemini_api_key: Optional[str] = None
    ai_gemini_model_name: Optional[str] = "gemini-1.5-flash"
    ai_gemini_api_base_url: Optional[str] = "https://generativelanguage.googleapis.com/v1beta"

    # NVIDIA API Configuration (Optional Tertiary Provider)
    ai_nvidia_api_key: Optional[str] = None
    nvidia_api_key: Optional[str] = None
    ai_nvidia_model_name: Optional[str] = "deepseek-ai/DeepSeek-V4-Flash"
    ai_nvidia_api_base_url: Optional[str] = "https://integrate.api.nvidia.com/v1"

    # Groq API Configuration (Fast Inference & Multimodal Vision)
    ai_groq_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    ai_groq_model_name: Optional[str] = "llama-3.3-70b-versatile"
    groq_model: Optional[str] = None
    ai_groq_api_base_url: Optional[str] = "https://api.groq.com/openai/v1"
    groq_base_url: Optional[str] = None
    ai_groq_vision_model_name: Optional[str] = "llama-3.2-11b-vision-preview"

    # Rate Limiting, Latency Budgets & Circuit Breaker
    ai_rate_limit_requests: int = 30
    ai_rate_limit_window_seconds: int = 60
    ai_external_rate_limit_requests: int = 10
    ai_external_rate_limit_window_seconds: int = 60
    ai_request_latency_budget_ms: int = 8000
    ai_circuit_breaker_failure_threshold: int = 3
    ai_circuit_breaker_cooldown_seconds: int = 30

    # Google OAuth 2.0 & OpenID Connect Configuration
    google_oauth_enabled: bool = False
    google_oauth_client_id: Optional[str] = None
    google_oauth_client_secret: Optional[str] = None
    google_oauth_redirect_uri: str = "http://localhost:8000/auth/google/callback"

    # Application Session & Cookie Security
    auth_session_secret: str = "otravelz-dev-insecure-secret-key-change-in-prod"
    auth_session_cookie_name: str = "otravelz_session"
    auth_oauth_state_cookie_name: str = "otravelz_oauth_state"
    auth_session_expire_days: int = 30
    auth_oauth_state_expire_seconds: int = 600
    auth_cookie_secure: bool = False
    auth_cookie_samesite: str = "lax"
    auth_frontend_redirect_url: str = "http://localhost:5173"

    # Cloud Sync Payload Bounds
    sync_max_places_batch: int = 100
    sync_max_trips_batch: int = 50
    sync_max_trip_payload_bytes: int = 51200  # 50 KB

    # Trip Share Settings
    share_rate_limit_requests: int = 20  # Max 20 shares/hour/user
    share_rate_limit_window_seconds: int = 3600
    share_max_payload_bytes: int = 51200  # 50 KB

    def validate_production_security(self) -> None:
        """Fail closed if insecure secrets or misconfigurations exist in production."""
        if self.environment.lower() == "production":
            if (
                not self.auth_session_secret
                or self.auth_session_secret == "otravelz-dev-insecure-secret-key-change-in-prod"
                or len(self.auth_session_secret) < 32
            ):
                raise RuntimeError(
                    "FATAL: Insecure or default AUTH_SESSION_SECRET configured for production. "
                    "Production requires a secret with at least 32 high-entropy characters."
                )
            if self.google_oauth_enabled:
                if not self.google_oauth_client_id or not self.google_oauth_client_secret:
                    raise RuntimeError(
                        "FATAL: GOOGLE_OAUTH_ENABLED is true in production, but "
                        "GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET is missing."
                    )

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
settings.validate_production_security()
