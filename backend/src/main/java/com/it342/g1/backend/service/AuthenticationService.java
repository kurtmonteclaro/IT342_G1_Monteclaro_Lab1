package com.it342.g1.backend.service;

import com.it342.g1.backend.dto.LoginRequest;
import com.it342.g1.backend.dto.LoginResponse;
import com.it342.g1.backend.dto.RegisterRequest;
import com.it342.g1.backend.dto.UserDto;
import com.it342.g1.backend.model.AuthProvider;
import com.it342.g1.backend.model.User;
import com.it342.g1.backend.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setGoogleId(null);
        String role = "CLIENT";
        if (request.getRole() != null && "ADMIN".equalsIgnoreCase(request.getRole())) {
            role = "ADMIN";
        }
        user.setRole(role);

        return userRepository.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());

        return response;
    }

    public LoginResponse loginWithGoogleUser(OAuth2User oauth2User) {
        String googleId = oauth2User.getAttribute("sub");
        String email = oauth2User.getAttribute("email");

        if (googleId == null || googleId.isBlank()) {
            throw new RuntimeException("Google account id is missing");
        }
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Google account email is missing");
        }

        Map<String, Object> attributes = oauth2User.getAttributes();

        User user = userRepository.findByGoogleId(googleId)
            .or(() -> userRepository.findByEmail(email))
            .orElseGet(() -> createGoogleUser(attributes, googleId, email));

        if (user.getGoogleId() == null || user.getGoogleId().isBlank()) {
            user.setGoogleId(googleId);
        }
        user.setAuthProvider(AuthProvider.GOOGLE);
        user = userRepository.save(user);

        return toLoginResponse(user);
    }

    private User createGoogleUser(Map<String, Object> attributes, String googleId, String email) {
        User user = new User();
        user.setGoogleId(googleId);
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setEmail(email);
        user.setRole("CLIENT");

        String firstName = getStringAttribute(attributes, "given_name", "firstName");
        String lastName = getStringAttribute(attributes, "family_name", "lastName");
        String fullName = getStringAttribute(attributes, "name");

        if (isBlank(firstName) && !isBlank(fullName)) {
            String[] nameParts = fullName.trim().split("\\s+", 2);
            firstName = nameParts[0];
            if (nameParts.length > 1 && isBlank(lastName)) {
                lastName = nameParts[1];
            }
        }
        if (isBlank(firstName)) {
            firstName = "Google";
        }
        if (isBlank(lastName)) {
            lastName = "User";
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUsername(generateUsernameFromEmail(email));
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

        return userRepository.save(user);
    }

    private String generateUsernameFromEmail(String email) {
        String base = email.split("@")[0]
            .toLowerCase()
            .replaceAll("[^a-z0-9._-]", "");
        if (base.isBlank()) {
            base = "user";
        }

        String candidate = base;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + counter;
            counter++;
        }
        return candidate;
    }

    private String getStringAttribute(Map<String, Object> attributes, String... keys) {
        for (String key : keys) {
            Object value = attributes.get(key);
            if (value instanceof String) {
                String text = ((String) value).trim();
                if (!text.isBlank()) {
                    return text;
                }
            }
        }
        return "";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private LoginResponse toLoginResponse(User user) {
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRole(user.getRole());
        return response;
    }

    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole());

        return dto;
    }
}
