import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SignOut, UserMinus, WarningCircle, CheckCircle, XCircle } from '@phosphor-icons/react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { membershipsApi } from '../../api/memberships';

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
        setOwnerLeaveError(serverMessage || 'You must transfer ownership before leaving the project.');
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

  const isPending = removeMutation.isPending || leaveMutation.isPending || approveLeaveMutation.isPending || rejectLeaveMutation.isPending;

  return (
    <div className="surface-1 p-8 rounded-lg">
      <h3 className="headline-lg tracking-[-0.02em] mb-8 text-primary">Core Team</h3>

      {/* Owner leave error (409) */}
      {ownerLeaveError && (
        <div className="flex items-start gap-2.5 bg-warning-amber/10 border border-warning-amber/20 text-warning-amber body-sm p-4 rounded-sm mb-6">
          <WarningCircle size={20} weight="fill" className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold mb-1">Cannot Leave Project</p>
            <p className="opacity-80">{ownerLeaveError}</p>
          </div>
          <button
            onClick={() => setOwnerLeaveError('')}
            className="text-warning-amber/50 hover:text-warning-amber font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {members.length === 0 ? (
        <p className="body-md font-medium text-text-muted py-2">
          No team members yet.
        </p>
      ) : (
        <div className="space-y-6">
          {members.map((m) => {
            const isOwnerMember = m.userId === ownerId;
            const isSelf = m.userId === currentUserId;

            return (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-border-subtle bg-surface flex items-center justify-center font-bold text-sm text-primary uppercase shrink-0">
                    {(m.userName || '?')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="body-md font-bold tracking-tight text-primary">
                        {m.userName}
                        {isSelf && <span className="text-text-muted font-normal text-xs ml-1">(you)</span>}
                      </p>
                    </div>
                    <p className="label-mono text-[9px] text-text-muted uppercase tracking-widest mt-0.5 truncate">
                      {isOwnerMember ? 'Owner / Creator' : (m.roleTitle || 'Contributor')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {m.status === 'LEAVE_PENDING' && isOwner && !isOwnerMember && (
                    <>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, type: 'approve', member: m })}
                        disabled={isPending}
                        title="Approve Leave"
                        className="btn-primary w-8 h-8 !px-0 rounded-sm disabled:opacity-50"
                      >
                        <CheckCircle size={16} weight="bold" />
                      </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, type: 'reject', member: m })}
                        disabled={isPending}
                        title="Reject Leave"
                        className="btn-secondary text-error border-error/20 hover:bg-error-container w-8 h-8 !px-0 rounded-sm disabled:opacity-50"
                      >
                        <XCircle size={16} weight="bold" />
                      </button>
                    </>
                  )}

                  {m.status !== 'LEAVE_PENDING' && isOwner && !isOwnerMember && (
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, type: 'remove', member: m })}
                      disabled={isPending}
                      className="btn-secondary text-xs uppercase tracking-widest text-error border-error/20 hover:bg-error-container"
                    >
                      <UserMinus size={14} weight="bold" className="mr-1 inline-block -mt-0.5" />
                      Remove
                    </button>
                  )}
                  
                  {isSelf && !isOwner && m.status === 'LEAVE_PENDING' && (
                    <div className="label-mono text-warning-amber bg-warning-amber/10 px-2 py-1 rounded-sm border border-warning-amber/20 font-bold">
                      Leave Pending
                    </div>
                  )}
                  
                  {isSelf && !isOwner && m.status !== 'LEAVE_PENDING' && (
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, type: 'leave', member: m })}
                      disabled={isPending}
                      className="btn-secondary text-xs uppercase tracking-widest text-error border-error/20 hover:bg-error-container"
                    >
                      <SignOut size={14} weight="bold" className="mr-1 inline-block -mt-0.5" />
                      Leave
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="flex items-center gap-4 py-3 border-t border-border-subtle mt-2">
            <div className="w-10 h-10 border border-border-subtle bg-surface-dim flex items-center justify-center font-bold text-xs text-text-muted">
              +{members.length}
            </div>
            <span className="label-mono text-xs text-text-muted uppercase tracking-wider">
              Active {members.length === 1 ? 'Contributor' : 'Contributors'}
            </span>
          </div>
        </div>
      )}

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
