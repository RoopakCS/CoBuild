import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, PencilSimple, Trash, UserPlus, Users } from '@phosphor-icons/react';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RoleFormModal } from './RoleFormModal';
import { rolesApi } from '../../api/roles';

/**
 * Displays the list of roles for a project.
 * Owner sees CRUD controls; non-owner sees Apply buttons.
 *
 * @param {{ roles: object[], isOwner: boolean, projectId: string, onApplyClick: (roleId: string) => void, canApply: boolean }} props
 */
export function RoleList({ roles = [], isOwner, projectId, onApplyClick, canApply = true }) {
  const queryClient = useQueryClient();
  const [formModal, setFormModal] = useState({ isOpen: false, existingRole: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, role: null });

  const deleteMutation = useMutation({
    mutationFn: ({ roleId }) => rolesApi.delete({ projectId, roleId }),
    onSuccess: () => {
      toast.success('Role deleted');
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      setDeleteConfirm({ isOpen: false, role: null });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    },
  });

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={24} weight="duotone" className="text-green-400" />
          <h2 className="text-2xl font-bold text-slate-50 tracking-tight">Roles</h2>
          <Badge variant="neutral" size="sm">{roles.length}</Badge>
        </div>
        {isOwner && (
          <button
            onClick={() => setFormModal({ isOpen: true, existingRole: null })}
            className="flex items-center gap-2 text-sm font-bold bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20"
          >
            <Plus size={16} weight="bold" />
            Add Role
          </button>
        )}
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Users size={40} weight="duotone" className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No roles defined yet.</p>
          {isOwner && (
            <p className="text-sm mt-1">Add roles to let people know what positions are available.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const remaining = role.openingsCount - role.filledCount;
            const isFull = role.isFull || role.full || remaining <= 0;

            return (
              <div
                key={role.id}
                className={`relative border rounded-2xl p-5 transition-all ${
                  isFull
                    ? 'border-slate-700/30 bg-slate-900/20 opacity-75'
                    : 'border-slate-700/60 bg-slate-900/40 hover:border-slate-600/80'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-lg text-slate-100 tracking-tight truncate">
                      {role.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isFull ? (
                      <Badge variant="danger" size="sm">Team Full</Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        {role.filledCount}/{role.openingsCount} filled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                {role.description && (
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">
                    {role.description}
                  </p>
                )}

                {/* Skills */}
                {role.skills && role.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {role.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium bg-slate-800 border border-slate-700/50 text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => setFormModal({ isOpen: true, existingRole: role })}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700/50"
                      >
                        <PencilSimple size={14} weight="bold" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, role })}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/15 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash size={14} weight="bold" />
                        Delete
                      </button>
                    </>
                  ) : (
                    canApply && (
                      <button
                        onClick={() => onApplyClick?.(role)}
                        disabled={isFull}
                        className="flex items-center gap-1.5 text-sm font-bold bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        <UserPlus size={16} weight="bold" />
                        {isFull ? 'Full' : 'Apply'}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Form Modal (create/edit) */}
      <RoleFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, existingRole: null })}
        projectId={projectId}
        existingRole={formModal.existingRole}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Role"
        message={`Are you sure you want to delete "${deleteConfirm.role?.title}"? This action cannot be undone.`}
        confirmText="Delete Role"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate({ roleId: deleteConfirm.role?.id })}
        onCancel={() => setDeleteConfirm({ isOpen: false, role: null })}
      />
    </div>
  );
}
