package com.it342.g1.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "clinic_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicSettings {
    @Id
    private Long id = 1L;

    private LocalTime openTime = LocalTime.of(9, 0);

    private LocalTime closeTime = LocalTime.of(17, 0);

    private Integer slotMinutes = 30;
}
