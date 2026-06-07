import json
import os
from typing import Any
from app.core.logger import logger

# Directory where local JSON backups are saved
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

class JSONFallbackStore:
    """
    Shared storage helper providing JSON serialization/deserialization fallback capability
    to local files. Useful for rapid prototyping and unit testing.
    """
    @staticmethod
    def _get_file_path(filename: str) -> str:
        os.makedirs(DATA_DIR, exist_ok=True)
        return os.path.join(DATA_DIR, filename)

    @classmethod
    def load(cls, filename: str, default: Any = None) -> Any:
        path = cls._get_file_path(filename)
        if not os.path.exists(path):
            if default is not None:
                cls.save(filename, default)
                return default
            return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading JSON fallback file {filename}: {e}")
            return default if default is not None else []

    @classmethod
    def save(cls, filename: str, data: Any) -> bool:
        path = cls._get_file_path(filename)
        try:
            with open(path, "w", encoding="utf-8") as f:
                # Use default=str to automatically handle datetime and other non-serializable objects
                json.dump(data, f, indent=2, default=str)
            return True
        except Exception as e:
            logger.error(f"Error saving JSON fallback file {filename}: {e}")
            return False
