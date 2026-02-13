package com.it342.g1.backend.dto;

import lombok.Data;

@Data
public class PetRequest {
    private String name;
    private String breed;
    private Integer age;
    private String notes;
    private String vaccineHistory;
}
