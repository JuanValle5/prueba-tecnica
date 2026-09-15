package com.fixlat.portal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePositionRequest {

    @NotNull(message = "La posición X es obligatoria")
    private Double posX;

    @NotNull(message = "La posición Y es obligatoria")
    private Double posY;
}
