package com.fixlat.portal.dto;

import com.fixlat.portal.entity.NoteStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateNoteRequest {

    @NotBlank(message = "El título de la nota es obligatorio")
    private String title;

    private String content;

    @NotNull(message = "El estado de la nota es obligatorio")
    private NoteStatus status;

    private String color;
}
