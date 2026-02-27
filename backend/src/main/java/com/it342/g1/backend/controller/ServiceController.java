package com.it342.g1.backend.controller;

import com.it342.g1.backend.dto.ServiceDto;
import com.it342.g1.backend.model.ClinicService;
import com.it342.g1.backend.repository.ClinicServiceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ServiceController {
    private final ClinicServiceRepository clinicServiceRepository;

    public ServiceController(ClinicServiceRepository clinicServiceRepository) {
        this.clinicServiceRepository = clinicServiceRepository;
    }

    @GetMapping
    public ResponseEntity<List<ServiceDto>> getActiveServices() {
        List<ServiceDto> services = clinicServiceRepository.findByActiveTrue().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(services);
    }

    private ServiceDto toDto(ClinicService service) {
        return new ServiceDto(
            service.getId(),
            service.getName(),
            service.getDescription(),
            service.getDurationMinutes()
        );
    }
}

