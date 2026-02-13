package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PetResponse {
    private Long id;
    private String name;
    private String breed;
    private Integer age;
    private String notes;
    private String vaccineHistory;
}
