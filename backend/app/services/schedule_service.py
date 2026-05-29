from typing import Optional

from sqlalchemy.orm import Session

from app.models import Schedule
from app.schemas import ScheduleCreate, ScheduleUpdate


def seed_mock_schedules(db: Session) -> None:
    if db.query(Schedule).first():
        return

    root = Schedule(
        title="2026年学完Python后端开发",
        description="从基础语法、FastAPI、数据库到部署上线，形成完整后端能力。",
        type="yearly",
        goal="2026年我要学完Python后端开发",
        level="yearly",
        status="doing",
        sort_order=0,
    )
    db.add(root)
    db.flush()

    mock_nodes = [
        ("Q1：Python 与 Web 基础", "掌握 Python、HTTP、FastAPI 入门。", "monthly", "doing"),
        ("Q2：数据库与工程化", "学习 SQLAlchemy、迁移、测试和项目结构。", "monthly", "todo"),
        ("Q3：部署与可观测", "完成 Docker、日志、监控和告警实践。", "monthly", "todo"),
    ]
    for index, (title, desc, node_type, status) in enumerate(mock_nodes):
        month = Schedule(
            parent_id=root.id,
            title=title,
            description=desc,
            type=node_type,
            goal=root.goal,
            level=root.level,
            status=status,
            sort_order=index,
        )
        db.add(month)
        db.flush()
        for day_index, day_title in enumerate(["学习 FastAPI 路由", "完成 Agent 联调", "复盘并整理笔记"]):
            db.add(
                Schedule(
                    parent_id=month.id,
                    title=day_title,
                    description="可在今日任务中修改状态和内容。",
                    type="daily",
                    goal=root.goal,
                    level=root.level,
                    status="done" if day_index == 0 and index == 0 else "todo",
                    due_date="2026-01-01",
                    start_time=["08:00", "10:00", "18:00"][day_index],
                    sort_order=day_index,
                )
            )
    db.commit()


def save_plan_tree(db: Session, plan: dict) -> Schedule:
    root = Schedule(
        parent_id=None,
        goal=plan.get("goal"),
        level=plan.get("level"),
        title=plan.get("goal") or "Agent Plan",
        description=plan.get("summary") or "",
        type=plan.get("level") or "plan",
        sort_order=0,
        status="doing",
    )
    db.add(root)
    db.flush()

    for index, item in enumerate(plan.get("plans") or []):
        _save_node(db=db, node=item, parent=root, sort_order=index)

    db.commit()
    db.refresh(root)
    return root


def _save_node(db: Session, node: dict, parent: Schedule, sort_order: int) -> Schedule:
    schedule = Schedule(
        parent_id=parent.id,
        goal=parent.goal,
        level=parent.level,
        title=node.get("title") or "未命名任务",
        description=node.get("description") or "",
        type=node.get("type") or "task",
        sort_order=sort_order,
        status="todo",
    )
    db.add(schedule)
    db.flush()

    for index, child in enumerate(node.get("children") or []):
        _save_node(db=db, node=child, parent=schedule, sort_order=index)

    return schedule


def serialize_schedule_tree(schedule: Schedule) -> dict:
    return {
        "id": schedule.id,
        "parent_id": schedule.parent_id,
        "goal": schedule.goal,
        "level": schedule.level,
        "title": schedule.title,
        "description": schedule.description,
        "type": schedule.type,
        "status": schedule.status,
        "due_date": schedule.due_date,
        "start_time": schedule.start_time,
        "children": [serialize_schedule_tree(child) for child in schedule.children],
    }


def list_schedule_roots(db: Session) -> list[Schedule]:
    return (
        db.query(Schedule)
        .filter(Schedule.parent_id.is_(None))
        .order_by(Schedule.sort_order.asc(), Schedule.id.asc())
        .all()
    )


def list_daily_schedules(db: Session) -> list[Schedule]:
    return (
        db.query(Schedule)
        .filter(Schedule.type == "daily")
        .order_by(Schedule.due_date.asc().nulls_last(), Schedule.start_time.asc().nulls_last(), Schedule.id.asc())
        .all()
    )


def create_schedule(db: Session, payload: ScheduleCreate) -> Schedule:
    schedule = Schedule(**payload.model_dump())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


def update_schedule(db: Session, schedule_id: int, payload: ScheduleUpdate) -> Optional[Schedule]:
    schedule = db.get(Schedule, schedule_id)
    if schedule is None:
        return None

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(schedule, key, value)

    db.commit()
    db.refresh(schedule)
    return schedule


def delete_schedule(db: Session, schedule_id: int) -> bool:
    schedule = db.get(Schedule, schedule_id)
    if schedule is None:
        return False

    db.delete(schedule)
    db.commit()
    return True
