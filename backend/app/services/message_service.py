from typing import Dict, Any, Optional, List

class MessageService:
    _messages_history: Dict[str, List[Dict[str, Any]]] = {}

    @classmethod
    def save_latest_message(cls, customer_id: str, message: Dict[str, Any]):
        if customer_id not in cls._messages_history:
            cls._messages_history[customer_id] = []
        cls._messages_history[customer_id].append(message)

    @classmethod
    def get_latest_message(cls, customer_id: str) -> Optional[Dict[str, Any]]:
        history = cls._messages_history.get(customer_id, [])
        return history[-1] if history else None

    @classmethod
    def get_message_history(cls, customer_id: str) -> List[Dict[str, Any]]:
        return cls._messages_history.get(customer_id, [])

    @classmethod
    def clear_message(cls, customer_id: str):
        if customer_id in cls._messages_history:
            del cls._messages_history[customer_id]

