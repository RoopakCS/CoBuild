import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { applicationsApi } from '../api/applications';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { useState } from 'react';

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');

  const { data: user } = useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.getMe });
  
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
  });

  const { data: apps } = useQuery({
    queryKey: ['applications', 'project', id],
    queryFn: () => applicationsApi.getProjectApplications(id),
    enabled: !!project && project.ownerId === user?.id,
  });

  const { data: members } = useQuery({
    queryKey: ['memberships', 'project', id],
    queryFn: () => membershipsApi.getProjectMembers(id),
  });

  const applyMutation = useMutation({
    mutationFn: (payload) => applicationsApi.apply(payload),
    onSuccess: () => {
      alert('Applied successfully!');
      setCoverLetter('');
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    }
  });

  const updateAppStatus = useMutation({
    mutationFn: applicationsApi.updateStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications', 'project', id] })
  });

  const removeMember = useMutation({
    mutationFn: membershipsApi.removeMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['memberships', 'project', id] })
  });

  const deleteProject = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      navigate('/my-projects');
    }
  });

  if (isLoading) return <div className="text-zinc-500">Loading project...</div>;
  if (error || !project) return <div className="text-red-500">Failed to load project</div>;

  const isOwner = user?.id === project.ownerId;

  return (
    <div className="max-w-4xl">
      <button onClick={() => navigate(-1)} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-6 flex items-center gap-2">
        &larr; Back
      </button>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm mb-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900">{project.title}</h1>
          {isOwner && (
            <button onClick={() => {
              if(window.confirm('Delete this project?')) deleteProject.mutate(id);
            }} className="text-red-600 text-sm border border-red-200 px-3 py-1 rounded">Delete</button>
          )}
        </div>
        
        <p className="text-zinc-600 mb-8 whitespace-pre-wrap leading-relaxed">{project.description}</p>
        
        <div className="grid grid-cols-2 gap-6 border-t border-zinc-100 pt-6">
          <div><p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Domain</p><p className="text-sm font-medium">{project.domain}</p></div>
          <div><p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Experience</p><p className="text-sm font-medium">{project.experienceLevel}</p></div>
          <div><p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Team Size</p><p className="text-sm font-medium">{project.teamSize}</p></div>
          <div><p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Owner</p><p className="text-sm font-medium">{project.ownerName}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Members */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-medium mb-4">Members</h2>
          <div className="space-y-4">
            {members?.map(m => (
              <div key={m.id} className="flex justify-between border-b pb-2">
                <span className="text-sm">{m.userName} ({m.role})</span>
                {isOwner && m.userId !== project.ownerId && (
                  <button onClick={() => removeMember.mutate({ projectId: id, userId: m.userId })} className="text-xs text-red-500">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Apply or Manage Applications */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {isOwner ? (
            <>
              <h2 className="text-xl font-medium mb-4">Applications</h2>
              <div className="space-y-4">
                {apps?.map(app => (
                  <div key={app.id} className="border p-4 rounded-xl">
                    <p className="text-sm font-medium">{app.applicantName} <span className="text-xs font-normal text-zinc-500">({app.status})</span></p>
                    <p className="text-xs text-zinc-600 my-2">{app.coverLetter}</p>
                    {app.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateAppStatus.mutate({ applicationId: app.id, status: 'ACCEPTED' })} className="text-xs bg-zinc-900 text-white px-2 py-1 rounded">Accept</button>
                        <button onClick={() => updateAppStatus.mutate({ applicationId: app.id, status: 'REJECTED' })} className="text-xs border border-zinc-300 px-2 py-1 rounded">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
                {apps?.length === 0 && <p className="text-sm text-zinc-500">No applications yet.</p>}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium mb-4">Apply</h2>
              <form onSubmit={e => { e.preventDefault(); applyMutation.mutate({ projectId: id, coverLetter, role: 'MEMBER' }); }}>
                <textarea rows={4} required placeholder="Cover Letter" className="w-full border p-2 text-sm rounded mb-2" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                <button type="submit" className="w-full bg-zinc-900 text-white p-2 rounded text-sm">Submit Application</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
