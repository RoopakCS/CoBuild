package com.cobuild.backend.membership.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipActionRequest {
    
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;
}
