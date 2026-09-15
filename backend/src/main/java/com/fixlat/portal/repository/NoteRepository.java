package com.fixlat.portal.repository;

import com.fixlat.portal.entity.Note;
import com.fixlat.portal.entity.NoteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findAllByOrderByIdAsc();

    long countByStatus(NoteStatus status);
}
