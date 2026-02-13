package com.it342.g1.backend.service;

import com.it342.g1.backend.dto.*;
import com.it342.g1.backend.model.BlockedDate;
import com.it342.g1.backend.model.ClinicService;
import com.it342.g1.backend.model.ClinicSettings;
import com.it342.g1.backend.repository.BlockedDateRepository;
import com.it342.g1.backend.repository.ClinicServiceRepository;
import com.it342.g1.backend.repository.ClinicSettingsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ClinicManagementService {
    private final ClinicServiceRepository clinicServiceRepository;
    private final ClinicSettingsRepository clinicSettingsRepository;
    private final BlockedDateRepository blockedDateRepository;

    public ClinicManagementService(
        ClinicServiceRepository clinicServiceRepository,
        ClinicSettingsRepository clinicSettingsRepository,
        BlockedDateRepository blockedDateRepository
    ) {
        this.clinicServiceRepository = clinicServiceRepository;
        this.clinicSettingsRepository = clinicSettingsRepository;
        this.blockedDateRepository = blockedDateRepository;
    }

    public List<ClinicServiceResponse> getServices(boolean includeInactive) {
        List<ClinicService> services = includeInactive
            ? clinicServiceRepository.findAll()
            : clinicServiceRepository.findByActiveTrueOrderByNameAsc();
        return services.stream().map(this::toServiceResponse).collect(Collectors.toList());
    }

    public ClinicServiceResponse createService(ClinicServiceRequest request) {
        validateServiceRequest(request);
        ClinicService service = new ClinicService();
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setActive(request.getActive() == null || request.getActive());
        return toServiceResponse(clinicServiceRepository.save(service));
    }

    public ClinicServiceResponse updateService(Long serviceId, ClinicServiceRequest request) {
        validateServiceRequest(request);
        ClinicService service = clinicServiceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setActive(request.getActive() == null || request.getActive());
        return toServiceResponse(clinicServiceRepository.save(service));
    }

    public ClinicSettings getOrCreateSettings() {
        return clinicSettingsRepository.findById(1L).orElseGet(() -> clinicSettingsRepository.save(new ClinicSettings()));
    }

    public ClinicSettingsResponse getSettings() {
        ClinicSettings settings = getOrCreateSettings();
        return new ClinicSettingsResponse(settings.getOpenTime(), settings.getCloseTime(), settings.getSlotMinutes());
    }

    public ClinicSettingsResponse updateSettings(ClinicSettingsRequest request) {
        if (request.getOpenTime() == null || request.getCloseTime() == null || request.getSlotMinutes() == null) {
            throw new RuntimeException("Open time, close time, and slot minutes are required");
        }
        if (!request.getOpenTime().isBefore(request.getCloseTime())) {
            throw new RuntimeException("Open time must be before close time");
        }
        if (request.getSlotMinutes() <= 0) {
            throw new RuntimeException("Slot minutes must be greater than zero");
        }
        ClinicSettings settings = getOrCreateSettings();
        settings.setOpenTime(request.getOpenTime());
        settings.setCloseTime(request.getCloseTime());
        settings.setSlotMinutes(request.getSlotMinutes());
        clinicSettingsRepository.save(settings);
        return new ClinicSettingsResponse(settings.getOpenTime(), settings.getCloseTime(), settings.getSlotMinutes());
    }

    public List<BlockedDateResponse> getBlockedDates() {
        return blockedDateRepository.findAll().stream()
            .map(b -> new BlockedDateResponse(b.getId(), b.getDate(), b.getReason()))
            .collect(Collectors.toList());
    }

    public BlockedDateResponse addBlockedDate(BlockedDateRequest request) {
        if (request.getDate() == null) {
            throw new RuntimeException("Date is required");
        }
        if (blockedDateRepository.findByDate(request.getDate()).isPresent()) {
            throw new RuntimeException("Date is already blocked");
        }
        BlockedDate blockedDate = new BlockedDate();
        blockedDate.setDate(request.getDate());
        blockedDate.setReason(request.getReason());
        BlockedDate saved = blockedDateRepository.save(blockedDate);
        return new BlockedDateResponse(saved.getId(), saved.getDate(), saved.getReason());
    }

    public void deleteBlockedDate(Long id) {
        if (!blockedDateRepository.existsById(id)) {
            throw new RuntimeException("Blocked date not found");
        }
        blockedDateRepository.deleteById(id);
    }

    private void validateServiceRequest(ClinicServiceRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Service name is required");
        }
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new RuntimeException("Service duration must be greater than zero");
        }
    }

    private ClinicServiceResponse toServiceResponse(ClinicService service) {
        return new ClinicServiceResponse(
            service.getId(),
            service.getName(),
            service.getDescription(),
            service.getDurationMinutes(),
            service.getActive()
        );
    }
}
