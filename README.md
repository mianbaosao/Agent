# AI Agent 可观测平台

用于实时查看 AI Agent 执行全过程，并管理 AI 目标规划日程的全栈工程骨架。

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
    ├── pom.xml                         # Spring Boot 后端
    └── src/main
        ├── java/com/example/agentobservability
        │   ├── controller              # Agent / Schedule REST API
        │   ├── dto                     # 前端接口 DTO
        │   ├── model                   # Schedule 表
        │   ├── repository              # Spring Data JPA
        │   ├── service                 # 规划、日程、种子数据
        │   └── ws                      # WebSocket 实时事件
        └── resources/application.yml
```

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

Java 后端启动：

```bash
cd backend
mvn spring-boot:run
```

## 本地后台运行

如果不想一直开 IDEA，可以先把后端打成 jar，然后用脚本后台启动前后端。

后端构建：

```bash
./scripts/build-backend.sh
```

如果本机没有 `mvn`，可以在 IDEA 里执行一次 Maven `package`，生成 `backend/target/*.jar`。

开发模式后台启动前后端：

```bash
./scripts/start-local.sh
```

生产模式后台启动前后端：

```bash
./scripts/start-local-prod.sh
```

停止服务：

```bash
./scripts/stop-local.sh
```

查看状态：

```bash
./scripts/status-local.sh
```

查看日志：

```bash
./scripts/logs-local.sh all
./scripts/logs-local.sh backend
./scripts/logs-local.sh frontend
```

默认端口：

- 前端：`http://localhost:3000`
- 后端：`http://localhost:8000`

可以临时指定端口：

```bash
FRONTEND_PORT=3001 BACKEND_PORT=8001 ./scripts/start-local.sh
```

后端默认运行在 [http://localhost:8000](http://localhost:8000)，前端默认会连接：

- `POST /agent/plan`
- `GET /schedules`
- `GET /schedules/daily`
- `POST /schedules`
- `PUT /schedules/{id}`
- `DELETE /schedules/{id}`
- `ws://localhost:8000/ws/agent-events`

本地数据库使用 MySQL：

```text
database: agent
table: schedules
host: localhost:3306
user: root
```

启动时如果 `schedules` 表为空，后端会自动写入几条日程 mock 数据。表结构可参考 [backend/init_mysql.sql](/Users/heweitao/agent-Observability-platfrom/backend/init_mysql.sql)。

健康检查：

```bash
curl http://localhost:8000/health
```

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

当前 Java 后端内置 `RuleBasedPlanner`，保证本地无外部模型配置也可以直接运行。

`/agent/plan` 支持 `auto_save=false` 仅返回计划，`auto_save=true` 时会递归保存到 MySQL 的 `Schedule` 表，并通过 `parent_id` 维护父子关系。同时会通过 WebSocket 推送 Agent 执行流程，供 Agent Observability 页面实时展示。
