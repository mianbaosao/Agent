package com.example.agentobservability.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ToolLinkResponse(
    Integer id,
    @JsonProperty("group_id") String groupId,
    String label,
    String href,
    @JsonProperty("sort_order") Integer sortOrder
) {
}
