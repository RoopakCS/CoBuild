package com.cobuild.backend.user;

import com.cobuild.backend.user.dto.request.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.cobuild.backend.user.dto.response.UserProfileResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Get currently logged-in user
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {

        UserProfileResponse response =
                userService.getCurrentUserProfile();

        return ResponseEntity.ok(response);
    }

    // Update current user's profile
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {

        UserProfileResponse response =
                userService.updateProfile(request);

        return ResponseEntity.ok(response);
    }

    // Get any user's public profile
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(
            @PathVariable UUID id) {

        UserProfileResponse response =
                userService.getUserProfile(id);

        return ResponseEntity.ok(response);
    }
}