package com.cobuild.backend.user;

import com.cobuild.backend.user.dto.request.UpdateProfileRequest;
import com.cobuild.backend.user.dto.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getCurrentUser() {

        // TODO: Implement after JWT authentication

        return null;
    }

    public UserResponse updateProfile(UpdateProfileRequest request) {

        // TODO: Implement later

        return null;
    }

    public UserResponse getUserById(UUID id) {

        // TODO: Implement

        return null;
    }

}