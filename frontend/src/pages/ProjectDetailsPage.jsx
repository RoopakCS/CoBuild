import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { applicationsApi } from '../api/applications';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';

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

  const { data: myApps } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: applicationsApi.getMyApplications,
    enabled: !!user,
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

  const handleAccept = async (app) => {
    try {
      await updateAppStatus.mutateAsync({ applicationId: app.id, status: 'ACCEPTED' });
      await membershipsApi.addMember({ projectId: id, userId: app.applicantId });
      queryClient.invalidateQueries({ queryKey: ['memberships', 'project', id] });
    } catch (e) {
      alert('Failed to accept application');
    }
  };

  if (isLoading) return <div className="text-slate-500 p-8 text-center text-lg animate-pulse">Loading project...</div>;
  if (error || !project) return <div className="text-red-400 bg-red-500/10 p-8 text-center rounded-2xl border border-red-500/20">Failed to load project</div>;

  const isOwner = user?.id === project.ownerId;
  const hasApplied = myApps?.some(a => a.projectId === id && a.status !== 'WITHDRAWN' && a.status !== 'REJECTED');
  const isMember = members?.some(m => m.userId === user?.id);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-green-400 mb-6 sm:mb-8 transition-colors">
        <ArrowLeft size={16} weight="bold" className="transition-transform group-hover:-translate-x-1" />
        Back to projects
      </button>

      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-sm mb-6 sm:mb-10 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-10 gap-4 sm:gap-6 relative z-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">{project.title}</h1>
          {isOwner && (
            <button onClick={() => {
              if(window.confirm('Delete this project?')) deleteProject.mutate(id);
            }} className="self-start shrink-0 text-red-400 font-bold text-xs sm:text-sm border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl transition-all">
              Delete Project
            </button>
          )}
        </div>
        
        <p className="text-slate-300 mb-8 sm:mb-12 whitespace-pre-wrap leading-relaxed text-base sm:text-lg md:text-xl font-medium max-w-4xl relative z-10">{project.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 border-t border-slate-700/50 pt-6 sm:pt-10 relative z-10">
          <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 sm:mb-2">Domain</p><p className="text-sm sm:text-lg font-semibold text-slate-200">{project.domain}</p></div>
          <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 sm:mb-2">Experience</p><p className="text-sm sm:text-lg font-semibold text-slate-200">{project.experienceLevel}</p></div>
          <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 sm:mb-2">Team Size</p><p className="text-sm sm:text-lg font-semibold text-slate-200">{project.teamSize}</p></div>
          <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 sm:mb-2">Owner</p><p className="text-sm sm:text-lg font-semibold text-slate-200">{project.ownerName}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Members */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6 text-slate-50 tracking-tight">Team Members</h2>
          <div className="space-y-4">
            {members?.map(m => (
              <div key={m.id} className="flex items-center justify-between border-b border-slate-700/50 pb-4 last:border-0 last:pb-0">
                <span className="text-base font-semibold text-slate-200">{m.userName} <span className="text-sm font-normal text-slate-500 ml-2">({m.role})</span></span>
                {isOwner && m.userId !== project.ownerId && (
                  <button onClick={() => removeMember.mutate({ projectId: id, userId: m.userId })} className="text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Apply or Manage Applications */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm">
          {isOwner ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-slate-50 tracking-tight">Applications</h2>
              <div className="space-y-4">
                {apps?.map(app => (
                  <div key={app.id} className="border border-slate-700/80 bg-slate-900/40 p-5 rounded-2xl">
                    <p className="text-base font-bold text-slate-200">{app.applicantName} <span className={`text-xs font-bold px-2 py-1 rounded ml-2 ${app.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : app.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>{app.status}</span></p>
                    <p className="text-sm font-medium text-slate-400 mt-3 mb-5 leading-relaxed">{app.message}</p>
                    {app.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button onClick={() => handleAccept(app)} className="text-sm font-bold bg-green-500 hover:bg-green-400 text-slate-900 px-4 py-2 rounded-xl transition-colors">Accept</button>
                        <button onClick={() => updateAppStatus.mutate({ applicationId: app.id, status: 'REJECTED' })} className="text-sm font-bold border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 px-4 py-2 rounded-xl transition-colors">Reject</button>
                      </div>
                    )}
                  </div>
                ))}
                {apps?.length === 0 && <p className="text-base font-medium text-slate-500 text-center py-6">No applications yet.</p>}
              </div>
            </>
          ) : isMember ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-10">
              <span className="text-lg font-bold text-green-400 mb-2">You're in!</span>
              <p>You are an active member of this project.</p>
            </div>
          ) : hasApplied ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-10">
              <span className="text-lg font-bold text-slate-300 mb-2">Application Sent</span>
              <p>You have already applied to this project. We'll let you know when the owner reviews it.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-slate-50 tracking-tight">Join Project</h2>
              <form onSubmit={e => { e.preventDefault(); applyMutation.mutate({ projectId: id, message: coverLetter }); }} className="flex flex-col h-full">
                <label className="block text-sm font-bold text-slate-300 mb-2">Cover Letter</label>
                <textarea 
                  rows={5} 
                  required 
                  placeholder="Why would you be a good fit?" 
                  className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 p-4 rounded-xl mb-6 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all resize-none" 
                  value={coverLetter} 
                  onChange={e => setCoverLetter(e.target.value)} 
                />
                <button type="submit" disabled={applyMutation.isPending} className="mt-auto w-full bg-green-500 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 text-slate-900 font-bold p-4 rounded-xl text-base disabled:opacity-50 disabled:hover:shadow-none transition-all focus:outline-none focus:ring-4 focus:ring-green-500/30">
                  {applyMutation.isPending ? 'Sending...' : 'Submit Application'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
