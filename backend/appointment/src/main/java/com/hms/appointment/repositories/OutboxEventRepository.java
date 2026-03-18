package com.hms.appointment.repositories;

import com.hms.appointment.entities.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {
  // busca os eventos mais antigos que ainda não foram processados
  List<OutboxEvent> findTop50ByProcessedFalseOrderByCreatedAtAsc();
}
