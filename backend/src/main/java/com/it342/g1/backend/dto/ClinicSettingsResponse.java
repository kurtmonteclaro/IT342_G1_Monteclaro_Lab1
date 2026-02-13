package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalTime;

@Data
@AllArgsConstructor
public class ClinicSettingsResponse {
    private LocalTime openTime;
    private LocalTime closeTime;
    private Integer slotMinutes;
}
