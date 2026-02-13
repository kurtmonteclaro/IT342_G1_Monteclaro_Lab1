package com.it342.g1.backend.controller;

import com.it342.g1.backend.service.AppointmentService;
import com.it342.g1.backend.service.UserAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DashboardController {
    private final AppointmentService appointmentService;
    private final UserAccessService userAccessService;

    public DashboardController(AppointmentService appointmentService, UserAccessService userAccessService) {
        this.appointmentService = appointmentService;
        this.userAccessService = userAccessService;
    }

    @GetMapping("/client")
    public ResponseEntity<?> getClientDashboard(Authentication authentication) {
        try {
            return ResponseEntity.ok(appointmentService.getClientDashboard(userAccessService.getCurrentUser(authentication)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
