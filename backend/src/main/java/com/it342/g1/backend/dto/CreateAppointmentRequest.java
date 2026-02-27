package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentRequest {
    private Long petId;
    private Long serviceId;
    private String date; // YYYY-MM-DD
    private String time; // HH:mm or HH:mm:ss
    private String notes;
}

