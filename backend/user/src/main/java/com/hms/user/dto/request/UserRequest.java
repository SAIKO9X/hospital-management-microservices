package com.hms.user.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hms.common.util.DataMaskingSerializer;
import com.hms.user.entities.User;
import com.hms.user.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UserRequest(
  @NotBlank(message = "O nome não pode ser vazio")
  String name,

  @Email(message = "O email deve ser válido")
  String email,

  @NotBlank(message = "A senha é obrigatória.")
  @Pattern(
    regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
    message = "A senha deve conter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial"
  )
  @JsonSerialize(using = DataMaskingSerializer.class)
  String password,

  UserRole role,

  String cpfOuCrm
) {

  public User toEntity() {
    User user = new User();
    user.setName(this.name);
    user.setEmail(this.email);
    user.setPassword(this.password);
    user.setRole(this.role);
    user.setActive(false);
    return user;
  }
}