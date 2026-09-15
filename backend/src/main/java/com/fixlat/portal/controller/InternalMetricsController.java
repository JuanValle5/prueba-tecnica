package com.fixlat.portal.controller;

import com.fixlat.portal.entity.Note;
import com.fixlat.portal.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class InternalMetricsController {

    private final NoteRepository noteRepository;

    @GetMapping("/raw")
    public ResponseEntity<Map<String, Object>> getRawMetricsData() {
        List<Note> notes = noteRepository.findAll();
        Map<String, Object> data = new HashMap<>();
        data.put("total", notes.size());
        data.put("notes", notes.stream().map(n -> Map.of(
                "id", n.getId(),
                "title", n.getTitle(),
                "status", n.getStatus().name()
        )).toList());
        return ResponseEntity.ok(data);
    }
}
