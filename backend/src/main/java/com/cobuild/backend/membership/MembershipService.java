package com.cobuild.backend.membership;

import com.cobuild.backend.membership.dto.request.AddMemberRequest;
import com.cobuild.backend.membership.dto.response.MembershipResponse;

import java.util.List;
import java.util.UUID;

public interface MembershipService {

    MembershipResponse addMember(AddMemberRequest request);

    List<MembershipResponse> getProjectMembers(UUID projectId);

    List<MembershipResponse> getUserMemberships(UUID userId);

    void removeMember(UUID projectId, UUID userId, String ownerEmail);

    void leaveProject(UUID membershipId, String userEmail);

    void transferOwnership(UUID projectId, UUID newOwnerUserId, String currentOwnerEmail);
}