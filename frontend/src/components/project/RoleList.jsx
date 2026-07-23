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
    onSuccess: async () => {
      toast.success('Role deleted');
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      setDeleteConfirm({ isOpen: false, role: null });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    },
  });

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users size={22} weight="duotone" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-display tracking-tight">Open Roles</h2>
            <p className="text-xs text-slate-400 font-medium">Positions available for this build</p>
          </div>
          <Badge variant="neutral" size="sm" className="ml-1">{roles.length}</Badge>
        </div>
        {isOwner && (
          <button
            onClick={() => setFormModal({ isOpen: true, existingRole: null })}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-600/20 active:scale-95"
          >
            <Plus size={16} weight="bold" />
            Add Role
          </button>
        )}
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <Users size={40} weight="duotone" className="mx-auto mb-3 opacity-40 text-slate-400" />
          <p className="font-semibold text-slate-300">No roles defined yet.</p>
          {isOwner && (
            <p className="text-xs text-slate-500 mt-1">Add roles to let people know what positions are available.</p>
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
                className={`relative border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                  isFull
                    ? 'border-slate-800/40 bg-slate-950/40 opacity-70'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-blue-500/30 hover:shadow-md hover:-translate-y-0.5 backdrop-blur-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-bold text-lg text-slate-100 font-display tracking-tight truncate">
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
                  <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2">
                    {role.description}
                  </p>
                )}

                {/* Skills */}
                {role.skills && role.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {role.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] font-semibold bg-slate-950/70 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => setFormModal({ isOpen: true, existingRole: role })}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700/80 px-3.5 py-2 rounded-xl transition-all duration-200 border border-slate-700/60 shadow-sm active:scale-95"
                      >
                        <PencilSimple size={14} weight="bold" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, role })}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95"
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
                        className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4.5 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        <UserPlus size={16} weight="bold" />
                        {isFull ? 'Position Filled' : 'Apply for Role'}
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
