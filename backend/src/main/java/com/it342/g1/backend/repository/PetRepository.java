package com.it342.g1.backend.repository;

import com.it342.g1.backend.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    Optional<Pet> findByIdAndOwnerId(Long id, Long ownerId);
}
