package com.it342.g1.backend.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {
    private Long petId;
    private Long serviceId;
    private LocalDate date;
    private LocalTime startTime;
    private String notes;
}
