package com.it342.g1.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BlockedDateRequest {
    private LocalDate date;
    private String reason;
}
