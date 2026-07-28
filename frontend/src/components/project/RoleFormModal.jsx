import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from '@phosphor-icons/react';
import { Modal } from '../common/Modal';
import { Input, Textarea, FormField } from '../common/Input';
import { Badge } from '../common/Badge';
import { rolesApi } from '../../api/roles';

/**
 * Modal form for creating or editing a project role.
 * Pass `existingRole` to enable edit mode.
 *
 * @param {{ isOpen: boolean, onClose: () => void, projectId: string, existingRole?: object }} props
 */
export function RoleFormModal({ isOpen, onClose, projectId, existingRole }) {
  const queryClient = useQueryClient();
  const isEdit = !!existingRole;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [openingsCount, setOpeningsCount] = useState(1);
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});

  // Populate form when editing or reset when creating
  useEffect(() => {
    if (isOpen) {
      if (existingRole) {
        setTitle(existingRole.title || '');
        setDescription(existingRole.description || '');
        setOpeningsCount(existingRole.openingsCount || 1);
        setSkills(existingRole.skills || []);
      } else {
        setTitle('');
        setDescription('');
        setOpeningsCount(1);
        setSkills([]);
      }
      setSkillInput('');
      setErrors({});
    }
  }, [isOpen, existingRole]);

  const createMutation = useMutation({
    mutationFn: (payload) => rolesApi.create({ projectId, ...payload }),
    onSuccess: async () => {
      toast.success('Role created!');
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create role');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) =>
      rolesApi.update({ projectId, roleId: existingRole?.id, ...payload }),
    onSuccess: async () => {
      toast.success('Role updated!');
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update role');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (title.length > 255) newErrors.title = 'Title must be at most 255 characters';
    if (!openingsCount || openingsCount < 1) {
      newErrors.openingsCount = 'Must be at least 1';
    } else if (existingRole && openingsCount < (existingRole.filledCount || 0)) {
      newErrors.openingsCount = `Cannot be less than filled count (${existingRole.filledCount})`;
    }
    if (description.length > 5000) newErrors.description = 'Must be at most 5000 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      openingsCount: Number(openingsCount),
      skills: skills.length > 0 ? skills : null,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Role' : 'Add New Role'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Title" htmlFor="role-title" required error={errors.title}>
          <Input
            id="role-title"
            placeholder="e.g. Frontend Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
          />
        </FormField>

        <FormField label="Description" htmlFor="role-desc" error={errors.description}>
          <Textarea
            id="role-desc"
            rows={3}
            placeholder="What will this person do?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={5000}
          />
        </FormField>

        <FormField label="Openings" htmlFor="role-openings" required error={errors.openingsCount}>
          <Input
            id="role-openings"
            type="number"
            min={1}
            value={openingsCount}
            onChange={(e) => setOpeningsCount(parseInt(e.target.value, 10) || '')}
          />
        </FormField>

        <FormField label="Skills" htmlFor="role-skills">
          <div className="flex gap-2">
            <Input
              id="role-skills"
              placeholder="Type a skill, press Enter"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKeyDown}
              className="flex-1"
            />
            <button
              type="button"
              onClick={addSkill}
              disabled={!skillInput.trim()}
              className="shrink-0 btn-secondary px-4 py-2"
            >
              Add
            </button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill) => (
                <Badge key={skill} variant="neutral" size="md">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-text-muted hover:text-error transition-colors ml-1"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </FormField>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-text-muted hover:text-text-main hover:bg-surface-dim transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary px-6 py-2.5"
          >
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
