package com.cobuild.backend.auth;

import com.cobuild.backend.auth.dto.request.LoginRequest;
import com.cobuild.backend.auth.dto.request.RegisterRequest;
import com.cobuild.backend.auth.dto.request.SendCodeRequest;
import com.cobuild.backend.auth.dto.request.VerifyCodeRequest;
import com.cobuild.backend.auth.dto.response.AuthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-code")
    public ResponseEntity<Void> sendCode(@Valid @RequestBody SendCodeRequest request) {
        authService.sendVerificationCode(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        authService.verifyCode(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
}