package com.it342.g1.backend.service;

import com.it342.g1.backend.dto.*;
import com.it342.g1.backend.model.*;
import com.it342.g1.backend.repository.AppointmentRepository;
import com.it342.g1.backend.repository.BlockedDateRepository;
import com.it342.g1.backend.repository.ClinicServiceRepository;
import com.it342.g1.backend.repository.PetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final ClinicServiceRepository clinicServiceRepository;
    private final ClinicManagementService clinicManagementService;
    private final BlockedDateRepository blockedDateRepository;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        PetRepository petRepository,
        ClinicServiceRepository clinicServiceRepository,
        ClinicManagementService clinicManagementService,
        BlockedDateRepository blockedDateRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.petRepository = petRepository;
        this.clinicServiceRepository = clinicServiceRepository;
        this.clinicManagementService = clinicManagementService;
        this.blockedDateRepository = blockedDateRepository;
    }

    public AppointmentResponse createAppointment(User owner, AppointmentRequest request) {
        Appointment appointment = buildAppointment(owner, request, null);
        appointment.setStatus(AppointmentStatus.PENDING);
        return toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> getMyAppointments(User owner, AppointmentStatus status) {
        List<Appointment> appointments = status == null
            ? appointmentRepository.findByOwnerIdOrderByAppointmentDateAscStartTimeAsc(owner.getId())
            : appointmentRepository.findByOwnerIdAndStatusOrderByAppointmentDateAscStartTimeAsc(owner.getId(), status);
        return appointments.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AppointmentResponse cancelAppointment(User owner, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (!appointment.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Appointment not found");
        }
        appointment.setStatus(AppointmentStatus.CANCELLED);
        return toResponse(appointmentRepository.save(appointment));
    }

    public AppointmentResponse rescheduleAppointment(User owner, Long appointmentId, RescheduleRequest request) {
        Appointment existing = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (!existing.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Appointment not found");
        }

        AppointmentRequest update = new AppointmentRequest();
        update.setPetId(existing.getPet().getId());
        update.setServiceId(existing.getClinicService().getId());
        update.setDate(request.getDate());
        update.setStartTime(request.getStartTime());
        update.setNotes(existing.getNotes());

        Appointment updated = buildAppointment(owner, update, existing.getId());
        existing.setAppointmentDate(updated.getAppointmentDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setStatus(AppointmentStatus.PENDING);
        return toResponse(appointmentRepository.save(existing));
    }

    public AvailabilityResponse getAvailability(LocalDate date, Long serviceId) {
        if (date == null || serviceId == null) {
            throw new RuntimeException("Date and service are required");
        }
        ClinicService service = clinicServiceRepository.findById(serviceId)
            .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!service.getActive()) {
            return new AvailabilityResponse(date, List.of());
        }

        if (blockedDateRepository.findByDate(date).isPresent()) {
            return new AvailabilityResponse(date, List.of());
        }

        ClinicSettings settings = clinicManagementService.getOrCreateSettings();
        List<Appointment> booked = appointmentRepository.findByAppointmentDateAndStatusNotOrderByStartTimeAsc(date, AppointmentStatus.CANCELLED);

        List<LocalTime> slots = new ArrayList<>();
        LocalTime cursor = settings.getOpenTime();
        while (!cursor.plusMinutes(service.getDurationMinutes()).isAfter(settings.getCloseTime())) {
            LocalTime end = cursor.plusMinutes(service.getDurationMinutes());
            if (isOpen(booked, cursor, end, null)) {
                slots.add(cursor);
            }
            cursor = cursor.plusMinutes(settings.getSlotMinutes());
        }
        return new AvailabilityResponse(date, slots);
    }

    public List<AppointmentResponse> getPendingAppointments() {
        return appointmentRepository.findByAppointmentDateAndStatusOrderByStartTimeAsc(LocalDate.now(), AppointmentStatus.PENDING)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getTodaySchedule() {
        return appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(LocalDate.now())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AppointmentResponse updateStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus(status);
        return toResponse(appointmentRepository.save(appointment));
    }

    public DashboardResponse getClientDashboard(User owner) {
        List<AppointmentResponse> mine = getMyAppointments(owner, null);
        LocalDate today = LocalDate.now();
        AppointmentResponse next = mine.stream()
            .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
            .filter(a -> !a.getAppointmentDate().isBefore(today))
            .min(Comparator.comparing(AppointmentResponse::getAppointmentDate).thenComparing(AppointmentResponse::getStartTime))
            .orElse(null);
        List<AppointmentResponse> history = mine.stream()
            .filter(a -> a.getAppointmentDate().isBefore(today) || a.getStatus() == AppointmentStatus.COMPLETED)
            .collect(Collectors.toList());
        return new DashboardResponse(next, history, List.of(), List.of());
    }

    public DashboardResponse getAdminDashboard() {
        return new DashboardResponse(null, List.of(), getTodaySchedule(), getPendingAppointmentsAllDates());
    }

    public List<AppointmentResponse> getPendingAppointmentsAllDates() {
        return appointmentRepository.findAll().stream()
            .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
            .sorted(Comparator.comparing(Appointment::getAppointmentDate).thenComparing(Appointment::getStartTime))
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    private Appointment buildAppointment(User owner, AppointmentRequest request, Long ignoreAppointmentId) {
        if (request.getPetId() == null || request.getServiceId() == null || request.getDate() == null || request.getStartTime() == null) {
            throw new RuntimeException("Pet, service, date, and time are required");
        }
        if (blockedDateRepository.findByDate(request.getDate()).isPresent()) {
            throw new RuntimeException("Selected date is unavailable");
        }
        Pet pet = petRepository.findByIdAndOwnerId(request.getPetId(), owner.getId())
            .orElseThrow(() -> new RuntimeException("Pet not found"));
        ClinicService service = clinicServiceRepository.findById(request.getServiceId())
            .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!service.getActive()) {
            throw new RuntimeException("Service is not available");
        }

        ClinicSettings settings = clinicManagementService.getOrCreateSettings();
        LocalTime end = request.getStartTime().plusMinutes(service.getDurationMinutes());
        if (request.getStartTime().isBefore(settings.getOpenTime()) || end.isAfter(settings.getCloseTime())) {
            throw new RuntimeException("Selected time is outside clinic hours");
        }
        List<Appointment> booked = appointmentRepository.findByAppointmentDateAndStatusNotOrderByStartTimeAsc(request.getDate(), AppointmentStatus.CANCELLED);
        if (!isOpen(booked, request.getStartTime(), end, ignoreAppointmentId)) {
            throw new RuntimeException("Selected slot is already booked");
        }

        Appointment appointment = new Appointment();
        appointment.setOwner(owner);
        appointment.setPet(pet);
        appointment.setClinicService(service);
        appointment.setAppointmentDate(request.getDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(end);
        appointment.setNotes(request.getNotes());
        return appointment;
    }

    private boolean isOpen(List<Appointment> appointments, LocalTime candidateStart, LocalTime candidateEnd, Long ignoreAppointmentId) {
        for (Appointment appointment : appointments) {
            if (ignoreAppointmentId != null && ignoreAppointmentId.equals(appointment.getId())) {
                continue;
            }
            boolean overlaps = candidateStart.isBefore(appointment.getEndTime()) && candidateEnd.isAfter(appointment.getStartTime());
            if (overlaps) {
                return false;
            }
        }
        return true;
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        return new AppointmentResponse(
            appointment.getId(),
            appointment.getPet().getId(),
            appointment.getPet().getName(),
            appointment.getClinicService().getId(),
            appointment.getClinicService().getName(),
            appointment.getAppointmentDate(),
            appointment.getStartTime(),
            appointment.getEndTime(),
            appointment.getNotes(),
            appointment.getStatus(),
            appointment.getOwner().getFirstName() + " " + appointment.getOwner().getLastName()
        );
    }
}
