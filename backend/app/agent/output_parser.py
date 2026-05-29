import json
from typing import Any


def default_plan(goal: str = "", level: str = "daily") -> dict:
    return {
        "goal": goal,
        "level": level,
        "summary": "计划生成失败，已返回默认结构。",
        "plans": [],
    }


class PlanOutputParser:
    def parse(self, text: Any, goal: str = "", level: str = "daily") -> dict:
        if isinstance(text, dict):
            return self._normalize(text, goal=goal, level=level)

        raw = str(text or "").strip()
        raw = raw.replace("```json", "").replace("```", "").strip()

        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            raw = raw[start : end + 1]

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return default_plan(goal=goal, level=level)

        return self._normalize(parsed, goal=goal, level=level)

    def _normalize(self, value: Any, goal: str, level: str) -> dict:
        if not isinstance(value, dict):
            return default_plan(goal=goal, level=level)

        plans = value.get("plans")
        if not isinstance(plans, list):
            plans = []

        return {
            "goal": value.get("goal") or goal,
            "level": value.get("level") or level,
            "summary": value.get("summary") or "",
            "plans": plans,
        }
