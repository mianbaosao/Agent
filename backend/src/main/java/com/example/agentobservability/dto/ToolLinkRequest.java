package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ToolLinkRequest(
    @JsonProperty("group_id") String groupId,
    String label,
    String href,
    @JsonProperty("sort_order") Integer sortOrder
) {
}
