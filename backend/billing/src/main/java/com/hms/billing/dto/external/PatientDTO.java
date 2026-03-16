package com.hms.billing.dto.external;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hms.common.util.DataMaskingSerializer;
import java.io.Serializable;

public record PatientDTO(
  Long id,
  String name,
  @JsonSerialize(using = DataMaskingSerializer.class)
  String cpf,
  String email
) implements Serializable {
}
