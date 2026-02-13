package com.it342.g1.backend.dto;

import lombok.Data;

@Data
public class ClinicServiceRequest {
    private String name;
    private String description;
    private Integer durationMinutes;
    private Boolean active;
}
