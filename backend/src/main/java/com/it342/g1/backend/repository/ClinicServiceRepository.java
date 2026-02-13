package com.it342.g1.backend.repository;

import com.it342.g1.backend.model.ClinicService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicServiceRepository extends JpaRepository<ClinicService, Long> {
    List<ClinicService> findByActiveTrueOrderByNameAsc();
}
