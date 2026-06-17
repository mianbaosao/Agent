package com.example.agentobservability.repository;

import com.example.agentobservability.model.HealthDietEntry;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthDietEntryRepository extends JpaRepository<HealthDietEntry, Integer> {
    List<HealthDietEntry> findByEntryDateOrderBySortOrderAscIdAsc(String entryDate);
    List<HealthDietEntry> findByUserIdAndEntryDateOrderBySortOrderAscIdAsc(Integer userId, String entryDate);
}
