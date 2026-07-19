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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-medium tracking-tight mb-8">Create New Project</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
          <input 
            required
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            value={formData.title} 
            onChange={e => setFormData({ ...formData, title: e.target.value })} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
          <textarea 
            required
            rows={5}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            value={formData.description} 
            onChange={e => setFormData({ ...formData, description: e.target.value })} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Domain</label>
            <input 
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={formData.domain} 
              onChange={e => setFormData({ ...formData, domain: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Team Size</label>
            <input 
              type="number"
              required
              min={1}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={formData.teamSize} 
              onChange={e => setFormData({ ...formData, teamSize: parseInt(e.target.value, 10) })} 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Repository URL (optional)</label>
          <input 
            type="url"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            value={formData.repositoryUrl} 
            onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })} 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Skills (comma separated)</label>
          <input 
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            value={skillsInput} 
            onChange={e => setSkillsInput(e.target.value)}
            placeholder="React, Java, Spring Boot"
          />
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
