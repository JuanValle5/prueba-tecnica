package com.fixlat.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {

    @NotBlank(message = "El correo electrónico es requerido")
    @Email(message = "El formato de correo no es válido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;
}
