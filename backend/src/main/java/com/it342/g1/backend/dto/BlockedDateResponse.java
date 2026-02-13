package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class BlockedDateResponse {
    private Long id;
    private LocalDate date;
    private String reason;
}
