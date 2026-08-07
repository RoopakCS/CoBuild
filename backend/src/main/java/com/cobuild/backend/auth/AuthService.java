package com.cobuild.backend.auth;

import com.cobuild.backend.auth.dto.request.LoginRequest;
import com.cobuild.backend.auth.dto.request.RegisterRequest;
import com.cobuild.backend.auth.dto.request.SendCodeRequest;
import com.cobuild.backend.auth.dto.request.VerifyCodeRequest;
import com.cobuild.backend.auth.dto.response.AuthResponse;
import com.cobuild.backend.exception.BadRequestException;
import com.cobuild.backend.exception.DuplicateResourceException;
import com.cobuild.backend.exception.ResourceNotFoundException;
import com.cobuild.backend.exception.TooManyRequestsException;
import com.cobuild.backend.security.RateLimitingService;
import com.cobuild.backend.security.jwt.JwtService;
import com.cobuild.backend.security.user.UserPrincipal;
import com.cobuild.backend.user.ExperienceLevel;
import com.cobuild.backend.user.User;
import com.cobuild.backend.user.UserRepository;
import io.github.bucket4j.Bucket;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

import java.security.SecureRandom;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_VERIFY_ATTEMPTS = 5;
    /** Verified row must be no older than this many minutes to allow registration. */
    private static final int VERIFIED_WINDOW_MINUTES = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final EmailVerificationRepository emailVerificationRepository;
    private final RateLimitingService rateLimitingService;

    @Transactional
    public void sendVerificationCode(SendCodeRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        Bucket bucket = rateLimitingService.resolveOtpBucket(request.getEmail());
        if (!bucket.tryConsume(1)) {
            throw new TooManyRequestsException(
                    "Too many verification requests. Please wait a minute before requesting a new code.");
        }

        String plainCode = generateSixDigitCode();
        String codeHash = passwordEncoder.encode(plainCode);

        EmailVerification verification = EmailVerification.builder()
                .email(request.getEmail())
                .codeHash(codeHash)
                .expiresAt(Instant.now().plusSeconds(OTP_EXPIRY_MINUTES * 60L))
                .build();

        emailVerificationRepository.save(verification);
        emailService.sendVerificationCode(request.getEmail(), plainCode);
    }

    @Transactional
    public void verifyCode(VerifyCodeRequest request) {
        EmailVerification verification = emailVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No verification code found for this email"));

        if (verification.isVerified()) {
            throw new BadRequestException("This code has already been used");
        }
        if (Instant.now().isAfter(verification.getExpiresAt())) {
            throw new BadRequestException("Verification code has expired. Please request a new one");
        }
        if (verification.getAttempts() >= MAX_VERIFY_ATTEMPTS) {
            log.warn("OTP lockout | Email: {} | Attempts: {}", request.getEmail(), verification.getAttempts());
            throw new BadRequestException(
                    "Too many failed attempts. Please request a new verification code");
        }

        if (!passwordEncoder.matches(request.getCode(), verification.getCodeHash())) {
            verification.setAttempts(verification.getAttempts() + 1);
            emailVerificationRepository.save(verification);
            int remaining = MAX_VERIFY_ATTEMPTS - verification.getAttempts();
            log.warn("OTP verification failed | Email: {} | Remaining Attempts: {}", request.getEmail(), remaining);
            throw new BadRequestException(
                    "Invalid verification code. " + remaining + " attempt(s) remaining");
        }

        log.info("OTP verification successful | Email: {}", request.getEmail());

        verification.setVerified(true);
        emailVerificationRepository.save(verification);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        EmailVerification verification = emailVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new BadRequestException(
                        "Email address has not been verified. Please request and enter a verification code first"));

        Instant cutoff = Instant.now().minusSeconds(VERIFIED_WINDOW_MINUTES * 60L);
        if (!verification.isVerified() || verification.getCreatedAt().isBefore(cutoff)) {
            throw new BadRequestException(
                    "Email address has not been verified. Please request and enter a verification code first");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .experienceLevel(ExperienceLevel.BEGINNER)
                .build();

        User savedUser = userRepository.save(user);

        String jwtToken = jwtService.generateToken(new UserPrincipal(savedUser));

        return AuthResponse.builder()
                .token(jwtToken)
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.warn("Failed login attempt | Email: {} | Reason: {}", request.getEmail(), e.getMessage());
            throw e;
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String jwtToken = jwtService.generateToken(new UserPrincipal(user));

        return AuthResponse.builder()
                .token(jwtToken)
                .message("Login successful")
                .build();
    }

    private String generateSixDigitCode() {
        SecureRandom random = new SecureRandom();
        int code = 100_000 + random.nextInt(900_000);
        return String.valueOf(code);
    }
}