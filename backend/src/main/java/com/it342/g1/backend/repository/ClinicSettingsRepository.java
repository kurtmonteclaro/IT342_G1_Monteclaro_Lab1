package com.it342.g1.backend.repository;

import com.it342.g1.backend.model.ClinicSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Long> {
}
