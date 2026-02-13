package com.it342.g1.backend.dto;

import lombok.Data;

import java.time.LocalTime;

@Data
public class ClinicSettingsRequest {
    private LocalTime openTime;
    private LocalTime closeTime;
    private Integer slotMinutes;
}
