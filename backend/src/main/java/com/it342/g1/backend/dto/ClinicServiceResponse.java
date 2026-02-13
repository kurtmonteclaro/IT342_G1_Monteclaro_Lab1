package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ClinicServiceResponse {
    private Long id;
    private String name;
    private String description;
    private Integer durationMinutes;
    private Boolean active;
}
