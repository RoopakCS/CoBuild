package com.cobuild.backend.auth;

import com.cobuild.backend.auth.dto.request.LoginRequest;
import com.cobuild.backend.auth.dto.request.RegisterRequest;
import com.cobuild.backend.auth.dto.response.AuthResponse;
import com.cobuild.backend.exception.DuplicateResourceException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.security.jwt.JwtService;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.ExperienceLevel;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cobuild.backend.auth.dto.request.SendCodeRequest;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public void sendVerificationCode(SendCodeRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        emailService.sendVerificationCode(request.getEmail(), request.getCode());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .experienceLevel(ExperienceLevel.BEGINNER)
                .build();

        User savedUser = userRepository.save(user);

        String jwtToken = jwtService.generateToken(
                new UserPrincipal(savedUser)
        );

        return AuthResponse.builder()
                .token(jwtToken)
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        String jwtToken = jwtService.generateToken(
                new UserPrincipal(user)
        );

        return AuthResponse.builder()
                .token(jwtToken)
                .message("Login successful")
                .build();
    }
}