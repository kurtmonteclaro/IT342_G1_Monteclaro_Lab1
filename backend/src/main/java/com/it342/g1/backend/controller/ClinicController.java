package com.it342.g1.backend.controller;

import com.it342.g1.backend.service.ClinicManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clinic")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ClinicController {
    private final ClinicManagementService clinicManagementService;

    public ClinicController(ClinicManagementService clinicManagementService) {
        this.clinicManagementService = clinicManagementService;
    }

    @GetMapping("/services")
    public ResponseEntity<?> getServices(@RequestParam(defaultValue = "false") boolean includeInactive) {
        return ResponseEntity.ok(clinicManagementService.getServices(includeInactive));
    }
}
