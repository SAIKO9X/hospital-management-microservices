package com.hms.billing.services;

import com.hms.billing.dto.external.DoctorDTO;
import com.hms.billing.dto.external.PatientDTO;
import com.hms.billing.entities.Invoice;
import com.hms.billing.entities.PatientInsurance;
import com.hms.common.dto.response.ResponseWrapper;

import java.util.List;

public interface BillingService {
  void generateInvoiceForAppointment(Long appointmentId, String patientId, String doctorId);

  List<Invoice> getInvoicesByPatient(String patientId);

  List<Invoice> getInvoicesByDoctor(String doctorId);

  PatientInsurance registerPatientInsurance(String patientId, Long providerId, String policyNumber);

  Invoice payInvoice(Long invoiceId);

  void processInsurancePayment(Long invoiceId);

  void processAppointmentCompletion(Long appointmentId, String patientId, String doctorId);

  void compensateAppointmentCompletion(Long appointmentId);

  List<Invoice> getPendingInsuranceInvoices();

  byte[] generateInvoicePdf(Long invoiceId);

  ResponseWrapper<PatientDTO> fetchPatientByUserIdSafely(Long userId);

  ResponseWrapper<PatientDTO> fetchPatientSafely(Long patientId);

  ResponseWrapper<DoctorDTO> fetchDoctorSafely(Long doctorId);
}