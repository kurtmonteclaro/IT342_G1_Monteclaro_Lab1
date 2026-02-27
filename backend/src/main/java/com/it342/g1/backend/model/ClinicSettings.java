package com.it342.g1.backend.model;

import jakarta.persistence.*;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalTime openingTime = LocalTime.of(9, 0);

    @Column(nullable = false)
    private LocalTime closingTime = LocalTime.of(17, 0);

    @Column(nullable = false)
    private Integer slotMinutes = 30;
}

