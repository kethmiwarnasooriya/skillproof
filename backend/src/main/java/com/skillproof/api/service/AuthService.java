package com.skillproof.api.service;

import com.skillproof.api.dto.AuthResponse;
import com.skillproof.api.dto.RegisterRequest;
import com.skillproof.api.entity.Role;
import com.skillproof.api.entity.User;
import com.skillproof.api.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Spring injects both dependencies via constructor injection
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(RegisterRequest request) {
        // Rule 1: Email must be unique
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Rule 2: Passwords must never be stored as plain text
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Rule 3: Map incoming request data to a persistent User entity
        User newUser = new User();
        newUser.setFullName(request.getFullName());
        newUser.setEmail(request.getEmail().toLowerCase().trim());
        newUser.setPassword(encodedPassword);
        newUser.setRole(Role.ROLE_USER);

        // Rule 4: Persist the record
        userRepository.save(newUser);

        return new AuthResponse("Registration successful", newUser.getEmail());
    }
}