import asyncio
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import WebSocket


class AgentEventHub:
    def __init__(self) -> None:
        self._clients: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._clients.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._clients.discard(websocket)

    async def broadcast(self, event: dict[str, Any]) -> None:
        if not self._clients:
            return

        disconnected: list[WebSocket] = []
        for websocket in self._clients:
            try:
                await websocket.send_json(event)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            self.disconnect(websocket)


agent_event_hub = AgentEventHub()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def log_event(task_id: str, node_id: str, level: str, message: str) -> dict[str, Any]:
    return {
        "id": f"log-{uuid4().hex}",
        "timestamp": now_iso(),
        "level": level,
        "message": message,
        "nodeId": node_id,
        "taskId": task_id,
    }


async def sleep_for_ui(seconds: float = 0.15) -> None:
    await asyncio.sleep(seconds)
