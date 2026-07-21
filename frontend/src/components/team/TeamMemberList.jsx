import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Crown, SignOut, UserMinus, WarningCircle, Users } from '@phosphor-icons/react';
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

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['memberships', 'project', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const removeMutation = useMutation({
    mutationFn: ({ userId }) => membershipsApi.removeMember({ projectId, userId }),
    onSuccess: () => {
      toast.success('Member removed');
      invalidateAll();
      setConfirmModal({ isOpen: false, type: null, member: null });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove member');
      setConfirmModal({ isOpen: false, type: null, member: null });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: ({ membershipId }) => membershipsApi.leaveProject(membershipId),
    onSuccess: () => {
      toast.success('You have left the project');
      invalidateAll();
      queryClient.invalidateQueries({ queryKey: ['memberships', 'user', currentUserId] });
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
        toast.error(serverMessage || 'Failed to leave project');
      }
    },
  });

  const handleConfirm = () => {
    if (confirmModal.type === 'remove') {
      removeMutation.mutate({ userId: confirmModal.member.userId });
    } else if (confirmModal.type === 'leave') {
      leaveMutation.mutate({ membershipId: confirmModal.member.id });
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

  const isPending = removeMutation.isPending || leaveMutation.isPending;

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <Users size={24} weight="duotone" className="text-green-400" />
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
                className="flex items-center justify-between border border-slate-700/40 bg-slate-900/30 rounded-xl px-4 py-3 transition-colors hover:bg-slate-900/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar placeholder */}
                  <div className="w-9 h-9 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center text-sm font-bold text-slate-300 shrink-0">
                    {(m.userName || '?')[0].toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-200 truncate">
                        {m.userName}
                        {isSelf && <span className="text-slate-500 font-normal ml-1">(you)</span>}
                      </span>
                      {isOwnerMember && (
                        <Badge variant="warning" size="sm">
                          <Crown size={12} weight="fill" />
                          Owner
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium text-slate-400">{m.role}</span>
                      {m.joinedAt && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-xs text-slate-500">
                            Joined {formatDate(m.joinedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 ml-3">
                  {isOwner && !isOwnerMember && (
                    <button
                      onClick={() =>
                        setConfirmModal({ isOpen: true, type: 'remove', member: m })
                      }
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <UserMinus size={14} weight="bold" />
                      Remove
                    </button>
                  )}
                  {isSelf && !isOwner && (
                    <button
                      onClick={() =>
                        setConfirmModal({ isOpen: true, type: 'leave', member: m })
                      }
                      disabled={isPending}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <SignOut size={14} weight="bold" />
                      Leave
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
        title={confirmModal.type === 'remove' ? 'Remove Member' : 'Leave Project'}
        message={
          confirmModal.type === 'remove'
            ? `Are you sure you want to remove ${confirmModal.member?.userName} from this project?`
            : 'Are you sure you want to leave this project? You will need to apply again if you wish to return.'
        }
        confirmText={confirmModal.type === 'remove' ? 'Remove Member' : 'Leave Project'}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, type: null, member: null })}
      />
    </div>
  );
}
