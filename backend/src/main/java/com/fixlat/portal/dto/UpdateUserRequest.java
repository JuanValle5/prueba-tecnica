package com.fixlat.portal.dto;

import com.fixlat.portal.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "El correo electrónico debe ser válido")
    private String email;

    private String password;

    @NotNull(message = "El rol es obligatorio")
    private Role role;

    @NotNull(message = "El estado activo/inactivo es obligatorio")
    private Boolean active;
}
