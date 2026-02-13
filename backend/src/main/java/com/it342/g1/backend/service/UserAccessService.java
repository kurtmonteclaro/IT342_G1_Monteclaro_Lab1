package com.it342.g1.backend.service;

import com.it342.g1.backend.model.User;
import com.it342.g1.backend.model.UserRole;
import com.it342.g1.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class UserAccessService {
    private final UserRepository userRepository;

    public UserAccessService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }
        Long userId = (Long) authentication.getPrincipal();
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void requireAdmin(User user) {
        if (user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
    }
}
