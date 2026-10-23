package com.skillproof.api.service;

import com.skillproof.api.dto.AuthResponse;
import com.skillproof.api.dto.LoginRequest;
import com.skillproof.api.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}