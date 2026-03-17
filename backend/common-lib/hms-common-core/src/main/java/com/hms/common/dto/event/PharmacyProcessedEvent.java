package com.hms.common.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PharmacyProcessedEvent {
    private Long appointmentId;
    private Long saleId;
    private Double amount;
}
