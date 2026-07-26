import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsApi } from '../api/projects';
import { rolesApi } from '../api/roles';
import { ArrowLeft, Plus, Trash } from '@phosphor-icons/react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function EditProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, payload: null, title: '', message: '' });

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    experienceLevel: 'INTERMEDIATE',
    commitment: 'PART_TIME',
    repositoryUrl: '',
    status: 'OPEN'
  });

  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ title: '', openingsCount: 1 });

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        domain: project.domain || '',
        experienceLevel: project.experienceLevel || 'INTERMEDIATE',
        commitment: project.commitment || 'PART_TIME',
        repositoryUrl: project.repositoryUrl || '',
        status: project.status || 'OPEN'
      });
      if (project.roles) {
        setRoles(project.roles);
      }
    }
  }, [project]);

  const updateProjectMutation = useMutation({
    mutationFn: (payload) => projectsApi.update({ id, ...payload }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['projects', id] }),
      ]);
      toast.success('Project updated successfully!');
      navigate(`/projects/${id}`);
    },
    onError: (err) => {
      toast.error('Failed to update project: ' + (err.response?.data?.message || err.message));
    }
  });

  const addRoleMutation = useMutation({
    mutationFn: (payload) => rolesApi.create({ projectId: id, ...payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects', id] });
      setNewRole({ title: '', openingsCount: 1 });
      toast.success('Role added successfully!');
    },
    onError: (err) => {
      toast.error('Failed to add role: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => rolesApi.delete({ projectId: id, roleId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects', id] });
      toast.success('Role deleted successfully!');
    },
    onError: (err) => {
      toast.error('Failed to delete role: ' + (err.response?.data?.message || err.message));
    }
  });

  if (isLoading) return <div className="text-center py-10 body-md text-text-muted">Loading...</div>;
  if (error || !project) return <div className="text-center py-10 body-md text-error">Error loading project</div>;

  const inputClass = "w-full rounded-md bg-surface-dim border border-border-subtle px-4 py-3 body-md text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="max-w-3xl mx-auto pb-16 animate-fade-in">
      <button 
        type="button"
        onClick={() => navigate(`/projects/${id}`)}
        className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-all mb-6 button-text group cursor-pointer"
      >
        <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" /> Back to Project
      </button>

      <div className="mb-8">
        <h1 className="headline-xl text-primary tracking-[-0.02em] mb-2">Edit Project</h1>
        <p className="body-md text-text-muted max-w-2xl">Update your project details and manage open roles.</p>
      </div>
      
      <div className="surface-1 rounded-lg p-6 sm:p-10 shadow-sm mb-8">
        <h2 className="headline-lg text-primary mb-6">Project Details</h2>
        <form onSubmit={e => { e.preventDefault(); updateProjectMutation.mutate(formData); }} className="space-y-6">
          <div>
            <label className="block label-mono text-primary mb-2">TITLE</label>
            <input 
              required
              className={inputClass}
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
            />
          </div>

          <div>
            <label className="block label-mono text-primary mb-2">DESCRIPTION</label>
            <textarea 
              required
              rows={5}
              className={`${inputClass} resize-none`}
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block label-mono text-primary mb-2">DOMAIN</label>
              <input 
                required
                className={inputClass}
                value={formData.domain} 
                onChange={e => setFormData({ ...formData, domain: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="block label-mono text-primary mb-2">STATUS</label>
              <select 
                className={inputClass}
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="OPEN">Open (Accepting Members)</option>
                <option value="CLOSED">Closed (Not Accepting)</option>
              </select>
            </div>
            
            <div>
              <label className="block label-mono text-primary mb-2">EXPERIENCE LEVEL</label>
              <select 
                className={inputClass}
                value={formData.experienceLevel} 
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
              >
                <option value="BEGINNER">Beginner Friendly</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block label-mono text-primary mb-2">COMMITMENT</label>
              <select 
                className={inputClass}
                value={formData.commitment} 
                onChange={e => setFormData({ ...formData, commitment: e.target.value })}
              >
                <option value="PART_TIME">Part Time</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="CASUAL">Casual / Hobby</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block label-mono text-primary mb-2">REPOSITORY URL <span className="text-text-muted normal-case font-normal">(optional)</span></label>
            <input 
              type="url"
              className={inputClass}
              value={formData.repositoryUrl} 
              onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })} 
              placeholder="https://github.com/..."
            />
          </div>

          <div className="pt-4 border-t border-border-subtle mt-8 flex justify-end">
            <button 
              type="submit" 
              disabled={updateProjectMutation.isPending}
              className="w-full sm:w-auto btn-primary px-8 py-2 mt-4 disabled:opacity-50"
            >
              {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="surface-1 rounded-lg p-6 sm:p-10 shadow-sm">
        <h2 className="headline-lg text-primary mb-6">Manage Roles</h2>
        
        <div className="space-y-3 mb-8">
          {roles.map((role) => (
            <div key={role.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-surface p-4 rounded-md border border-border-subtle transition-all hover:border-text-muted group">
              <div className="flex-1">
                <p className="body-md font-bold text-primary">{role.title}</p>
                <p className="label-mono text-text-muted mt-1">OPENINGS: {role.openingsCount} &middot; FILLED: {role.filledCount}</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    type: 'deleteRole',
                    payload: role.id,
                    title: 'Delete Role',
                    message: `Are you sure you want to delete the role "${role.title}"?`
                  });
                }}
                disabled={deleteRoleMutation.isPending}
                className="btn-ghost !p-2 text-text-muted hover:text-error hover:bg-error-container disabled:opacity-30"
              >
                <Trash size={20} weight="bold" />
              </button>
            </div>
          ))}
          {roles.length === 0 && <p className="body-sm text-text-muted">No roles added yet.</p>}
        </div>

        <div className="pt-6 border-t border-border-subtle">
          <label className="block label-mono text-primary mb-4">ADD NEW ROLE</label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input 
              className={`flex-1 ${inputClass}`}
              placeholder="Role Title (e.g. Frontend Dev)"
              value={newRole.title}
              onChange={e => setNewRole({ ...newRole, title: e.target.value })}
            />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input 
                type="number" 
                min="1" 
                className={`w-24 text-center font-bold ${inputClass}`}
                value={newRole.openingsCount}
                onChange={e => setNewRole({ ...newRole, openingsCount: parseInt(e.target.value) || 1 })}
              />
              <button 
                type="button" 
                onClick={() => addRoleMutation.mutate(newRole)}
                disabled={addRoleMutation.isPending || !newRole.title.trim()}
                className="btn-secondary flex items-center justify-center gap-2 px-6 py-3 flex-1 sm:flex-none disabled:opacity-50"
              >
                <Plus weight="bold" /> <span>Add Role</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          if (confirmModal.type === 'deleteRole') {
            deleteRoleMutation.mutate(confirmModal.payload);
          }
          setConfirmModal({ isOpen: false, type: null, payload: null, title: '', message: '' });
        }}
        onCancel={() => setConfirmModal({ isOpen: false, type: null, payload: null, title: '', message: '' })}
        confirmText="Delete Role"
      />
    </div>
  );
}
