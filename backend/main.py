from datetime import datetime, timezone
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.agent.planner_factory import PlannerFactory
from app.database import Base, engine, get_db
from app.schemas import ScheduleCreate, ScheduleUpdate
from app.services.agent_event_hub import agent_event_hub, log_event, now_iso, sleep_for_ui
from app.services.schedule_service import (
    create_schedule,
    delete_schedule,
    list_daily_schedules,
    list_schedule_roots,
    save_plan_tree,
    seed_mock_schedules,
    serialize_schedule_tree,
    update_schedule,
)

Base.metadata.create_all(bind=engine)


def ensure_schedule_columns() -> None:
    # Lightweight SQLite migration for local dev databases created before CRUD fields existed.
    with engine.begin() as connection:
        existing = {row[1] for row in connection.exec_driver_sql("PRAGMA table_info(schedules)").fetchall()}
        columns = {
            "status": "VARCHAR(32) NOT NULL DEFAULT 'todo'",
            "due_date": "VARCHAR(32)",
            "start_time": "VARCHAR(32)",
        }
        for column, ddl in columns.items():
            if column not in existing:
                connection.exec_driver_sql(f"ALTER TABLE schedules ADD COLUMN {column} {ddl}")


ensure_schedule_columns()

app = FastAPI(title="Agent Observability Python Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AgentPlanRequest(BaseModel):
    goal: str = Field(..., min_length=1)
    level: str = Field(..., pattern="^(yearly|monthly|weekly|daily)$")
    auto_save: bool = False


def seed_database() -> None:
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        seed_mock_schedules(db)
    finally:
        db.close()


seed_database()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws/agent-events")
async def agent_events(websocket: WebSocket) -> None:
    await agent_event_hub.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        agent_event_hub.disconnect(websocket)


@app.get("/schedules")
def get_schedules(db: Session = Depends(get_db)) -> list[dict]:
    return [serialize_schedule_tree(schedule) for schedule in list_schedule_roots(db)]


@app.get("/schedules/daily")
def get_daily_schedules(db: Session = Depends(get_db)) -> list[dict]:
    return [serialize_schedule_tree(schedule) for schedule in list_daily_schedules(db)]


@app.post("/schedules")
def create_schedule_endpoint(payload: ScheduleCreate, db: Session = Depends(get_db)) -> dict:
    return serialize_schedule_tree(create_schedule(db, payload))


@app.put("/schedules/{schedule_id}")
def update_schedule_endpoint(schedule_id: int, payload: ScheduleUpdate, db: Session = Depends(get_db)) -> dict:
    schedule = update_schedule(db, schedule_id, payload)
    if schedule is None:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return serialize_schedule_tree(schedule)


@app.delete("/schedules/{schedule_id}")
def delete_schedule_endpoint(schedule_id: int, db: Session = Depends(get_db)) -> dict:
    if not delete_schedule(db, schedule_id):
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"ok": True}


@app.post("/agent/plan")
async def generate_agent_plan(payload: AgentPlanRequest, db: Session = Depends(get_db)) -> dict:
    task_id = f"agent-plan-{uuid4().hex[:8]}"
    started_at = now_iso()
    nodes = [
        _execution_node(task_id, "node-parse-goal", "解析目标", "解析用户目标、层级与保存模式。", "running", 100),
        _execution_node(task_id, "node-build-prompt", "构造Prompt", "组装 LangChain ChatPromptTemplate。", "pending", 360),
        _execution_node(task_id, "node-generate-plan", "LangChainPlanner", "调用 LLM 或 RuleBasedPlanner 生成结构化计划。", "pending", 640),
        _execution_node(task_id, "node-save-schedule", "保存Schedule", "递归写入 Schedule 表并维护 parent_id。", "pending", 940),
    ]
    await agent_event_hub.broadcast(
        {
            "id": f"event-{uuid4().hex}",
            "type": "task.started",
            "taskId": task_id,
            "nodeId": "node-parse-goal",
            "timestamp": started_at,
            "status": "running",
            "log": log_event(task_id, "node-parse-goal", "info", f"开始规划目标：{payload.goal}"),
            "patch": {
                "id": task_id,
                "name": "AI目标规划 Agent",
                "objective": payload.goal,
                "status": "running",
                "currentNodeId": "node-parse-goal",
                "currentToolName": "GoalParser",
                "startedAt": started_at,
                "durationMs": 0,
                "tags": ["LangChain", "Planner", payload.level],
                "nodes": nodes,
                "logs": [],
            },
        }
    )
    await sleep_for_ui()
    await _complete_node(task_id, "node-parse-goal", "node-build-prompt", "PromptBuilder", "目标解析完成")
    await sleep_for_ui()
    await _complete_node(task_id, "node-build-prompt", "node-generate-plan", "LangChainPlanner", "Prompt构造完成")
    await sleep_for_ui()

    planner = PlannerFactory.create()
    plan = planner.generate_plan(goal=payload.goal, level=payload.level)
    await _complete_node(task_id, "node-generate-plan", "node-save-schedule", "ScheduleWriter", "计划生成完成")
    await sleep_for_ui()

    if not payload.auto_save:
        await _complete_task(task_id, "node-save-schedule", "跳过保存，仅返回生成计划")
        return plan

    root = save_plan_tree(db=db, plan=plan)
    await _complete_task(task_id, "node-save-schedule", f"计划已保存为 Schedule #{root.id}")
    return serialize_schedule_tree(root)


def _execution_node(task_id: str, node_id: str, label: str, description: str, status: str, x: int) -> dict:
    order = ["node-parse-goal", "node-build-prompt", "node-generate-plan", "node-save-schedule"]
    index = order.index(node_id)
    return {
        "id": node_id,
        "taskId": task_id,
        "label": label,
        "description": description,
        "status": status,
        "parentIds": [] if index == 0 else [order[index - 1]],
        "nextIds": [] if index == len(order) - 1 else [order[index + 1]],
        "position": {"x": x, "y": 120},
    }


async def _complete_node(task_id: str, node_id: str, next_node_id: str, next_tool: str, message: str) -> None:
    timestamp = now_iso()
    await agent_event_hub.broadcast(
        {
            "id": f"event-{uuid4().hex}",
            "type": "node.completed",
            "taskId": task_id,
            "nodeId": node_id,
            "timestamp": timestamp,
            "status": "success",
            "log": log_event(task_id, node_id, "success", message),
            "patch": {
                "currentNodeId": next_node_id,
                "currentToolName": next_tool,
                "node": {
                    "id": node_id,
                    "status": "success",
                    "endedAt": timestamp,
                    "durationMs": 450,
                    "toolCall": {
                        "id": f"tool-{node_id}",
                        "nodeId": node_id,
                        "name": next_tool,
                        "reason": message,
                        "input": {"taskId": task_id},
                        "output": {"ok": True},
                        "logs": [],
                        "durationMs": 450,
                        "tokenUsage": {"totalTokens": 0},
                        "startedAt": timestamp,
                        "endedAt": timestamp,
                        "status": "success",
                    },
                },
            },
        }
    )
    await agent_event_hub.broadcast(
        {
            "id": f"event-{uuid4().hex}",
            "type": "node.started",
            "taskId": task_id,
            "nodeId": next_node_id,
            "timestamp": timestamp,
            "status": "running",
            "log": log_event(task_id, next_node_id, "info", f"开始执行：{next_tool}"),
            "patch": {
                "currentNodeId": next_node_id,
                "currentToolName": next_tool,
                "node": {"id": next_node_id, "status": "running", "startedAt": timestamp, "durationMs": 0},
            },
        }
    )


async def _complete_task(task_id: str, node_id: str, message: str) -> None:
    timestamp = datetime.now(timezone.utc).isoformat()
    await agent_event_hub.broadcast(
        {
            "id": f"event-{uuid4().hex}",
            "type": "task.completed",
            "taskId": task_id,
            "nodeId": node_id,
            "timestamp": timestamp,
            "status": "success",
            "log": log_event(task_id, node_id, "success", message),
            "patch": {
                "status": "success",
                "currentToolName": None,
                "endedAt": timestamp,
                "durationMs": 1500,
                "node": {
                    "id": node_id,
                    "status": "success",
                    "endedAt": timestamp,
                    "durationMs": 450,
                    "toolCall": {
                        "id": f"tool-{node_id}",
                        "nodeId": node_id,
                        "name": "ScheduleWriter",
                        "reason": message,
                        "input": {"taskId": task_id},
                        "output": {"saved": True},
                        "logs": [],
                        "durationMs": 450,
                        "tokenUsage": {"totalTokens": 0},
                        "startedAt": timestamp,
                        "endedAt": timestamp,
                        "status": "success",
                    },
                },
            },
        }
    )
