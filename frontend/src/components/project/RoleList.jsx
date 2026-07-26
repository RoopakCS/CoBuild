import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, PencilSimple, Trash, ArrowRight, UserPlus } from '@phosphor-icons/react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RoleFormModal } from './RoleFormModal';
import { rolesApi } from '../../api/roles';

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

  const totalVacancies = roles.reduce((sum, role) => sum + Math.max(0, role.openingsCount - role.filledCount), 0);

  return (
    <div className="surface-1 p-8 rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <h3 className="headline-lg tracking-[-0.02em]">
          Recruitment
        </h3>
        <div className="flex items-center gap-3">
          <span className="label-mono bg-primary text-surface px-3 py-1 uppercase tracking-widest font-bold">
            {totalVacancies} {totalVacancies === 1 ? 'Vacancy' : 'Vacancies'}
          </span>
          {isOwner && (
            <button
              onClick={() => setFormModal({ isOpen: true, existingRole: null })}
              className="btn-secondary px-3 py-1 text-xs"
            >
              <Plus size={16} weight="bold" className="mr-1 inline-block" />
              Add
            </button>
          )}
        </div>
      </div>

      {roles.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border-subtle">
          <p className="body-md font-medium text-text-muted">No roles defined yet.</p>
          {isOwner && (
            <p className="body-sm text-text-muted mt-1">Add roles to recruit teammates.</p>
          )}
        </div>
      ) : (
        <div className="space-y-px bg-border-subtle border border-border-subtle rounded-sm overflow-hidden">
          {roles.map((role) => {
            const remaining = role.openingsCount - role.filledCount;
            const isFull = role.isFull || role.full || remaining <= 0;

            return (
              <div
                key={role.id}
                className="group p-6 bg-surface hover:bg-surface-dim transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <h4 className="headline-lg-mobile tracking-[-0.02em]">{role.title}</h4>
                    <span className="label-mono text-primary border border-primary px-2 py-0.5 font-bold">
                      {role.filledCount} / {role.openingsCount} FILLED
                    </span>
                  </div>
                  {role.description && (
                    <p className="body-sm text-text-muted max-w-2xl">
                      {role.description}
                    </p>
                  )}
                  {role.skills && role.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {role.skills.map((skill, idx) => {
                        const skillName = typeof skill === 'string' ? skill : (skill.skillName || skill.name || String(skill));
                        return (
                          <span
                            key={skillName || idx}
                            className="label-mono px-2 py-0.5 bg-surface-dim border border-border-subtle rounded-sm text-text-muted"
                          >
                            {skillName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => setFormModal({ isOpen: true, existingRole: role })}
                        className="btn-secondary px-3 py-1.5 text-xs uppercase tracking-widest"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ isOpen: true, role })}
                        className="btn-secondary px-3 py-1.5 text-xs uppercase tracking-widest text-error border-error/20 hover:bg-error-container"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    canApply && (
                      <button
                        onClick={() => onApplyClick?.(role)}
                        disabled={isFull}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:text-tertiary group-hover:translate-x-1 transition-all disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isFull ? 'Position Filled' : 'Apply'}
                        {!isFull && <ArrowRight size={16} weight="bold" />}
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
