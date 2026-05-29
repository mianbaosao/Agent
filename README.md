# AI Agent 可观测平台

用于实时查看 AI Agent 执行全过程的全栈工程骨架。

视觉方向：现代工程控制台的信息密度，结合装甲白、海军蓝、红色告警与黄色强调的机体配色语言。

## 项目目录结构

```text
.
├── frontend
│   ├── src/app                         # Next.js App Router
│   ├── src/components/agent-observability
│   │   ├── agent-observability-dashboard.tsx
│   │   ├── execution-dag.tsx           # ReactFlow DAG
│   │   ├── execution-summary.tsx
│   │   ├── execution-timeline.tsx
│   │   ├── log-console.tsx
│   │   ├── node-detail-drawer.tsx
│   │   └── task-sidebar.tsx
│   ├── src/components/ui               # shadcn/ui 风格基础组件
│   ├── src/data/mock-agent-traces.ts   # Mock 数据和事件流
│   ├── src/hooks/use-agent-trace-stream.ts
│   └── src/types/agent-observability.ts
└── backend
    ├── main.py                         # FastAPI 入口
    ├── requirements.txt
    └── app
        ├── agent
        │   ├── base_planner.py
        │   ├── langchain_planner.py
        │   ├── planner_factory.py
        │   ├── prompt_template.py
        │   ├── output_parser.py
        │   └── rule_based_planner.py
        ├── database.py
        ├── models.py                   # Schedule 表
        └── services/schedule_service.py
```

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

默认前端使用 mock 实时事件。

Python 后端启动：

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

如果在项目根目录安装依赖，也可以使用根目录的 `requirements.txt`。

环境变量配置：

```bash
export OPENAI_API_KEY=sk-7c79b91e6ce34279ba9ec865e11212d1
export OPENAI_BASE_URL=https://www.right.codes/codex/v1
export OPENAI_MODEL=gpt-5.2
```

未配置 `OPENAI_API_KEY` 时，后端会自动降级使用 `RuleBasedPlanner`，保证本地可以直接运行。

接口测试示例：

```bash
curl -X POST http://localhost:8000/agent/plan \
-H "Content-Type: application/json" \
-d '{
  "goal": "2026年我要学完Python后端开发",
  "level": "yearly",
  "auto_save": true
}'
```

## 核心数据结构

核心契约在 `frontend/src/types/agent-observability.ts`：

- `AgentEvent`
- `TaskTrace`
- `ToolCall`
- `ExecutionNode`

后端 Agent 规划模块使用 LangChain LCEL：

```python
prompt | llm | parser
```

`/agent/plan` 支持 `auto_save=false` 仅返回计划，`auto_save=true` 时会递归保存到 SQLite 的 `Schedule` 表，并通过 `parent_id` 维护父子关系。
