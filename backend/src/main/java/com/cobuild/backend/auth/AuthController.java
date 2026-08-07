package com.cobuild.backend.auth;

import com.cobuild.backend.auth.dto.request.LoginRequest;
import com.cobuild.backend.auth.dto.request.RegisterRequest;
import com.cobuild.backend.auth.dto.request.SendCodeRequest;
import com.cobuild.backend.auth.dto.request.VerifyCodeRequest;
import com.cobuild.backend.auth.dto.response.AuthResponse;
import com.cobuild.backend.exception.TooManyRequestsException;
import com.cobuild.backend.security.RateLimitingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RateLimitingService rateLimitingService;

    @PostMapping("/send-code")
    public ResponseEntity<Void> sendCode(@Valid @RequestBody SendCodeRequest request, HttpServletRequest httpRequest) {
        String ip = rateLimitingService.getClientIp(httpRequest);
        if (!rateLimitingService.resolveIpBucket(ip).tryConsume(1)) {
            throw new TooManyRequestsException("Too many requests from this IP. Please try again later.");
        }
        
        authService.sendVerificationCode(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody VerifyCodeRequest request, HttpServletRequest httpRequest) {
        String ip = rateLimitingService.getClientIp(httpRequest);
        if (!rateLimitingService.resolveIpBucket(ip).tryConsume(1)) {
            throw new TooManyRequestsException("Too many requests from this IP. Please try again later.");
        }
        
        authService.verifyCode(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request, HttpServletRequest httpRequest) {

        String ip = rateLimitingService.getClientIp(httpRequest);
        if (!rateLimitingService.resolveIpBucket(ip).tryConsume(1)) {
            throw new TooManyRequestsException("Too many requests from this IP. Please try again later.");
        }

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {

        String ip = rateLimitingService.getClientIp(httpRequest);
        if (!rateLimitingService.resolveIpBucket(ip).tryConsume(1)) {
            throw new TooManyRequestsException("Too many requests from this IP. Please try again later.");
        }

        if (!rateLimitingService.resolveLoginBucket(ip).tryConsume(1)) {
            throw new TooManyRequestsException("Too many login attempts from this IP. Please try again later.");
        }

        if (!rateLimitingService.resolveLoginBucket(request.getEmail()).tryConsume(1)) {
            throw new TooManyRequestsException("Too many login attempts for this account. Please try again later.");
        }

        return ResponseEntity.ok(authService.login(request));
    }
}