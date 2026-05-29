from typing import Optional

from pydantic import BaseModel, Field


class ScheduleCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = ""
    type: str = "daily"
    parent_id: Optional[int] = None
    goal: Optional[str] = None
    level: Optional[str] = None
    sort_order: int = 0
    status: str = "todo"
    due_date: Optional[str] = None
    start_time: Optional[str] = None


class ScheduleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    parent_id: Optional[int] = None
    goal: Optional[str] = None
    level: Optional[str] = None
    sort_order: Optional[int] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    start_time: Optional[str] = None
