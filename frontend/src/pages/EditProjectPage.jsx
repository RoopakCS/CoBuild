import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsApi } from '../api/projects';
import { rolesApi } from '../api/roles';
import { ArrowLeft, Plus, Trash } from '@phosphor-icons/react';
import { ConfirmModal } from '../components/ConfirmModal';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully!');
      navigate(`/projects/${id}`);
    },
    onError: (err) => {
      toast.error('Failed to update project: ' + (err.response?.data?.message || err.message));
    }
  });

  const addRoleMutation = useMutation({
    mutationFn: (payload) => rolesApi.create({ projectId: id, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      setNewRole({ title: '', openingsCount: 1 });
      toast.success('Role added successfully!');
    },
    onError: (err) => {
      toast.error('Failed to add role: ' + (err.response?.data?.message || err.message));
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => rolesApi.delete({ projectId: id, roleId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
      toast.success('Role deleted successfully!');
    },
    onError: (err) => {
      toast.error('Failed to delete role: ' + (err.response?.data?.message || err.message));
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error || !project) return <div className="text-center py-10">Error loading project</div>;

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button 
        onClick={() => navigate(`/projects/${id}`)}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors mb-6 font-medium text-sm"
      >
        <ArrowLeft weight="bold" /> Back to Project
      </button>

      <div className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">Edit Project</h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400 font-medium">Update your project details and manage roles.</p>
      </div>
      
      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-700/50 p-5 sm:p-8 shadow-2xl shadow-slate-900/50 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-50">Project Details</h2>
        <form onSubmit={e => { e.preventDefault(); updateProjectMutation.mutate(formData); }} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title</label>
            <input 
              required
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Description</label>
            <textarea 
              required
              rows={5}
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all resize-none"
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Domain</label>
              <input 
                required
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
                value={formData.domain} 
                onChange={e => setFormData({ ...formData, domain: e.target.value })} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Status</label>
              <select 
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all appearance-none"
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="OPEN">Open (Accepting Members)</option>
                <option value="CLOSED">Closed (Not Accepting)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Experience Level</label>
              <select 
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all appearance-none"
                value={formData.experienceLevel} 
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })}
              >
                <option value="BEGINNER">Beginner Friendly</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Commitment</label>
              <select 
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all appearance-none"
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
            <label className="block text-sm font-bold text-slate-300 mb-2">Repository URL (Optional)</label>
            <input 
              type="url"
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.repositoryUrl} 
              onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })} 
              placeholder="https://github.com/..."
            />
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <button 
              type="submit" 
              disabled={updateProjectMutation.isPending}
              className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50"
            >
              {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-700/50 p-5 sm:p-8 shadow-2xl shadow-slate-900/50">
        <h2 className="text-2xl font-bold mb-6 text-slate-50">Manage Roles</h2>
        
        <div className="space-y-4 mb-8">
          {roles.map((role) => (
            <div key={role.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
              <div className="flex-1">
                <p className="font-bold text-slate-200">{role.title}</p>
                <p className="text-sm text-slate-400">Openings: {role.openingsCount} (Filled: {role.filledCount})</p>
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
                className="p-2 sm:p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-30"
              >
                <Trash size={20} weight="bold" />
              </button>
            </div>
          ))}
          {roles.length === 0 && <p className="text-slate-500">No roles added yet.</p>}
        </div>

        <div className="pt-6 border-t border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-200 mb-4">Add New Role</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <input 
              className="flex-1 rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              placeholder="Role Title (e.g. Frontend Dev)"
              value={newRole.title}
              onChange={e => setNewRole({ ...newRole, title: e.target.value })}
            />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input 
                type="number" 
                min="1" 
                className="w-24 rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all text-center"
                value={newRole.openingsCount}
                onChange={e => setNewRole({ ...newRole, openingsCount: parseInt(e.target.value) || 1 })}
              />
              <button 
                type="button" 
                onClick={() => addRoleMutation.mutate(newRole)}
                disabled={addRoleMutation.isPending || !newRole.title.trim()}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-slate-900 p-3 rounded-xl transition-all disabled:opacity-50 flex-1 sm:flex-none"
              >
                <Plus weight="bold" /> <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
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
