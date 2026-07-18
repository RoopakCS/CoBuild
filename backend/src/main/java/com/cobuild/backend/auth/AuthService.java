package com.cobuild.backend.auth;

import com.cobuild.backend.auth.dto.AuthResponse;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import com.cobuild.backend.user.dto.LoginRequest;
import com.cobuild.backend.user.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public AuthResponse register(RegisterRequest request) {

        // TODO:
        // 1. Check if email already exists
        // 2. Encrypt password
        // 3. Save user
        // 4. Return success response

        return AuthResponse.builder()
                .message("User Registered Successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        // TODO:
        // 1. Find user by email
        // 2. Verify password
        // 3. Generate JWT
        // 4. Return token

        return AuthResponse.builder()
                .message("Login Successful")
                .build();
    }
}