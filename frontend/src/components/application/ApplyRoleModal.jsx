import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { WarningCircle } from '@phosphor-icons/react';
import { Modal } from '../common/Modal';
import { Textarea, FormField } from '../common/Input';
import { Badge } from '../common/Badge';
import { applicationsApi } from '../../api/applications';

/**
 * Modal for applying to a specific role on a project.
 * Shows role summary (read-only) and a pitch message textarea.
 *
 * @param {{ isOpen: boolean, onClose: () => void, role: object|null, projectId: string }} props
 */
export function ApplyRoleModal({ isOpen, onClose, role, projectId }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [inlineError, setInlineError] = useState('');

  const applyMutation = useMutation({
    mutationFn: (payload) => applicationsApi.apply(payload),
    onSuccess: () => {
      toast.success('Application submitted!');
      queryClient.invalidateQueries({ queryKey: ['applications', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['applications', 'project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      setMessage('');
      setInlineError('');
      onClose();
    },
    onError: (err) => {
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message || err.response?.data?.error || '';

      if (status === 400 || status === 409) {
        // Race condition: role filled between page load and submit
        setInlineError(
          serverMessage || 'This role is now full. Please choose a different role.'
        );
      } else {
        toast.error(serverMessage || 'Failed to submit application');
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setInlineError('');

    applyMutation.mutate({
      projectId,
      roleId: role?.id,
      message: message.trim(),
    });
  };

  const handleClose = () => {
    setMessage('');
    setInlineError('');
    onClose();
  };

  if (!role) return null;

  const isFull = role.isFull || role.full || (role.openingsCount - role.filledCount) <= 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Apply for Role" maxWidth="max-w-md">
      {/* Role Summary */}
      <div className="bg-surface-dim border border-border-subtle rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-base text-primary">{role.title}</h4>
          {isFull ? (
            <Badge variant="danger" size="sm">Full</Badge>
          ) : (
            <Badge variant="success" size="sm">
              {role.openingsCount - role.filledCount} open
            </Badge>
          )}
        </div>
        {role.description && (
          <p className="text-sm text-text-muted leading-relaxed mb-3">{role.description}</p>
        )}
        {role.skills && role.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {role.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs font-medium bg-surface border border-border-subtle text-text-muted px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Inline Error */}
      {inlineError && (
        <div className="flex items-start gap-2 bg-error-container border border-error/20 text-error text-sm font-medium p-3 rounded-lg mb-4">
          <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
          <span>{inlineError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <FormField label="Your Pitch" htmlFor="apply-message">
          <Textarea
            id="apply-message"
            rows={5}
            placeholder="Why would you be a great fit for this role?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
          />
          <p className="text-xs text-text-muted mt-1.5 text-right">
            {message.length}/1000
          </p>
        </FormField>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={applyMutation.isPending}
            className="btn-ghost rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={applyMutation.isPending || isFull}
            className="btn-primary rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
