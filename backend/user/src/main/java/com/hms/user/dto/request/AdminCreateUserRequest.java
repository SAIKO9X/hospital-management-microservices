package com.hms.user.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hms.common.util.DataMaskingSerializer;
import com.hms.user.enums.UserRole;
import jakarta.validation.constraints.*;

public record AdminCreateUserRequest(
  @NotBlank(message = "O nome é obrigatório")
  String name,

  @NotBlank(message = "O email é obrigatório")
  @Email(message = "Email inválido")
  String email,

  @NotBlank(message = "A senha é obrigatória")
  @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
  @JsonSerialize(using = DataMaskingSerializer.class)
  String password,

  @NotNull(message = "O tipo de utilizador é obrigatório")
  UserRole role,

  @Pattern(regexp = "^$|^\\d{11}$", message = "CPF deve conter 11 dígitos")
  @JsonSerialize(using = DataMaskingSerializer.class)
  String cpf,

  @Pattern(regexp = "^$|^\\d{4,10}$", message = "CRM deve conter de 4 a 10 dígitos")
  String crmNumber,

  String specialization
) {
}