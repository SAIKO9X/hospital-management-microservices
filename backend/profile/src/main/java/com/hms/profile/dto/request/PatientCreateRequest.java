package com.hms.profile.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hms.common.util.DataMaskingSerializer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PatientCreateRequest(
  @NotNull(message = "O ID do usuário é obrigatório para criar um perfil.")
  Long userId,

  @NotBlank(message = "O CPF é obrigatório.")
  @JsonSerialize(using = DataMaskingSerializer.class)
  String cpf,

  @NotBlank(message = "O nome do doutor é obrigatório.")
  String name
) {
}