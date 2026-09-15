package com.fixlat.portal.service;

import com.fixlat.portal.dto.CreateNoteRequest;
import com.fixlat.portal.dto.NoteResponse;
import com.fixlat.portal.dto.UpdateNoteRequest;
import com.fixlat.portal.dto.UpdatePositionRequest;
import com.fixlat.portal.entity.Note;
import com.fixlat.portal.entity.NoteStatus;
import com.fixlat.portal.exception.ResourceNotFoundException;
import com.fixlat.portal.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;

    @Transactional(readOnly = true)
    public List<NoteResponse> getAllNotes() {
        return noteRepository.findAllByOrderByIdAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(Long id) {
        Note note = findNoteById(id);
        return mapToResponse(note);
    }

    @Transactional
    public NoteResponse createNote(CreateNoteRequest request) {
        Note note = Note.builder()
                .title(request.getTitle().trim())
                .content(request.getContent() != null ? request.getContent().trim() : "")
                .status(request.getStatus() != null ? request.getStatus() : NoteStatus.PENDIENTE)
                .posX(request.getPosX() != null ? request.getPosX() : 50.0)
                .posY(request.getPosY() != null ? request.getPosY() : 50.0)
                .color(StringUtils.hasText(request.getColor()) ? request.getColor() : "#FEF08A")
                .build();

        Note saved = noteRepository.save(note);
        log.info("Nota creada con ID: {}", saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    public NoteResponse updateNote(Long id, UpdateNoteRequest request) {
        Note note = findNoteById(id);

        note.setTitle(request.getTitle().trim());
        note.setContent(request.getContent() != null ? request.getContent().trim() : "");
        note.setStatus(request.getStatus());
        if (StringUtils.hasText(request.getColor())) {
            note.setColor(request.getColor());
        }

        Note updated = noteRepository.save(note);
        log.info("Nota con ID: {} actualizada", id);
        return mapToResponse(updated);
    }

    @Transactional
    public NoteResponse updatePosition(Long id, UpdatePositionRequest request) {
        Note note = findNoteById(id);

        note.setPosX(request.getPosX());
        note.setPosY(request.getPosY());

        Note updated = noteRepository.save(note);
        log.debug("Posición de la nota {} actualizada a ({}, {})", id, note.getPosX(), note.getPosY());
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteNote(Long id) {
        Note note = findNoteById(id);
        noteRepository.delete(note);
        log.info("Nota con ID: {} eliminada", id);
    }

    private Note findNoteById(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nota no encontrada con ID: " + id));
    }

    private NoteResponse mapToResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .status(note.getStatus())
                .posX(note.getPosX())
                .posY(note.getPosY())
                .color(note.getColor())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
