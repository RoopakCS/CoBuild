package com.cobuild.backend.membership;

import com.cobuild.backend.membership.dto.request.AddMemberRequest;
import com.cobuild.backend.membership.dto.request.MembershipActionRequest;
import com.cobuild.backend.membership.dto.response.MembershipResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    @PostMapping
    public ResponseEntity<MembershipResponse> addMember(
            @Valid @RequestBody AddMemberRequest request) {

        MembershipResponse response = membershipService.addMember(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MembershipResponse>> getProjectMembers(
            @PathVariable UUID projectId) {

        return ResponseEntity.ok(
                membershipService.getProjectMembers(projectId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MembershipResponse>> getUserMemberships(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(
                membershipService.getUserMemberships(userId));
    }

    @DeleteMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID projectId,
            @PathVariable UUID userId,
            @RequestBody(required = false) MembershipActionRequest actionRequest,
            Authentication authentication) {

        membershipService.removeMember(
                projectId,
                userId,
                authentication.getName(),
                actionRequest != null ? actionRequest.getMessage() : null);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{membershipId}/leave")
    public ResponseEntity<Void> leaveProject(
            @PathVariable UUID membershipId,
            @RequestBody(required = false) MembershipActionRequest actionRequest,
            Authentication authentication) {

        membershipService.leaveProject(
                membershipId,
                authentication.getName(),
                actionRequest != null ? actionRequest.getMessage() : null);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{membershipId}/approve-leave")
    public ResponseEntity<Void> approveLeave(
            @PathVariable UUID membershipId,
            @RequestBody(required = false) MembershipActionRequest actionRequest) {

        membershipService.approveLeave(membershipId, actionRequest != null ? actionRequest.getMessage() : null);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{membershipId}/reject-leave")
    public ResponseEntity<Void> rejectLeave(
            @PathVariable UUID membershipId,
            @RequestBody(required = false) MembershipActionRequest actionRequest) {

        membershipService.rejectLeave(membershipId, actionRequest != null ? actionRequest.getMessage() : null);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/project/{projectId}/transfer-ownership/{newOwnerUserId}")
    public ResponseEntity<Void> transferOwnership(
            @PathVariable UUID projectId,
            @PathVariable UUID newOwnerUserId,
            Authentication authentication) {

        membershipService.transferOwnership(
                projectId,
                newOwnerUserId,
                authentication.getName());

        return ResponseEntity.noContent().build();
    }
}