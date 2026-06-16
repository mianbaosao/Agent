package com.example.agentobservability.controller;

import com.example.agentobservability.dto.SiteAgentMessageResponse;
import com.example.agentobservability.dto.SiteAgentRequest;
import com.example.agentobservability.dto.SiteAgentResponse;
import com.example.agentobservability.service.SiteAgentService;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
public class SiteAgentController {
    private final SiteAgentService service;

    public SiteAgentController(SiteAgentService service) {
        this.service = service;
    }

    @PostMapping("/site-agent/chat")
    public SiteAgentResponse chat(@RequestBody SiteAgentRequest request) {
        return service.chat(request);
    }

    @GetMapping("/site-agent/messages")
    public List<SiteAgentMessageResponse> messages() {
        return service.recentMessages();
    }

    @PostMapping("/site-agent/stream")
    public SseEmitter stream(@RequestBody SiteAgentRequest request) {
        SseEmitter emitter = new SseEmitter(60_000L);
        CompletableFuture.runAsync(() -> {
            try {
                emitter.send(SseEmitter.event().name("message").data("正在理解你的任务..."));
                SiteAgentResponse response = service.chat(request);
                emitter.send(SseEmitter.event().name("message").data(response.reply()));
                emitter.send(SseEmitter.event().name("done").data(response));
                emitter.complete();
            } catch (IOException exception) {
                emitter.completeWithError(exception);
            } catch (Exception exception) {
                try {
                    emitter.send(SseEmitter.event().name("message").data("Agent 执行失败，请稍后再试。"));
                } catch (IOException ignored) {
                    // no-op
                }
                emitter.completeWithError(exception);
            }
        });
        return emitter;
    }
}
