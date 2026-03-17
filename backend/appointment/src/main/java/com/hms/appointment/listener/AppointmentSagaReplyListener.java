package com.hms.appointment.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.appointment.config.RabbitMQConfig;
import com.hms.appointment.entities.Appointment;
import com.hms.appointment.enums.AppointmentStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.common.dto.event.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentSagaReplyListener {

  private final AppointmentRepository appointmentRepository;
  private final RabbitTemplate rabbitTemplate;
  private final ObjectMapper objectMapper;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @RabbitListener(queues = RabbitMQConfig.SAGA_BILLING_REPLY_QUEUE)
  @Transactional
  public void handleBillingReply(EventEnvelope<Object> envelope) {
    log.info("Received billing reply: eventId={}, type={}", envelope.getEventId(), envelope.getEventType());
    try {
      if ("BILLING_PROCESSED".equals(envelope.getEventType())) {
        BillingProcessedEvent event = objectMapper.convertValue(envelope.getPayload(), BillingProcessedEvent.class);
        handleBillingSuccess(event);
      } else if ("BILLING_FAILED".equals(envelope.getEventType())) {
        BillingFailedEvent event = objectMapper.convertValue(envelope.getPayload(), BillingFailedEvent.class);
        handleBillingFailure(event);
      } else {
        log.warn("Unknown billing event type: {}", envelope.getEventType());
      }
    } catch (Exception e) {
      log.error("Error processing billing reply", e);
    }
  }

  @RabbitListener(queues = RabbitMQConfig.SAGA_PHARMACY_REPLY_QUEUE)
  @Transactional
  public void handlePharmacyReply(EventEnvelope<Object> envelope) {
    log.info("Received pharmacy reply: eventId={}, type={}", envelope.getEventId(), envelope.getEventType());
    try {
      if ("PHARMACY_PROCESSED".equals(envelope.getEventType())) {
        PharmacyProcessedEvent event = objectMapper.convertValue(envelope.getPayload(), PharmacyProcessedEvent.class);
        handlePharmacySuccess(event);
      } else if ("PHARMACY_FAILED".equals(envelope.getEventType())) {
        PharmacyFailedEvent event = objectMapper.convertValue(envelope.getPayload(), PharmacyFailedEvent.class);
        handlePharmacyFailure(event);
      } else {
        log.warn("Unknown pharmacy event type: {}", envelope.getEventType());
      }
    } catch (Exception e) {
      log.error("Error processing pharmacy reply", e);
    }
  }

  private void handleBillingSuccess(BillingProcessedEvent event) {
    log.info("Processing billing success for appointment: {}", event.getAppointmentId());
    updateSagaState(event.getAppointmentId(), true, false);
  }

  private void handleBillingFailure(BillingFailedEvent event) {
    log.error("Processing billing failure for appointment: {}, reason: {}", event.getAppointmentId(), event.getReason());
    initiateCompensation(event.getAppointmentId(), "Billing Failed: " + event.getReason());
  }

  private void handlePharmacySuccess(PharmacyProcessedEvent event) {
    log.info("Processing pharmacy success for appointment: {}", event.getAppointmentId());
    updateSagaState(event.getAppointmentId(), false, true);
  }

  private void handlePharmacyFailure(PharmacyFailedEvent event) {
    log.error("Processing pharmacy failure for appointment: {}, reason: {}", event.getAppointmentId(), event.getReason());
    initiateCompensation(event.getAppointmentId(), "Pharmacy Failed: " + event.getReason());
  }

  private void updateSagaState(Long appointmentId, boolean billingSuccess, boolean pharmacySuccess) {
    Appointment appointment = appointmentRepository.findById(appointmentId)
      .orElseThrow(() -> new RuntimeException("Appointment not found: " + appointmentId));

    if (appointment.getStatus() != AppointmentStatus.COMPLETION_PENDING) {
      log.warn("Ignored success event for appointment {} as status is {}", appointmentId, appointment.getStatus());
      return;
    }

    if (billingSuccess) {
      appointment.setBillingProcessed(true);
    }
    if (pharmacySuccess) {
      appointment.setPharmacyProcessed(true);
    }

    if (appointment.isBillingProcessed() && appointment.isPharmacyProcessed()) {
      appointment.setStatus(AppointmentStatus.COMPLETED);
      log.info("Saga completed successfully for appointment {}", appointmentId);
    }

    appointmentRepository.save(appointment);
  }

  private void initiateCompensation(Long appointmentId, String reason) {
    Appointment appointment = appointmentRepository.findById(appointmentId)
      .orElseGet(() -> {
        log.warn("Appointment not found during compensation: {}", appointmentId);
        return null;
      });

    if (appointment == null) return;

    if (appointment.getStatus() == AppointmentStatus.COMPLETION_FAILED) {
      return;
    }

    appointment.setStatus(AppointmentStatus.COMPLETION_FAILED);
    appointment.setNotes(appointment.getNotes() + " | Completion Failed: " + reason);
    appointmentRepository.save(appointment);

    AppointmentCompletionCompensatedEvent event = AppointmentCompletionCompensatedEvent.builder()
      .appointmentId(appointmentId)
      .reason(reason)
      .build();

    EventEnvelope<AppointmentCompletionCompensatedEvent> envelope = EventEnvelope.<AppointmentCompletionCompensatedEvent>builder()
      .eventId(UUID.randomUUID().toString())
      .eventType("APPOINTMENT_COMPLETION_COMPENSATED")
      .occurredAt(LocalDateTime.now())
      .correlationId(String.valueOf(appointmentId))
      .payload(event)
      .build();

    rabbitTemplate.convertAndSend(exchange, "appointment.saga.compensated", envelope);

    log.info("Compensation initiated for appointment {}", appointmentId);
  }
}
