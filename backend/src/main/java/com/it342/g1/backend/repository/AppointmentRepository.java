package com.it342.g1.backend.repository;

import com.it342.g1.backend.model.Appointment;
import com.it342.g1.backend.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByOwnerIdOrderByAppointmentDateAscStartTimeAsc(Long ownerId);
    List<Appointment> findByOwnerIdAndStatusOrderByAppointmentDateAscStartTimeAsc(Long ownerId, AppointmentStatus status);
    List<Appointment> findByAppointmentDateOrderByStartTimeAsc(LocalDate appointmentDate);
    List<Appointment> findByAppointmentDateAndStatusOrderByStartTimeAsc(LocalDate appointmentDate, AppointmentStatus status);
    List<Appointment> findByAppointmentDateAndStatusNotOrderByStartTimeAsc(LocalDate appointmentDate, AppointmentStatus status);
}
