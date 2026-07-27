package com.cobuild.backend.workspace.dto.response;

import com.cobuild.backend.membership.MembershipRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class TeamDirectoryMemberResponse {

    private UUID userId;

    private String userName;

    private String email;

    private String profilePhotoUrl;

    private String githubUrl;

    private String linkedinUrl;

    private MembershipRole membershipRole;

    private String projectRoleTitle;

    private LocalDateTime joinedAt;

}
