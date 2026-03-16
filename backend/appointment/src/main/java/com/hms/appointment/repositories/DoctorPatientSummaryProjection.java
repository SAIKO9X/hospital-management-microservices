package com.hms.appointment.repositories;

import java.time.LocalDateTime;

public interface DoctorPatientSummaryProjection {
  Long getPatientId();

  Long getUserId();

  String getPatientName();

  String getPatientEmail();

  String getProfilePicture();

  Long getTotalAppointments();

  LocalDateTime getLastAppointmentDate();
}