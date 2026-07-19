import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';

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

  const createMutation = useMutation({
    mutationFn: (payload) => projectsApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${data.id}`);
    },
    onError: (err) => {
      alert('Failed to create project: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    createMutation.mutate({ ...formData, skills });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">Create New Project</h1>
        <p className="mt-3 text-lg text-slate-400 font-medium">Define your idea and find the right collaborators.</p>
      </div>
      
      <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl border border-slate-700/50 p-8 shadow-2xl shadow-slate-900/50">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Team Size</label>
              <input 
                type="number"
                required
                min={1}
                className="w-full rounded-xl bg-slate-900/50 border border-slate-700 px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
                value={formData.teamSize} 
                onChange={e => setFormData({ ...formData, teamSize: parseInt(e.target.value, 10) })} 
              />
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
