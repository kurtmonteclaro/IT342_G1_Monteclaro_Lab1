package com.it342.g1.backend.repository;

import com.it342.g1.backend.model.BlockedDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface BlockedDateRepository extends JpaRepository<BlockedDate, Long> {
    Optional<BlockedDate> findByDate(LocalDate date);
}
