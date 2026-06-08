from typing import Dict, Any, Optional

class MessageService:
    _latest_messages: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def save_latest_message(cls, customer_id: str, message: Dict[str, Any]):
        cls._latest_messages[customer_id] = message

    @classmethod
    def get_latest_message(cls, customer_id: str) -> Optional[Dict[str, Any]]:
        return cls._latest_messages.get(customer_id)

    @classmethod
    def clear_message(cls, customer_id: str):
        if customer_id in cls._latest_messages:
            del cls._latest_messages[customer_id]
