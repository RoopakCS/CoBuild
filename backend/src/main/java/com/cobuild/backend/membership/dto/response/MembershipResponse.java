package com.cobuild.backend.membership.dto.response;

import com.cobuild.backend.membership.MembershipRole;
import com.cobuild.backend.membership.MembershipStatus;
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

    private String statusMessage;

    private LocalDateTime joinedAt;

}