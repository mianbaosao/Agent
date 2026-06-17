package com.example.agentobservability.repository;

import com.example.agentobservability.model.HealthWeightRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthWeightRecordRepository extends JpaRepository<HealthWeightRecord, Integer> {
    List<HealthWeightRecord> findTop30ByOrderByRecordDateAsc();
    List<HealthWeightRecord> findTop30ByUserIdOrderByRecordDateAsc(Integer userId);
    Optional<HealthWeightRecord> findByRecordDate(String recordDate);
    Optional<HealthWeightRecord> findByUserIdAndRecordDate(Integer userId, String recordDate);
}
