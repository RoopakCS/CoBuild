import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { applicationsApi } from '../api/applications';
import { useState } from 'react';

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
  });

  const applyMutation = useMutation({
    mutationFn: (payload) => applicationsApi.apply(payload),
    onSuccess: () => {
      alert('Applied successfully!');
      setCoverLetter('');
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
    onError: (err) => {
      alert('Failed to apply: ' + (err.response?.data?.message || err.message));
    }
  });

  if (isLoading) return <div className="text-zinc-500">Loading project...</div>;
  if (error) return <div className="text-red-500">Failed to load project: {error.message}</div>;
  if (!project) return <div className="text-zinc-500">Project not found</div>;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-6 flex items-center gap-2">
        &larr; Back
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm mb-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900">{project.title}</h1>
          <span className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-800">
            {project.status || 'ACTIVE'}
          </span>
        </div>
        
        <p className="text-zinc-600 mb-8 whitespace-pre-wrap leading-relaxed">{project.description}</p>
        
        <div className="grid grid-cols-2 gap-6 border-t border-zinc-100 pt-6">
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Domain</h4>
            <p className="text-sm font-medium">{project.domain || 'Unspecified'}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Experience</h4>
            <p className="text-sm font-medium">{project.experienceLevel || 'Any'}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Team Size</h4>
            <p className="text-sm font-medium">{project.teamSize || 0} members</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Owner</h4>
            <p className="text-sm font-medium">{project.ownerName || 'Unknown'}</p>
          </div>
        </div>

        {project.skills && project.skills.length > 0 && (
          <div className="mt-8">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill, idx) => (
                <span key={idx} className="bg-zinc-100 text-zinc-800 px-3 py-1.5 text-sm rounded-md font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-medium tracking-tight mb-4">Apply for this project</h2>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            applyMutation.mutate({ projectId: id, coverLetter, role: 'MEMBER' });
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-2">Cover Letter</label>
            <textarea 
              rows={4}
              required
              placeholder="Why are you a good fit?"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={applyMutation.isPending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
