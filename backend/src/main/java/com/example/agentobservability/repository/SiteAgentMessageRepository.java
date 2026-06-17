package com.example.agentobservability.repository;

import com.example.agentobservability.model.SiteAgentMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SiteAgentMessageRepository extends JpaRepository<SiteAgentMessage, Integer> {
    List<SiteAgentMessage> findTop20ByOrderByCreatedAtDesc();
    List<SiteAgentMessage> findTop20ByUserIdOrderByCreatedAtDesc(Integer userId);
}
