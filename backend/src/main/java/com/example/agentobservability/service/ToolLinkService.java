package com.example.agentobservability.service;

import com.example.agentobservability.dto.ToolLinkRequest;
import com.example.agentobservability.dto.ToolLinkResponse;
import com.example.agentobservability.model.ToolLink;
import com.example.agentobservability.repository.ToolLinkRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class ToolLinkService {
    private final ToolLinkRepository repository;

    public ToolLinkService(ToolLinkRepository repository) {
        this.repository = repository;
    }

    public List<ToolLinkResponse> all() {
        return repository.findAllByOrderByGroupIdAscSortOrderAscIdAsc()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public ToolLinkResponse create(ToolLinkRequest request) {
        ToolLink link = new ToolLink();
        link.setGroupId(request.groupId());
        link.setLabel(request.label());
        link.setHref(normalizeHref(request.href()));
        link.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        return toResponse(repository.save(link));
    }

    @Transactional
    public ToolLinkResponse update(Integer id, ToolLinkRequest request) {
        ToolLink link = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Tool link not found: " + id));
        if (request.groupId() != null) {
            link.setGroupId(request.groupId());
        }
        if (request.label() != null) {
            link.setLabel(request.label());
        }
        if (request.href() != null) {
            link.setHref(normalizeHref(request.href()));
        }
        if (request.sortOrder() != null) {
            link.setSortOrder(request.sortOrder());
        }
        return toResponse(repository.save(link));
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDefaults() {
        if (repository.count() > 0) {
            return;
        }
        seed("learning", "MDN Web Docs", "https://developer.mozilla.org/", 0);
        seed("learning", "React Docs", "https://react.dev/", 1);
        seed("learning", "Spring Guides", "https://spring.io/guides", 2);
        seed("learning", "TypeScript Handbook", "https://www.typescriptlang.org/docs/", 3);
        seed("work", "GitHub", "https://github.com/", 0);
        seed("work", "Vercel", "https://vercel.com/", 1);
        seed("work", "OpenAI Platform", "https://platform.openai.com/", 2);
        seed("work", "LangSmith", "https://smith.langchain.com/", 3);
        seed("search", "Google", "https://www.google.com/", 0);
        seed("search", "Stack Overflow", "https://stackoverflow.com/", 1);
        seed("search", "Docker Hub", "https://hub.docker.com/", 2);
        seed("search", "Maven Repository", "https://mvnrepository.com/", 3);
        seed("utility", "JSON Formatter", "https://jsonformatter.org/", 0);
        seed("utility", "Crontab Guru", "https://crontab.guru/", 1);
        seed("utility", "Regex101", "https://regex101.com/", 2);
        seed("utility", "Excalidraw", "https://excalidraw.com/", 3);
    }

    private void seed(String groupId, String label, String href, int sortOrder) {
        ToolLink link = new ToolLink();
        link.setGroupId(groupId);
        link.setLabel(label);
        link.setHref(href);
        link.setSortOrder(sortOrder);
        repository.save(link);
    }

    private String normalizeHref(String href) {
        if (href == null || href.isBlank()) {
            return "";
        }
        String trimmed = href.trim();
        return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : "https://" + trimmed;
    }

    private ToolLinkResponse toResponse(ToolLink link) {
        return new ToolLinkResponse(link.getId(), link.getGroupId(), link.getLabel(), link.getHref(), link.getSortOrder());
    }
}
