package com.it342.g1.backend.controller;

import com.it342.g1.backend.dto.AppointmentDto;
import com.it342.g1.backend.model.*;
import com.it342.g1.backend.repository.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {
    private final AppointmentRepository appointmentRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;
    private final BlockedDateRepository blockedDateRepository;
    private final UserRepository userRepository;

    public AdminController(
        AppointmentRepository appointmentRepository,
        ClinicSettingsRepository clinicSettingsRepository,
        BlockedDateRepository blockedDateRepository,
        UserRepository userRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.clinicSettingsRepository = clinicSettingsRepository;
        this.blockedDateRepository = blockedDateRepository;
        this.userRepository = userRepository;
    }

    private boolean isAdmin(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return "ADMIN".equalsIgnoreCase(user.getRole());
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<?> getTodaySchedule(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        LocalDate today = LocalDate.now();
        List<AppointmentDto> appointments = appointmentRepository.findByDateOrderByTimeAsc(today).stream()
            .map(a -> toDto(a, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/appointments/pending")
    public ResponseEntity<?> getPendingAppointments(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        List<AppointmentDto> pending = appointmentRepository.findByStatusOrderByDateAscTimeAsc(AppointmentStatus.PENDING).stream()
            .map(a -> toDto(a, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @PostMapping("/appointments/{id}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appt);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/appointments/{id}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appt);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<?> adminCancelAppointment(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        Appointment appt = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appt.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appt);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/settings")
    public ResponseEntity<ClinicSettings> getSettings(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        ClinicSettings settings = clinicSettingsRepository.findAll().stream().findFirst()
            .orElseGet(() -> clinicSettingsRepository.save(new ClinicSettings()));
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings")
    public ResponseEntity<ClinicSettings> updateSettings(@RequestBody ClinicSettings dto, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        ClinicSettings settings = clinicSettingsRepository.findAll().stream().findFirst()
            .orElseGet(ClinicSettings::new);
        settings.setOpeningTime(dto.getOpeningTime());
        settings.setClosingTime(dto.getClosingTime());
        settings.setSlotMinutes(dto.getSlotMinutes());
        return ResponseEntity.ok(clinicSettingsRepository.save(settings));
    }

    @GetMapping("/blocked-dates")
    public ResponseEntity<List<BlockedDate>> getBlockedDates(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(blockedDateRepository.findAll());
    }

    @PostMapping("/blocked-dates")
    public ResponseEntity<?> addBlockedDate(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        Authentication authentication
    ) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        if (blockedDateRepository.findByDate(date).isEmpty()) {
            BlockedDate bd = new BlockedDate();
            bd.setDate(date);
            blockedDateRepository.save(bd);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/blocked-dates/{id}")
    public ResponseEntity<?> removeBlockedDate(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        blockedDateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private AppointmentDto toDto(Appointment a, boolean includeClient) {
        AppointmentDto.ClientSummary client = null;
        if (includeClient) {
            client = new AppointmentDto.ClientSummary(
                a.getClient().getId(),
                a.getClient().getUsername(),
                a.getClient().getFirstName(),
                a.getClient().getLastName(),
                a.getClient().getEmail()
            );
        }
        return new AppointmentDto(
            a.getId(),
            a.getDate().toString(),
            a.getTime().toString(),
            a.getStatus().name(),
            a.getNotes(),
            new AppointmentDto.PetSummary(a.getPet().getId(), a.getPet().getName()),
            new AppointmentDto.ServiceSummary(a.getService().getId(), a.getService().getName()),
            client
        );
    }
}

