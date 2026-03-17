package com.hms.appointment.services.impl;

import com.hms.appointment.clients.ProfileFeignClient;
import com.hms.appointment.clients.UserFeignClient;
import com.hms.appointment.dto.event.PrescriptionIssuedEvent;
import com.hms.appointment.dto.external.DoctorProfile;
import com.hms.appointment.dto.external.PatientProfile;
import com.hms.appointment.dto.external.UserResponse;
import com.hms.appointment.dto.request.MedicineRequest;
import com.hms.appointment.dto.request.PrescriptionCreateRequest;
import com.hms.appointment.dto.request.PrescriptionUpdateRequest;
import com.hms.appointment.dto.response.PrescriptionForPharmacyResponse;
import com.hms.appointment.dto.response.PrescriptionResponse;
import com.hms.appointment.entities.*;
import com.hms.appointment.enums.PrescriptionStatus;
import com.hms.appointment.repositories.AppointmentRepository;
import com.hms.appointment.repositories.DoctorReadModelRepository;
import com.hms.appointment.repositories.PatientReadModelRepository;
import com.hms.appointment.repositories.PrescriptionRepository;
import com.hms.appointment.services.PrescriptionService;
import com.hms.common.dto.event.EventEnvelope;
import com.hms.common.dto.response.ResponseWrapper;
import com.hms.common.exceptions.AccessDeniedException;
import com.hms.common.exceptions.InvalidOperationException;
import com.hms.common.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

  private final PrescriptionRepository prescriptionRepository;
  private final AppointmentRepository appointmentRepository;
  private final ProfileFeignClient profileClient;
  private final PdfGeneratorService pdfGeneratorService;
  private final RabbitTemplate rabbitTemplate;
  private final PatientReadModelRepository patientReadModelRepository;
  private final DoctorReadModelRepository doctorReadModelRepository;
  private final UserFeignClient userFeignClient;

  @Value("${application.rabbitmq.exchange}")
  private String exchange;

  @Value("${application.rabbitmq.prescription-issued-routing-key}")
  private String prescriptionIssuedRoutingKey;

  private static final String PRESCRIPTION = "Prescription";

  // Métodos auxiliares para resolver IDs a partir do userId, lançando exceção se não encontrado
  private Long resolvePatientId(Long userId) {
    return patientReadModelRepository.findByUserId(userId)
      .map(PatientReadModel::getPatientId)
      .orElseThrow(() -> new ResourceNotFoundException("Paciente não encontrado para UserID " + userId));
  }

  private Long resolveDoctorId(Long userId) {
    return doctorReadModelRepository.findByUserId(userId)
      .map(DoctorReadModel::getDoctorId)
      .orElseThrow(() -> new ResourceNotFoundException("Médico não encontrado para UserID " + userId));
  }

  @Override
  @Transactional
  public PrescriptionResponse createPrescription(PrescriptionCreateRequest request, Long userDoctorId) {
    Long doctorProfileId = resolveDoctorId(userDoctorId);

    Appointment appointment = appointmentRepository.findById(request.appointmentId())
      .orElseThrow(() -> new ResourceNotFoundException("Appointment", request.appointmentId()));

    validateDoctorAuthority(appointment, doctorProfileId);

    if (prescriptionRepository.findByAppointmentId(request.appointmentId()).isPresent()) {
      throw new InvalidOperationException("Já existe uma prescrição para esta consulta.");
    }

    Prescription newPrescription = new Prescription();
    newPrescription.setAppointment(appointment);
    newPrescription.setNotes(request.notes());
    newPrescription.setMedicines(mapToMedicineEntities(request.medicines()));

    Prescription saved = prescriptionRepository.save(newPrescription);
    publishPrescriptionEvent(saved);

    return PrescriptionResponse.fromEntity(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionResponse getPrescriptionByAppointmentId(Long appointmentId, Long requesterUserId) {
    Long requesterProfileId = null;
    try {
      requesterProfileId = resolvePatientId(requesterUserId);
    } catch (ResourceNotFoundException e) {
      try {
        requesterProfileId = resolveDoctorId(requesterUserId);
      } catch (ResourceNotFoundException ex) {
        throw new AccessDeniedException("Usuário desconhecido.");
      }
    }

    final Long resolvedId = requesterProfileId;

    return prescriptionRepository.findByAppointmentId(appointmentId)
      .map(prescription -> {
        validateViewerAuthority(prescription.getAppointment(), resolvedId);
        return PrescriptionResponse.fromEntity(prescription);
      })
      .orElse(null);
  }

  @Override
  @Transactional
  public PrescriptionResponse updatePrescription(Long prescriptionId, PrescriptionUpdateRequest request, Long userDoctorId) {
    Long doctorProfileId = resolveDoctorId(userDoctorId);

    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException(PRESCRIPTION, prescriptionId));

    validateDoctorAuthority(prescription.getAppointment(), doctorProfileId);

    prescription.setMedicines(mapToMedicineEntities(request.medicines()));
    prescription.setNotes(request.notes());

    Prescription savedPrescription = prescriptionRepository.save(prescription);

    publishPrescriptionEvent(savedPrescription);

    return PrescriptionResponse.fromEntity(savedPrescription);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<PrescriptionResponse> getPrescriptionsByPatientId(Long userIdOrPatientId, Long requesterUserId, Pageable pageable) {
    Long patientProfileId;

    boolean isSelf = userIdOrPatientId.equals(requesterUserId);

    if (isSelf) {
      patientProfileId = resolvePatientId(requesterUserId);
    } else {
      patientProfileId = userIdOrPatientId;
      Long doctorProfileId = resolveDoctorId(requesterUserId);

      boolean hasRelationship = appointmentRepository.existsByDoctorIdAndPatientId(doctorProfileId, patientProfileId);
      if (!hasRelationship) {
        throw new AccessDeniedException("Acesso negado. Você não possui histórico com este paciente.");
      }
    }

    return prescriptionRepository.findByAppointmentPatientId(patientProfileId, pageable)
      .map(PrescriptionResponse::fromEntity);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionForPharmacyResponse getPrescriptionForPharmacy(Long prescriptionId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException(PRESCRIPTION, prescriptionId));

    if (prescription.getStatus() == PrescriptionStatus.DISPENSED) {
      throw new InvalidOperationException("Esta prescrição já foi utilizada.");
    }

    return PrescriptionForPharmacyResponse.fromEntity(prescription);
  }

  @Override
  @Transactional
  public void markAsDispensed(Long prescriptionId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException(PRESCRIPTION, prescriptionId));

    if (prescription.getStatus() == PrescriptionStatus.DISPENSED) {
      return;
    }

    prescription.setStatus(PrescriptionStatus.DISPENSED);
    prescriptionRepository.save(prescription);
    log.info("Prescrição ID {} marcada como aviada.", prescriptionId);
  }

  @Override
  @Transactional(readOnly = true)
  public PrescriptionResponse getLatestPrescriptionByPatientId(Long userId) {
    Long patientId = resolvePatientId(userId);
    return prescriptionRepository.findFirstByAppointmentPatientIdOrderByCreatedAtDesc(patientId)
      .map(PrescriptionResponse::fromEntity)
      .orElse(null);
  }

  @Override
  public byte[] generatePrescriptionPdf(Long prescriptionId, Long requesterUserId) {
    Prescription prescription = prescriptionRepository.findById(prescriptionId)
      .orElseThrow(() -> new ResourceNotFoundException(PRESCRIPTION, prescriptionId));

    Long patientId = prescription.getAppointment().getPatientId();
    Long doctorId = prescription.getAppointment().getDoctorId();

    boolean canView = verifyViewAccess(requesterUserId, patientId, doctorId);

    if (!canView) {
      throw new AccessDeniedException("Acesso negado ao PDF da prescrição.");
    }

    Map<String, Object> data = buildPdfContext(prescription);
    return pdfGeneratorService.generatePdfFromHtml("prescription-template", data);
  }

  private boolean verifyViewAccess(Long requesterUserId, Long patientId, Long doctorId) {
    try {
      Long pId = resolvePatientId(requesterUserId);
      if (pId.equals(patientId)) return true;
    } catch (ResourceNotFoundException ignored) {
      // Ignorado enquanto consultamos o próximo médico.
    }

    try {
      Long dId = resolveDoctorId(requesterUserId);
      if (dId.equals(doctorId)) return true;
    } catch (ResourceNotFoundException ignored) {
      // Ignorado
    }

    return false;
  }

  private void validateDoctorAuthority(Appointment appointment, Long doctorProfileId) {
    if (!appointment.getDoctorId().equals(doctorProfileId)) {
      throw new AccessDeniedException("Acesso negado. Apenas o médico responsável pode realizar esta ação.");
    }
  }

  private void validateViewerAuthority(Appointment appointment, Long profileId) {
    if (!appointment.getDoctorId().equals(profileId) && !appointment.getPatientId().equals(profileId)) {
      throw new AccessDeniedException("Acesso negado. Você não tem permissão para visualizar este registro.");
    }
  }

  private List<Medicine> mapToMedicineEntities(List<MedicineRequest> dtos) {
    return dtos.stream().map(dto -> {
      Medicine med = new Medicine();
      med.setName(dto.name());
      med.setDosage(dto.dosage());
      med.setFrequency(dto.frequency());
      med.setDuration(dto.duration());
      return med;
    }).toList();
  }

  private Map<String, Object> buildPdfContext(Prescription prescription) {
    String doctorName = "Dr. Desconhecido";
    String doctorCrm = "N/A";
    String patientName = "Paciente";

    try {
      ResponseWrapper<DoctorProfile> response = profileClient.getDoctor(prescription.getAppointment().getDoctorId());
      DoctorProfile doctor = (response != null) ? response.data() : null;
      if (doctor != null) {
        doctorName = doctor.name();
        doctorCrm = doctor.crmNumber();
      }
      PatientProfile patient = profileClient.getPatient(prescription.getAppointment().getPatientId());
      if (patient != null) {
        patientName = patient.name();
      }
    } catch (Exception e) {
      log.warn("Falha ao obter dados de perfil para PDF: {}", e.getMessage());
    }

    Map<String, Object> data = new HashMap<>();
    data.put("prescriptionId", prescription.getId());
    data.put("createdAt", prescription.getCreatedAt());
    data.put("patientName", patientName);
    data.put("doctorName", doctorName);
    data.put("doctorCrm", doctorCrm);
    data.put("medicines", prescription.getMedicines());
    data.put("notes", prescription.getNotes() != null ? prescription.getNotes() : "");
    return data;
  }

  private void publishPrescriptionEvent(Prescription prescription) {
    try {
      var itemEvents = prescription.getMedicines().stream()
        .map(item -> new PrescriptionIssuedEvent.PrescriptionItemEvent(
          item.getName(), item.getDosage(), item.getFrequency(), item.getDuration()))
        .toList();

      LocalDate validUntil = prescription.getCreatedAt() != null
        ? prescription.getCreatedAt().toLocalDate().plusDays(30)
        : LocalDate.now().plusDays(30);

      String doctorName = resolveDoctorName(prescription);
      PatientEventData patientData = resolvePatientForEvent(prescription);

      PrescriptionIssuedEvent event = new PrescriptionIssuedEvent(
        prescription.getId(),
        prescription.getAppointment().getId(), // appointmentId
        prescription.getAppointment().getPatientId(),
        patientData.userId(),
        prescription.getAppointment().getDoctorId(),
        patientData.name(),
        patientData.email(),
        doctorName,
        validUntil,
        prescription.getNotes(),
        itemEvents
      );

      EventEnvelope<PrescriptionIssuedEvent> envelope = EventEnvelope.create(
        "PRESCRIPTION_ISSUED",
        UUID.randomUUID().toString(),
        event
      );

      rabbitTemplate.convertAndSend(exchange, prescriptionIssuedRoutingKey, envelope);
    } catch (Exception e) {
      log.error("Erro ao publicar evento de prescrição: {}", e.getMessage());
    }
  }

  private String resolveDoctorName(Prescription prescription) {
    try {
      DoctorReadModel doctor = doctorReadModelRepository.findById(prescription.getAppointment().getDoctorId()).orElse(null);
      if (doctor != null) {
        return doctor.getFullName();
      }
    } catch (Exception e) {
      log.warn("Erro ao buscar nome do médico: {}", e.getMessage());
    }
    return "Médico";
  }

  private PatientEventData resolvePatientForEvent(Prescription prescription) {
    String patientName = "Paciente";
    String patientEmail = null;
    Long patientUserId = null;

    try {
      PatientReadModel patient = patientReadModelRepository.findById(prescription.getAppointment().getPatientId()).orElse(null);

      if (patient != null) {
        patientName = patient.getFullName();
        patientUserId = patient.getUserId();

        if (patient.getUserId() != null) {
          try {
            UserResponse user = userFeignClient.getUserById(patient.getUserId());
            patientEmail = user != null ? user.email() : patient.getEmail();
          } catch (Exception ex) {
            log.warn("Falha ao buscar email no User Service, usando fallback local. Erro: {}", ex.getMessage());
            patientEmail = patient.getEmail();
          }
        } else {
          patientEmail = patient.getEmail();
        }
      }
    } catch (Exception e) {
      log.warn("Erro ao buscar dados do paciente/email para o evento: {}", e.getMessage());
    }
    return new PatientEventData(patientName, patientEmail, patientUserId);
  }

  private record PatientEventData(String name, String email, Long userId) {
  }
}

