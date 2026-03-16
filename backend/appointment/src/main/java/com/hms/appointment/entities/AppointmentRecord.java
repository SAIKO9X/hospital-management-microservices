package com.hms.appointment.entities;

import com.hms.appointment.util.StringListConverter;
import com.hms.common.util.CryptoConverter;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tb_appointment_records")
public class AppointmentRecord {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "appointment_id", unique = true, nullable = false)
  private Appointment appointment;

  @Column(nullable = false)
  @Convert(converter = CryptoConverter.class)
  private String chiefComplaint; // queixa principal

  @Column(columnDefinition = "TEXT")
  @Convert(converter = CryptoConverter.class)
  private String historyOfPresentIllness; // HMA - história da doença atual

  @Column(columnDefinition = "TEXT")
  @Convert(converter = CryptoConverter.class)
  private String physicalExamNotes;

  @Convert(converter = StringListConverter.class)
  private List<String> symptoms; // tags de sintomas (ex: ["Febre", "Tosse"])

  private String diagnosisCid10; // código CID-10 (ex: J00)

  @Convert(converter = CryptoConverter.class)
  private String diagnosisDescription;

  @Column(columnDefinition = "TEXT")
  @Convert(converter = CryptoConverter.class)
  private String treatmentPlan;

  @Convert(converter = StringListConverter.class)
  private List<String> requestedTests;

  @Column(columnDefinition = "TEXT")
  @Convert(converter = CryptoConverter.class)
  private String notes; // observações gerais

  @CreationTimestamp
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;
}