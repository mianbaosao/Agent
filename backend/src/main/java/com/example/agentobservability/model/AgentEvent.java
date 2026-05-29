package com.example.agentobservability.model;

import java.time.Instant;
import java.util.Map;

public record AgentEvent(
        String id,
        String type,
        String taskId,
        String nodeId,
        Instant timestamp,
        String status,
        AgentLogEntry log,
        Map<String, Object> patch
) {
}
