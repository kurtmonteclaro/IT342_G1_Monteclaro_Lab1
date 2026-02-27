package com.it342.g1.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDto {
    private Long id;
    private String name;
    private String species;
    private String breed;
    private Integer age;
    private String notes;
    private String vaccineHistory;
}

