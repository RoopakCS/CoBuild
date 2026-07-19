package com.cobuild.backend.membership.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class MembershipResponse {

    private UUID id;

    private UUID userId;

    private String userName;

    private UUID projectId;

    private String projectTitle;

    private MembershipRole role;

    private MembershipStatus status;

    private LocalDateTime joinedAt;

}