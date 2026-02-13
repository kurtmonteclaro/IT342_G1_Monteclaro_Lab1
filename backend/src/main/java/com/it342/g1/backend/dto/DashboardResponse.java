package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardResponse {
    private AppointmentResponse nextAppointment;
    private List<AppointmentResponse> history;
    private List<AppointmentResponse> todaySchedule;
    private List<AppointmentResponse> pendingRequests;
}
