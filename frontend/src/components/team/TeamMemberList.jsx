import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Crown, SignOut, UserMinus, WarningCircle, Users, CheckCircle, XCircle } from '@phosphor-icons/react';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { membershipsApi } from '../../api/memberships';

/**
 * Displays the team member list for a project.
 * Owner can remove members, members can leave, and the 409 ownership-transfer guard is surfaced.
 *
 * @param {{ members: object[], isOwner: boolean, currentUserId: string, projectId: string, ownerId: string }} props
 */
export function TeamMemberList({ members = [], isOwner, currentUserId, projectId, ownerId }) {
  const queryClient = useQueryClient();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, member: null });
  const [ownerLeaveError, setOwnerLeaveError] = useState('');

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['memberships', 'project', projectId] }),
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] }),
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['applications', 'project', projectId] }),
      queryClient.invalidateQueries({ queryKey: ['applications', 'me'] })
    ]);
  };

  const removeMutation = useMutation({
    mutationFn: ({ userId, message }) => membershipsApi.removeMember({ projectId, userId, message }),
    onSuccess: async () => {
      toast.success('Member removed');
      await invalidateAll();
      setConfirmModal({ isOpen: false, type: null, member: null });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove member');
      setConfirmModal({ isOpen: false, type: null, member: null });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: ({ membershipId, message }) => membershipsApi.leaveProject({ membershipId, message }),
    onSuccess: async () => {
      toast.success('Leave request submitted');
      await Promise.all([
        invalidateAll(),
        queryClient.invalidateQueries({ queryKey: ['memberships', 'user', currentUserId] })
      ]);
      setConfirmModal({ isOpen: false, type: null, member: null });
      setOwnerLeaveError('');
    },
    onError: (err) => {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message || err.response?.data?.error || '';

      setConfirmModal({ isOpen: false, type: null, member: null });

      if (status === 409) {
        // Owner tried to leave without transferring ownership
        setOwnerLeaveError(
          serverMessage || 'You must transfer ownership before leaving the project.'
        );
      } else {
        toast.error(serverMessage || 'Failed to submit leave request');
      }
    },
  });

  const approveLeaveMutation = useMutation({
    mutationFn: ({ membershipId, message }) => membershipsApi.approveLeave({ membershipId, message }),
    onSuccess: async () => {
      toast.success('Leave approved');
      await invalidateAll();
      setConfirmModal({ isOpen: false, type: '', member: null });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to approve leave');
    },
  });

  const rejectLeaveMutation = useMutation({
    mutationFn: ({ membershipId, message }) => membershipsApi.rejectLeave({ membershipId, message }),
    onSuccess: async () => {
      toast.success('Leave request rejected');
      await invalidateAll();
      setConfirmModal({ isOpen: false, type: '', member: null });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject leave');
    },
  });

  const handleConfirm = (messageText) => {
    if (confirmModal.type === 'remove') {
      removeMutation.mutate({ userId: confirmModal.member.userId, message: messageText });
    } else if (confirmModal.type === 'leave') {
      leaveMutation.mutate({ membershipId: confirmModal.member.id, message: messageText });
    } else if (confirmModal.type === 'approve') {
      approveLeaveMutation.mutate({ membershipId: confirmModal.member.id, message: messageText });
    } else if (confirmModal.type === 'reject') {
      rejectLeaveMutation.mutate({ membershipId: confirmModal.member.id, message: messageText });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const isPending = removeMutation.isPending || leaveMutation.isPending || approveLeaveMutation.isPending || rejectLeaveMutation.isPending;

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Users size={24} weight="duotone" className="text-blue-500" />
        <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Team Members</h2>
        <Badge variant="neutral" size="sm">{members.length}</Badge>
      </div>

      {/* Owner leave error (409) */}
      {ownerLeaveError && (
        <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium p-4 rounded-xl mb-5">
          <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Cannot Leave Project</p>
            <p className="text-yellow-400/80">{ownerLeaveError}</p>
          </div>
          <button
            onClick={() => setOwnerLeaveError('')}
            className="ml-auto text-yellow-500/50 hover:text-yellow-400 text-lg font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-base font-medium text-slate-500 text-center py-6">
          No team members yet.
        </p>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const isOwnerMember = m.userId === ownerId;
            const isSelf = m.userId === currentUserId;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between border border-slate-800/80 bg-slate-900/50 rounded-2xl px-4.5 py-3.5 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 hover:shadow-lg shadow-slate-950/40"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar placeholder with gradient */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-slate-800 border border-blue-500/30 flex items-center justify-center text-sm font-extrabold text-blue-500 shrink-0 shadow-md">
                    {(m.userName || '?')[0].toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-100 truncate font-display">
                        {m.userName}
                        {isSelf && <span className="text-blue-500 font-normal text-xs ml-1 bg-blue-600/15 px-1.5 py-0.5 rounded-md border border-blue-500/30">(you)</span>}
                      </span>
                      {isOwnerMember && (
                        <Badge variant="warning" size="sm">
                          <Crown size={12} weight="fill" />
                          Owner
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {m.roleTitle || 'Contributor'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 ml-3 flex gap-2">
                  {m.status === 'LEAVE_PENDING' && isOwner && !isOwnerMember && (
                    <>
                      <button
                        onClick={() =>
                          setConfirmModal({ isOpen: true, type: 'approve', member: m })
                        }
                        disabled={isPending}
                        title="Approve Leave"
                        className="flex items-center justify-center text-blue-500 hover:text-blue-400 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 w-9 h-9 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95 shadow-sm"
                      >
                        <CheckCircle size={19} weight="bold" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({ isOpen: true, type: 'reject', member: m })
                        }
                        disabled={isPending}
                        title="Reject Leave"
                        className="flex items-center justify-center text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 w-9 h-9 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95 shadow-sm"
                      >
                        <XCircle size={19} weight="bold" />
                      </button>
                    </>
                  )}

                  {m.status !== 'LEAVE_PENDING' && isOwner && !isOwnerMember && (
                    <button
                      onClick={() =>
                        setConfirmModal({ isOpen: true, type: 'remove', member: m })
                      }
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3.5 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95"
                    >
                      <UserMinus size={14} weight="bold" />
                      Remove
                    </button>
                  )}
                  {isSelf && !isOwner && m.status === 'LEAVE_PENDING' && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/20">
                      <WarningCircle size={14} weight="bold" />
                      Leave Pending
                    </div>
                  )}
                  {isSelf && !isOwner && m.status !== 'LEAVE_PENDING' && (
                    <button
                      onClick={() =>
                        setConfirmModal({ isOpen: true, type: 'leave', member: m })
                      }
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3.5 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-95"
                    >
                      <SignOut size={14} weight="bold" />
                      Request Leave
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.type === 'remove' ? 'Remove Member' : 
          confirmModal.type === 'leave' ? 'Request to Leave' :
          confirmModal.type === 'approve' ? 'Approve Leave' : 'Reject Leave'
        }
        message={
          confirmModal.type === 'remove'
            ? `Are you sure you want to remove ${confirmModal.member?.userName} from this project?`
            : confirmModal.type === 'leave'
            ? 'Are you sure you want to request to leave this project? The project owner must approve your request.'
            : confirmModal.type === 'approve'
            ? `Are you sure you want to approve ${confirmModal.member?.userName}'s request to leave? They will be removed from the project.`
            : `Are you sure you want to reject ${confirmModal.member?.userName}'s request to leave? They will remain on the project.`
        }
        requireMessage={confirmModal.type !== 'approve'}
        messagePlaceholder={
          confirmModal.type === 'remove' ? 'Reason for removal...' : 
          confirmModal.type === 'leave' ? 'Reason for leaving...' :
          confirmModal.type === 'approve' ? 'Message to developer (optional)...' : 'Reason for rejection...'
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, type: '', member: null })}
        confirmText={
          confirmModal.type === 'remove' ? 'Remove' : 
          confirmModal.type === 'leave' ? 'Request Leave' :
          confirmModal.type === 'approve' ? 'Approve' : 'Reject'
        }
        isDangerous={confirmModal.type !== 'approve'}
        isPending={isPending}
      />
    </div>
  );
}
