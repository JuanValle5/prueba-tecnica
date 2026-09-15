package com.fixlat.portal.controller;

import com.fixlat.portal.dto.CreateNoteRequest;
import com.fixlat.portal.dto.NoteResponse;
import com.fixlat.portal.dto.UpdateNoteRequest;
import com.fixlat.portal.dto.UpdatePositionRequest;
import com.fixlat.portal.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponse> getNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNoteById(id));
    }

    @PostMapping
    public ResponseEntity<NoteResponse> createNote(@Valid @RequestBody CreateNoteRequest request) {
        return new ResponseEntity<>(noteService.createNote(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody UpdateNoteRequest request
    ) {
        return ResponseEntity.ok(noteService.updateNote(id, request));
    }

    @PatchMapping("/{id}/position")
    public ResponseEntity<NoteResponse> updatePosition(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePositionRequest request
    ) {
        return ResponseEntity.ok(noteService.updatePosition(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
