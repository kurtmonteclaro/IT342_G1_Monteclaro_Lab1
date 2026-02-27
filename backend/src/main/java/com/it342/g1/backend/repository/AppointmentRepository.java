package com.it342.g1.backend.repository;

import com.it342.g1.backend.model.Appointment;
import com.it342.g1.backend.model.AppointmentStatus;
import com.it342.g1.backend.model.ClinicService;
import com.it342.g1.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByClientOrderByDateAscTimeAsc(User client);

    List<Appointment> findByDateAndServiceAndStatusIn(
        LocalDate date,
        ClinicService service,
        List<AppointmentStatus> statuses
    );

    List<Appointment> findByDateOrderByTimeAsc(LocalDate date);

    List<Appointment> findByStatusOrderByDateAscTimeAsc(AppointmentStatus status);
    
    boolean existsByDateAndTimeAndServiceAndStatusIn(
        LocalDate date,
        LocalTime time,
        ClinicService service,
        List<AppointmentStatus> statuses
    );
}

