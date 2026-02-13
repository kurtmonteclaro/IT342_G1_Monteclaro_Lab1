package com.it342.g1.backend.controller;

import com.it342.g1.backend.dto.AppointmentRequest;
import com.it342.g1.backend.dto.RescheduleRequest;
import com.it342.g1.backend.model.AppointmentStatus;
import com.it342.g1.backend.service.AppointmentService;
import com.it342.g1.backend.service.UserAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AppointmentController {
    private final AppointmentService appointmentService;
    private final UserAccessService userAccessService;

    public AppointmentController(AppointmentService appointmentService, UserAccessService userAccessService) {
        this.appointmentService = appointmentService;
        this.userAccessService = userAccessService;
    }

    @PostMapping
    public ResponseEntity<?> bookAppointment(Authentication authentication, @RequestBody AppointmentRequest request) {
        try {
            return ResponseEntity.ok(appointmentService.createAppointment(userAccessService.getCurrentUser(authentication), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyAppointments(Authentication authentication, @RequestParam(required = false) AppointmentStatus status) {
        try {
            return ResponseEntity.ok(appointmentService.getMyAppointments(userAccessService.getCurrentUser(authentication), status));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(Authentication authentication, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(appointmentService.cancelAppointment(userAccessService.getCurrentUser(authentication), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
        Authentication authentication,
        @PathVariable Long id,
        @RequestBody RescheduleRequest request
    ) {
        try {
            return ResponseEntity.ok(appointmentService.rescheduleAppointment(userAccessService.getCurrentUser(authentication), id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/availability")
    public ResponseEntity<?> getAvailability(@RequestParam LocalDate date, @RequestParam Long serviceId) {
        try {
            return ResponseEntity.ok(appointmentService.getAvailability(date, serviceId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
