package com.fixlat.portal.dto;

import com.fixlat.portal.entity.NoteStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private NoteStatus status;
    private Double posX;
    private Double posY;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
