package com.hms.user.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hms.common.util.DataMaskingSerializer;
import java.time.LocalDate;

public record AdminPatientUpdateRequest(
  String name,
  @JsonSerialize(using = DataMaskingSerializer.class)
  String cpf,
  String phoneNumber,
  String address,
  String emergencyContactName,
  String emergencyContactPhone,
  String bloodGroup,
  String gender,
  LocalDate dateOfBirth,
  String chronicDiseases,
  String allergies
) {
}