package com.it342.g1.backend.controller;

import com.it342.g1.backend.dto.PetRequest;
import com.it342.g1.backend.service.PetService;
import com.it342.g1.backend.service.UserAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PetController {
    private final PetService petService;
    private final UserAccessService userAccessService;

    public PetController(PetService petService, UserAccessService userAccessService) {
        this.petService = petService;
        this.userAccessService = userAccessService;
    }

    @GetMapping
    public ResponseEntity<?> getMyPets(Authentication authentication) {
        try {
            return ResponseEntity.ok(petService.getMyPets(userAccessService.getCurrentUser(authentication)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createPet(Authentication authentication, @RequestBody PetRequest request) {
        try {
            return ResponseEntity.ok(petService.createPet(userAccessService.getCurrentUser(authentication), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePet(Authentication authentication, @PathVariable Long id, @RequestBody PetRequest request) {
        try {
            return ResponseEntity.ok(petService.updatePet(userAccessService.getCurrentUser(authentication), id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePet(Authentication authentication, @PathVariable Long id) {
        try {
            petService.deletePet(userAccessService.getCurrentUser(authentication), id);
            return ResponseEntity.ok("Pet deleted");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
