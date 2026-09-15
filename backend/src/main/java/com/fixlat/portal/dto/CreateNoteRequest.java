package com.fixlat.portal.dto;

import com.fixlat.portal.entity.NoteStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateNoteRequest {

    @NotBlank(message = "El título de la nota es obligatorio")
    private String title;

    private String content;

    private NoteStatus status = NoteStatus.PENDIENTE;

    private Double posX = 50.0;

    private Double posY = 50.0;

    private String color = "#FEF08A";
}
