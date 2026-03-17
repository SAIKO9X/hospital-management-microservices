package com.hms.user.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hms.common.util.DataMaskingSerializer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangePasswordRequest(
  @NotBlank(message = "A senha atual é obrigatória.")
  @JsonSerialize(using = DataMaskingSerializer.class)
  String oldPassword,

  @NotBlank(message = "A nova senha é obrigatória.")
  @Pattern(
    regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
    message = "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial."
  )
  @JsonSerialize(using = DataMaskingSerializer.class)
  String newPassword
) {
}