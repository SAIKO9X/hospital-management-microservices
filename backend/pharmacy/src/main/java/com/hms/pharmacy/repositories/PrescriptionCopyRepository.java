package com.hms.pharmacy.repositories;

import com.hms.pharmacy.entities.PrescriptionCopy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrescriptionCopyRepository extends JpaRepository<PrescriptionCopy, Long> {
  Optional<PrescriptionCopy> findByAppointmentId(Long appointmentId);
}