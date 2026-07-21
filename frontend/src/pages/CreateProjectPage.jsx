import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsApi } from '../api/projects';
import { rolesApi } from '../api/roles';
import { Plus, Trash } from '@phosphor-icons/react';

export function CreateProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    experienceLevel: 'INTERMEDIATE',
    teamSize: 1,
    commitment: 'PART_TIME',
    repositoryUrl: '',
    skills: []
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [roles, setRoles] = useState([{ title: '', openingsCount: 1 }]);

  const addRole = () => setRoles([...roles, { title: '', openingsCount: 1 }]);
  const removeRole = (index) => setRoles(roles.filter((_, i) => i !== index));
  const updateRole = (index, field, value) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      // Create project first
      const project = await projectsApi.create(payload.projectData);
      
      // Then create all roles
      if (payload.roles && payload.roles.length > 0) {
        for (const role of payload.roles) {
          if (role.title && role.openingsCount > 0) {
            await rolesApi.create({ projectId: project.id, ...role });
          }
        }
      }
      return project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${data.id}`);
    },
    onError: (err) => {
      toast.error('Failed to create project: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const validRoles = roles.filter(r => r.title.trim() !== '');
    if (validRoles.length === 0) {
      toast.error('Please add at least one role to your project.');
      return;
    }
    
    const calculatedTeamSize = 1 + validRoles.reduce((sum, r) => sum + (Number(r.openingsCount) || 0), 0);
    
    createMutation.mutate({ projectData: { ...formData, teamSize: calculatedTeamSize, skills }, roles: validRoles });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">Create New Project</h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400 font-medium">Define your idea and find the right collaborators.</p>
      </div>
      
      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-700/50 p-5 sm:p-8 shadow-2xl shadow-slate-900/50">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Title</label>
            <input 
              required
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              placeholder="e.g. Next-Gen AI Tool"
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
              placeholder="Describe what you want to build..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Domain</label>
            <input 
              required
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.domain} 
              onChange={e => setFormData({ ...formData, domain: e.target.value })} 
              placeholder="e.g. Web3, EdTech, Fintech"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Experience Level</label>
              <select 
                required
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all appearance-none"
                value={formData.experienceLevel} 
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })} 
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Commitment</label>
              <select 
                required
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all appearance-none"
                value={formData.commitment} 
                onChange={e => setFormData({ ...formData, commitment: e.target.value })} 
              >
                <option value="PART_TIME">Part Time</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Repository URL <span className="text-slate-500 font-normal">(optional)</span></label>
            <input 
              type="url"
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={formData.repositoryUrl} 
              onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })} 
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Skills <span className="text-slate-500 font-normal">(comma separated)</span></label>
            <input 
              className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
              value={skillsInput} 
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="React, Rust, PostgreSQL"
            />
          </div>

          <div className="border-t border-slate-700/50 pt-8 mt-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-300">Project Roles</label>
              <button 
                type="button" 
                onClick={addRole}
                className="flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus weight="bold" /> Add Role
              </button>
            </div>
            
            <div className="space-y-3">
              {roles.map((role, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input 
                      required
                      placeholder="Role Title (e.g. Frontend Developer)"
                      className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-sm text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition-all"
                      value={role.title}
                      onChange={e => updateRole(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <input 
                      type="number"
                      required
                      min={1}
                      title="Openings"
                      className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-sm text-slate-50 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/10 transition-all text-center"
                      value={role.openingsCount}
                      onChange={e => updateRole(idx, 'openingsCount', parseInt(e.target.value, 10))}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeRole(idx)}
                    disabled={roles.length === 1}
                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 mt-1"
                  >
                    <Trash size={20} weight="duotone" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-end gap-4 border-t border-slate-700/50">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full md:w-auto rounded-xl px-6 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full md:w-auto rounded-xl bg-green-500 px-8 py-3 text-sm font-bold text-slate-900 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none focus:outline-none focus:ring-4 focus:ring-green-500/30"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
