package com.it342.g1.backend;

import com.it342.g1.backend.model.ClinicService;
import com.it342.g1.backend.model.ClinicSettings;
import com.it342.g1.backend.model.User;
import com.it342.g1.backend.model.UserRole;
import com.it342.g1.backend.repository.ClinicServiceRepository;
import com.it342.g1.backend.repository.ClinicSettingsRepository;
import com.it342.g1.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final ClinicServiceRepository clinicServiceRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
        ClinicServiceRepository clinicServiceRepository,
        ClinicSettingsRepository clinicSettingsRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.clinicServiceRepository = clinicServiceRepository;
        this.clinicSettingsRepository = clinicSettingsRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedServices();
        seedSettings();
        seedAdmin();
    }

    private void seedServices() {
        if (clinicServiceRepository.count() > 0) {
            return;
        }

        clinicServiceRepository.save(new ClinicService(null, "Check-up", "General wellness visit", 30, true));
        clinicServiceRepository.save(new ClinicService(null, "Vaccination", "Core and booster vaccines", 20, true));
        clinicServiceRepository.save(new ClinicService(null, "Grooming", "Bath, haircut, nail trim", 60, true));
        clinicServiceRepository.save(new ClinicService(null, "Deworming", "Parasite prevention and treatment", 20, true));
        clinicServiceRepository.save(new ClinicService(null, "Consultation", "Special concerns and follow-up", 30, true));
    }

    private void seedSettings() {
        if (!clinicSettingsRepository.existsById(1L)) {
            clinicSettingsRepository.save(new ClinicSettings());
        }
    }

    private void seedAdmin() {
        String adminEmail = "admin@vetqueue.com";
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("admin1234"));
        admin.setFirstName("Clinic");
        admin.setLastName("Admin");
        admin.setRole(UserRole.ADMIN);
        userRepository.save(admin);
    }
}
