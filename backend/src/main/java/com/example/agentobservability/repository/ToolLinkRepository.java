package com.example.agentobservability.repository;

import com.example.agentobservability.model.ToolLink;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ToolLinkRepository extends JpaRepository<ToolLink, Integer> {
    List<ToolLink> findAllByOrderByGroupIdAscSortOrderAscIdAsc();
    List<ToolLink> findByUserIdOrderByGroupIdAscSortOrderAscIdAsc(Integer userId);
}
