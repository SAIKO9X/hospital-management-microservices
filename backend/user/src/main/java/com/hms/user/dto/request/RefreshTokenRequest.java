package com.hms.user.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hms.common.util.DataMaskingSerializer;
import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
  @NotBlank(message = "O Refresh Token é obrigatório")
  @JsonSerialize(using = DataMaskingSerializer.class)
  String refreshToken
) {
}