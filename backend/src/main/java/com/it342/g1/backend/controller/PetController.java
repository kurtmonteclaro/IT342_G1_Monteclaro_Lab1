package com.it342.g1.backend.controller;

import com.it342.g1.backend.dto.PetDto;
import com.it342.g1.backend.model.Pet;
import com.it342.g1.backend.model.User;
import com.it342.g1.backend.repository.PetRepository;
import com.it342.g1.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PetController {
    private final PetRepository petRepository;
    private final UserRepository userRepository;

    public PetController(PetRepository petRepository, UserRepository userRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<PetDto>> getMyPets(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<PetDto> pets = petRepository.findByOwner(owner).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(pets);
    }

    @PostMapping
    public ResponseEntity<PetDto> createPet(@RequestBody PetDto dto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Pet pet = new Pet();
        pet.setOwner(owner);
        pet.setName(dto.getName());
        pet.setSpecies(dto.getSpecies());
        pet.setBreed(dto.getBreed());
        pet.setAge(dto.getAge());
        pet.setNotes(dto.getNotes());
        pet.setVaccineHistory(dto.getVaccineHistory());
        return ResponseEntity.ok(toDto(petRepository.save(pet)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetDto> updatePet(@PathVariable Long id, @RequestBody PetDto dto, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Pet pet = petRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        pet.setName(dto.getName());
        pet.setSpecies(dto.getSpecies());
        pet.setBreed(dto.getBreed());
        pet.setAge(dto.getAge());
        pet.setNotes(dto.getNotes());
        pet.setVaccineHistory(dto.getVaccineHistory());
        return ResponseEntity.ok(toDto(petRepository.save(pet)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Pet pet = petRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pet not found"));

        if (!pet.getOwner().getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        petRepository.delete(pet);
        return ResponseEntity.noContent().build();
    }

    private PetDto toDto(Pet pet) {
        return new PetDto(
            pet.getId(),
            pet.getName(),
            pet.getSpecies(),
            pet.getBreed(),
            pet.getAge(),
            pet.getNotes(),
            pet.getVaccineHistory()
        );
    }
}

