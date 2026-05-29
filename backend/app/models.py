from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("schedules.id"), nullable=True, index=True)
    goal = Column(Text, nullable=True)
    level = Column(String(32), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(32), nullable=False, index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    status = Column(String(32), nullable=False, default="todo", index=True)
    due_date = Column(String(32), nullable=True)
    start_time = Column(String(32), nullable=True)

    parent = relationship("Schedule", remote_side=[id], back_populates="children")
    children = relationship(
        "Schedule",
        back_populates="parent",
        cascade="all, delete-orphan",
        order_by="Schedule.sort_order",
    )
