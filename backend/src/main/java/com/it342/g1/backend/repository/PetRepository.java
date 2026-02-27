package com.it342.g1.backend.repository;

import com.it342.g1.backend.model.Pet;
import com.it342.g1.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwner(User owner);
}

