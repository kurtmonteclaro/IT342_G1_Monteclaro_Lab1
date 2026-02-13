package com.it342.g1.backend.service;

import com.it342.g1.backend.dto.PetRequest;
import com.it342.g1.backend.dto.PetResponse;
import com.it342.g1.backend.model.Pet;
import com.it342.g1.backend.model.User;
import com.it342.g1.backend.repository.PetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {
    private final PetRepository petRepository;

    public PetService(PetRepository petRepository) {
        this.petRepository = petRepository;
    }

    public List<PetResponse> getMyPets(User owner) {
        return petRepository.findByOwnerIdOrderByCreatedAtDesc(owner.getId()).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public PetResponse createPet(User owner, PetRequest request) {
        validateRequest(request);
        Pet pet = new Pet();
        pet.setOwner(owner);
        pet.setName(request.getName());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setNotes(request.getNotes());
        pet.setVaccineHistory(request.getVaccineHistory());
        return toResponse(petRepository.save(pet));
    }

    public PetResponse updatePet(User owner, Long petId, PetRequest request) {
        validateRequest(request);
        Pet pet = petRepository.findByIdAndOwnerId(petId, owner.getId())
            .orElseThrow(() -> new RuntimeException("Pet not found"));
        pet.setName(request.getName());
        pet.setBreed(request.getBreed());
        pet.setAge(request.getAge());
        pet.setNotes(request.getNotes());
        pet.setVaccineHistory(request.getVaccineHistory());
        return toResponse(petRepository.save(pet));
    }

    public void deletePet(User owner, Long petId) {
        Pet pet = petRepository.findByIdAndOwnerId(petId, owner.getId())
            .orElseThrow(() -> new RuntimeException("Pet not found"));
        petRepository.delete(pet);
    }

    private void validateRequest(PetRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Pet name is required");
        }
        if (request.getBreed() == null || request.getBreed().isBlank()) {
            throw new RuntimeException("Breed is required");
        }
        if (request.getAge() == null || request.getAge() < 0) {
            throw new RuntimeException("Age must be 0 or greater");
        }
    }

    private PetResponse toResponse(Pet pet) {
        return new PetResponse(
            pet.getId(),
            pet.getName(),
            pet.getBreed(),
            pet.getAge(),
            pet.getNotes(),
            pet.getVaccineHistory()
        );
    }
}
