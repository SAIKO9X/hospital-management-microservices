package com.hms.appointment.enums;

public enum AppointmentStatus {
  SCHEDULED,  // Agendada
  COMPLETION_PENDING, // Aguardando outros serviços
  COMPLETION_FAILED, // Falhou e precisa de revisão
  COMPLETED,  // Concluída
  CANCELED,   // Cancelada
  NO_SHOW     // Não compareceu
}