package com.it342.g1.backend.config;

import com.it342.g1.backend.model.ClinicService;
import com.it342.g1.backend.model.ClinicSettings;
import com.it342.g1.backend.repository.ClinicServiceRepository;
import com.it342.g1.backend.repository.ClinicSettingsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    private final ClinicServiceRepository clinicServiceRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;

    public DataSeeder(ClinicServiceRepository clinicServiceRepository, ClinicSettingsRepository clinicSettingsRepository) {
        this.clinicServiceRepository = clinicServiceRepository;
        this.clinicSettingsRepository = clinicSettingsRepository;
    }

    @Override
    public void run(String... args) {
        if (clinicSettingsRepository.count() == 0) {
            clinicSettingsRepository.save(new ClinicSettings());
        }

        if (clinicServiceRepository.count() == 0) {
            clinicServiceRepository.saveAll(List.of(
                new ClinicService(null, "Check-up", "General health examination and wellness check.", 30, true),
                new ClinicService(null, "Vaccination", "Routine and scheduled vaccinations for pets.", 20, true),
                new ClinicService(null, "Grooming", "Basic grooming, nail trimming, and coat care.", 60, true),
                new ClinicService(null, "Deworming", "Internal parasite prevention and deworming service.", 20, true),
                new ClinicService(null, "Consultation", "Consultation for symptoms, concerns, or follow-ups.", 30, true)
            ));
        }
    }
}

