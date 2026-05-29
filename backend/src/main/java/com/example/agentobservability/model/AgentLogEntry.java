package com.example.agentobservability.model;

import java.time.Instant;

public record AgentLogEntry(
        String id,
        Instant timestamp,
        String level,
        String message,
        String nodeId,
        String taskId
) {
}
