package com.example.agentobservability.controller;

import com.example.agentobservability.dto.ToolLinkRequest;
import com.example.agentobservability.dto.ToolLinkResponse;
import com.example.agentobservability.service.ToolLinkService;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("*")

public class ToolLinkController {
    private final ToolLinkService service;

    public ToolLinkController(ToolLinkService service) {
        this.service = service;
    }

    @GetMapping("/tool-links")
    public List<ToolLinkResponse> toolLinks() {
        return service.all();
    }

    @PostMapping("/tool-links")
    public ToolLinkResponse createToolLink(@RequestBody ToolLinkRequest request) {
        return service.create(request);
    }

    @PutMapping("/tool-links/{id}")
    public ToolLinkResponse updateToolLink(@PathVariable Integer id, @RequestBody ToolLinkRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/tool-links/{id}")
    public Map<String, Boolean> deleteToolLink(@PathVariable Integer id) {
        service.delete(id);
        return Map.of("ok", true);
    }
}
