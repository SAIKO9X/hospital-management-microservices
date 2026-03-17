package com.hms.pharmacy.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.common.dto.event.AppointmentCompletionCompensatedEvent;
import com.hms.common.dto.event.AppointmentCompletionStartedEvent;
import com.hms.common.dto.event.EventEnvelope;
import com.hms.pharmacy.config.RabbitMQConfig;
import com.hms.pharmacy.services.PharmacySaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@RequiredArgsConstructor
public class PharmacySagaListener {

    private final PharmacySaleService pharmacySaleService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.SAGA_PHARMACY_STARTED_QUEUE)
    @Transactional
    public void handleSagaStarted(@Payload EventEnvelope<?> envelope) {
        log.info("Received Pharmacy Saga Start Event: {}", envelope.getEventId());
        try {
            AppointmentCompletionStartedEvent event = objectMapper.convertValue(
                    envelope.getPayload(), AppointmentCompletionStartedEvent.class);
            
            if (event == null) return;

            pharmacySaleService.processPrescriptionForSaga(
                    event.getAppointmentId(),
                    String.valueOf(event.getPatientId()),
                    event.getDoctorId()
            );
        } catch (Exception e) {
            log.error("Error processing Pharmacy Saga Start Event", e);
        }
    }

    @RabbitListener(queues = RabbitMQConfig.SAGA_PHARMACY_COMPENSATED_QUEUE)
    @Transactional
    public void handleSagaCompensated(@Payload EventEnvelope<?> envelope) {
        log.info("Received Pharmacy Saga Compensation Event: {}", envelope.getEventId());
        try {
            AppointmentCompletionCompensatedEvent event = objectMapper.convertValue(
                    envelope.getPayload(), AppointmentCompletionCompensatedEvent.class);

            if (event == null) return;

            pharmacySaleService.compensatePrescriptionForSaga(event.getAppointmentId());
        } catch (Exception e) {
            log.error("Error processing Pharmacy Saga Compensation Event", e);
        }
    }
}

