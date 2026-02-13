package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@AllArgsConstructor
public class AvailabilityResponse {
    private LocalDate date;
    private List<LocalTime> availableSlots;
}
