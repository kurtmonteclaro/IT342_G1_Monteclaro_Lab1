package com.it342.g1.backend.dto;

import com.it342.g1.backend.model.AppointmentStatus;
import lombok.Data;

@Data
public class AppointmentStatusRequest {
    private AppointmentStatus status;
}
