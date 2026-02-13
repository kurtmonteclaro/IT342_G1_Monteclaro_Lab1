package com.it342.g1.backend.controller;

import com.it342.g1.backend.dto.*;
import com.it342.g1.backend.service.AppointmentService;
import com.it342.g1.backend.service.ClinicManagementService;
import com.it342.g1.backend.service.UserAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {
    private final UserAccessService userAccessService;
    private final AppointmentService appointmentService;
    private final ClinicManagementService clinicManagementService;

    public AdminController(
        UserAccessService userAccessService,
        AppointmentService appointmentService,
        ClinicManagementService clinicManagementService
    ) {
        this.userAccessService = userAccessService;
        this.appointmentService = appointmentService;
        this.clinicManagementService = clinicManagementService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(appointmentService.getAdminDashboard());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/appointments/pending")
    public ResponseEntity<?> getPending(Authentication authentication) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(appointmentService.getPendingAppointmentsAllDates());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<?> getToday(Authentication authentication) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(appointmentService.getTodaySchedule());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateStatus(
        Authentication authentication,
        @PathVariable Long id,
        @RequestBody AppointmentStatusRequest request
    ) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(appointmentService.updateStatus(id, request.getStatus()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/services")
    public ResponseEntity<?> getServices(Authentication authentication) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(clinicManagementService.getServices(true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/services")
    public ResponseEntity<?> createService(Authentication authentication, @RequestBody ClinicServiceRequest request) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(clinicManagementService.createService(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<?> updateService(Authentication authentication, @PathVariable Long id, @RequestBody ClinicServiceRequest request) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(clinicManagementService.updateService(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings(Authentication authentication) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(clinicManagementService.getSettings());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(Authentication authentication, @RequestBody ClinicSettingsRequest request) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(clinicManagementService.updateSettings(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/blocked-dates")
    public ResponseEntity<?> getBlockedDates(Authentication authentication) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(clinicManagementService.getBlockedDates());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/blocked-dates")
    public ResponseEntity<?> addBlockedDate(Authentication authentication, @RequestBody BlockedDateRequest request) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            return ResponseEntity.ok(clinicManagementService.addBlockedDate(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/blocked-dates/{id}")
    public ResponseEntity<?> deleteBlockedDate(Authentication authentication, @PathVariable Long id) {
        try {
            userAccessService.requireAdmin(userAccessService.getCurrentUser(authentication));
            clinicManagementService.deleteBlockedDate(id);
            return ResponseEntity.ok("Blocked date deleted");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
