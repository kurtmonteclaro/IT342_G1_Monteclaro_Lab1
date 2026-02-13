package com.it342.g1.backend.dto;

import com.it342.g1.backend.model.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private Long petId;
    private String petName;
    private Long serviceId;
    private String serviceName;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String notes;
    private AppointmentStatus status;
    private String ownerName;
}
