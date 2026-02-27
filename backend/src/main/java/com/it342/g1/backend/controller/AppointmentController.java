package com.it342.g1.backend.controller;

import com.it342.g1.backend.dto.AppointmentDto;
import com.it342.g1.backend.dto.CreateAppointmentRequest;
import com.it342.g1.backend.model.*;
import com.it342.g1.backend.repository.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AppointmentController {
    private final AppointmentRepository appointmentRepository;
    private final ClinicServiceRepository clinicServiceRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;
    private final BlockedDateRepository blockedDateRepository;

    public AppointmentController(
        AppointmentRepository appointmentRepository,
        ClinicServiceRepository clinicServiceRepository,
        PetRepository petRepository,
        UserRepository userRepository,
        ClinicSettingsRepository clinicSettingsRepository,
        BlockedDateRepository blockedDateRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.clinicServiceRepository = clinicServiceRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.clinicSettingsRepository = clinicSettingsRepository;
        this.blockedDateRepository = blockedDateRepository;
    }

    @GetMapping("/appointments/mine")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User client = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<AppointmentDto> appointments = appointmentRepository.findByClientOrderByDateAscTimeAsc(client).stream()
            .map(a -> toDto(a, false))
            .collect(Collectors.toList());
        return ResponseEntity.ok(appointments);
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody CreateAppointmentRequest request, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User client = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Pet pet = petRepository.findById(request.getPetId())
            .orElseThrow(() -> new RuntimeException("Pet not found"));
        if (!pet.getOwner().getId().equals(userId)) {
            return ResponseEntity.status(403).body("You can only book for your own pets");
        }

        ClinicService service = clinicServiceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new RuntimeException("Service not found"));

        LocalDate date = LocalDate.parse(request.getDate());
        LocalTime time = LocalTime.parse(request.getTime());

        if (blockedDateRepository.findByDate(date).isPresent()) {
            return ResponseEntity.badRequest().body("Clinic is closed on this date");
        }

        List<AppointmentStatus> busyStatuses = List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);
        if (appointmentRepository.existsByDateAndTimeAndServiceAndStatusIn(date, time, service, busyStatuses)) {
            return ResponseEntity.badRequest().body("Time slot already booked");
        }

        Appointment appointment = new Appointment();
        appointment.setClient(client);
        appointment.setPet(pet);
        appointment.setService(service);
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setNotes(request.getNotes());

        return ResponseEntity.ok(toDto(appointmentRepository.save(appointment), false));
    }

    @PostMapping("/appointments/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        boolean isOwner = appointment.getClient().getId().equals(userId);
        if (!isOwner) {
            return ResponseEntity.status(403).build();
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.CANCELLED) {
            return ResponseEntity.badRequest().body("Cannot cancel completed or cancelled appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/appointments/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
        @PathVariable Long id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
        Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();
        Appointment appointment = appointmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));

        boolean isOwner = appointment.getClient().getId().equals(userId);
        if (!isOwner) {
            return ResponseEntity.status(403).build();
        }

        if (blockedDateRepository.findByDate(date).isPresent()) {
            return ResponseEntity.badRequest().body("Clinic is closed on this date");
        }

        List<AppointmentStatus> busyStatuses = List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);
        if (appointmentRepository.existsByDateAndTimeAndServiceAndStatusIn(date, time, appointment.getService(), busyStatuses)) {
            return ResponseEntity.badRequest().body("Time slot already booked");
        }

        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointmentRepository.save(appointment);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/availability")
    public ResponseEntity<List<String>> getAvailability(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam Long serviceId
    ) {
        if (blockedDateRepository.findByDate(date).isPresent()) {
            return ResponseEntity.ok(List.of());
        }

        ClinicService service = clinicServiceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));

        ClinicSettings settings = clinicSettingsRepository.findAll().stream().findFirst()
            .orElseGet(() -> clinicSettingsRepository.save(new ClinicSettings()));

        List<AppointmentStatus> busyStatuses = List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);
        List<Appointment> existing = appointmentRepository.findByDateAndServiceAndStatusIn(date, service, busyStatuses);
        List<LocalTime> takenTimes = existing.stream().map(Appointment::getTime).collect(Collectors.toList());

        List<String> slots = new ArrayList<>();
        LocalTime time = settings.getOpeningTime();
        while (!time.isAfter(settings.getClosingTime().minusMinutes(settings.getSlotMinutes()))) {
            if (!takenTimes.contains(time)) {
                slots.add(time.toString());
            }
            time = time.plusMinutes(settings.getSlotMinutes());
        }

        return ResponseEntity.ok(slots);
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

