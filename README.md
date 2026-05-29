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
    ├── pom.xml
    └── src/main/java/com/example/agentobservability
        ├── config/WebSocketConfig.java
        ├── controller/AgentEventWebSocketHandler.java
        └── model
```

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

默认前端使用 mock 实时事件。接入 Spring Boot WebSocket 时：

```bash
NEXT_PUBLIC_AGENT_WS_URL=ws://localhost:8080/ws/agent-events npm run dev
```

后端为 Spring Boot 3.4 + Java 21：

```bash
cd backend
mvn spring-boot:run
```

## 核心数据结构

核心契约在 `frontend/src/types/agent-observability.ts`：

- `AgentEvent`
- `TaskTrace`
- `ToolCall`
- `ExecutionNode`

这些结构同时对应后端 WebSocket 推送 JSON，后续可以把 `MockAgentEventFactory` 替换为真实 Agent runtime / LangGraph / OpenTelemetry trace 事件源。
