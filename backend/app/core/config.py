import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "MarketTwin AI"
    ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./market_twin.db"
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "market-twin-super-secret-key-for-local-dev"

    # Settings config to read from backend/.env
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
