package com.hms.common.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentCompletionStartedEvent {
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private String status;
}
