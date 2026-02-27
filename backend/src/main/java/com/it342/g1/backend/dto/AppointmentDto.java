package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {
    private Long id;
    private String date; // YYYY-MM-DD
    private String time; // HH:mm:ss
    private String status;
    private String notes;
    private PetSummary pet;
    private ServiceSummary service;
    private ClientSummary client; // only used for admin views

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PetSummary {
        private Long id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceSummary {
        private Long id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientSummary {
        private Long id;
        private String username;
        private String firstName;
        private String lastName;
        private String email;
    }
}

