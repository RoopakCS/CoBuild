import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { applicationsApi } from '../api/applications';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RoleList } from '../components/project/RoleList';
import { ApplyRoleModal } from '../components/application/ApplyRoleModal';
import { TeamMemberList } from '../components/team/TeamMemberList';

export function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [applyModal, setApplyModal] = useState({ isOpen: false, role: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, title: '', message: '' });

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

  const updateAppStatus = useMutation({
    mutationFn: applicationsApi.updateStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['applications', 'project', id] }),
        queryClient.invalidateQueries({ queryKey: ['projects', id] }),
        queryClient.invalidateQueries({ queryKey: ['memberships', 'project', id] }),
        queryClient.invalidateQueries({ queryKey: ['applications', 'me'] }),
      ]);
    },
  });

  const deleteProject = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/my-projects');
    }
  });

  const handleAccept = async (app) => {
    try {
      await updateAppStatus.mutateAsync({ applicationId: app.id, status: 'ACCEPTED' });
      toast.success('Application accepted!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to accept application');
    }
  };

  if (isLoading) return (
    <div className="max-w-5xl mx-auto pb-12 animate-pulse">
      <div className="h-6 w-32 bg-slate-800/50 rounded mb-8"></div>
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 lg:p-12 mb-6 sm:mb-10 h-64 sm:h-80"></div>
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 mb-6 sm:mb-10 h-48"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 h-48 sm:h-64"></div>
        <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 h-48 sm:h-64"></div>
      </div>
    </div>
  );
  if (error || !project) return <div className="text-red-400 bg-red-500/10 p-8 text-center rounded-2xl border border-red-500/20">Failed to load project</div>;

  const isOwner = user?.id === project.ownerId;
  const hasApplied = myApps?.some(a => a.projectId === id && a.status === 'PENDING');
  const isMember = members?.some(m => m.userId === user?.id && m.status === 'ACTIVE');
  const isProjectOpen = project.status === 'OPEN';

  // Determine if user can apply: not owner, not member, not already applied, project is open
  const canApply = !isOwner && !isMember && !hasApplied && isProjectOpen;

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-fade-in">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-all font-semibold text-sm group">
          <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
      </div>

      {/* ── Project Header ── */}
      <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-slate-950/90 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl mb-8 sm:mb-12 relative overflow-hidden">
        {/* Subtle glow effect */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 sm:mb-8 gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${project.status === 'OPEN' ? 'bg-blue-600/15 text-blue-500 border-blue-500/30 shadow-none' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-1.5 animate-pulse" />
                {project.status}
              </span>
              <span className="text-xs font-bold text-slate-300 px-3.5 py-1 bg-slate-950/70 rounded-full border border-slate-800 shadow-inner">{project.domain}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 font-display">{project.title}</h1>
          </div>
          {isOwner && (
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => navigate(`/projects/${id}/edit`)}
                className="text-xs font-bold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-200 border border-slate-700/60 shadow-md active:scale-95"
              >
                Edit Project
              </button>
              <button onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  type: 'deleteProject',
                  title: 'Delete Project',
                  message: 'Are you sure you want to delete this project? This action cannot be undone.'
                });
              }} className="text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50 px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50">
                {deleteProject.isPending ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          )}
        </div>
        
        <p className="text-slate-300 mb-8 sm:mb-10 whitespace-pre-wrap leading-relaxed text-base sm:text-lg font-medium max-w-4xl relative z-10">{project.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 border-t border-slate-800/80 pt-6 sm:pt-8 relative z-10">
          <div className="bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/60 backdrop-blur-md">
            <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Commitment</p>
            <p className="text-sm sm:text-base font-bold text-slate-200 font-display">{project.commitment}</p>
          </div>
          <div className="bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/60 backdrop-blur-md">
            <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Experience</p>
            <p className="text-sm sm:text-base font-bold text-slate-200 font-display">{project.experienceLevel}</p>
          </div>
          <div className="bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/60 backdrop-blur-md">
            <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Team Size</p>
            <p className="text-sm sm:text-base font-bold text-slate-200 font-display">{project.teamSize}</p>
          </div>
          <div className="bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-slate-800/60 backdrop-blur-md">
            <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Owner</p>
            <p className="text-sm sm:text-base font-bold text-blue-500 font-display truncate">{project.ownerName}</p>
          </div>
        </div>
      </div>

      {/* ── Roles Section (M1) ── */}
      <div className="mb-8 sm:mb-12">
        <RoleList
          roles={project.roles || []}
          isOwner={isOwner}
          projectId={id}
          onApplyClick={(role) => setApplyModal({ isOpen: true, role })}
          canApply={canApply}
        />
      </div>

      {/* ── Status banner for non-owners who can't apply ── */}
      {!isOwner && !canApply && (
        <div className="mb-8 sm:mb-12">
          {isMember ? (
            <div className="rounded-2xl border border-blue-500/30 bg-blue-600/15 p-5 text-center backdrop-blur-md">
              <span className="text-lg font-bold text-blue-500 font-display">You're on the team!</span>
              <p className="text-sm text-slate-300 mt-1 font-medium">You are an active member of this project.</p>
            </div>
          ) : hasApplied ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center backdrop-blur-md">
              <span className="text-lg font-bold text-amber-400 font-display">Application Sent</span>
              <p className="text-sm text-slate-300 mt-1 font-medium">You have already applied. We'll let you know when the owner reviews it.</p>
            </div>
          ) : !isProjectOpen ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center backdrop-blur-md">
              <span className="text-lg font-bold text-slate-300 font-display">Not Accepting Applications</span>
              <p className="text-sm text-slate-400 mt-1 font-medium">This project is currently not accepting new members.</p>
            </div>
          ) : null}
        </div>
      )}

      {/* ── Team & Applications Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Team Members (M2) */}
        <TeamMemberList
          members={members || []}
          isOwner={isOwner}
          currentUserId={user?.id}
          projectId={id}
          ownerId={project.ownerId}
        />

        {/* Applications (owner only) */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm">
          {isOwner ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-slate-50 tracking-tight">Applications</h2>
              <div className="space-y-4">
                {apps?.filter(app => app.status !== 'REJECTED' && app.status !== 'WITHDRAWN').map(app => (
                  <div key={app.id} className="border border-slate-700/80 bg-slate-900/40 p-5 rounded-2xl">
                    <p className="text-base font-bold text-slate-200">{app.applicantName} <span className="text-sm font-normal text-slate-400 ml-1">for {app.roleTitle}</span> <span className={`text-xs font-bold px-2 py-1 rounded ml-2 ${app.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : app.status === 'ACCEPTED' ? 'bg-blue-600/15 text-blue-500 border border-blue-500/30' : 'bg-slate-700 text-slate-400'}`}>{app.status}</span></p>
                    <p className="text-sm font-medium text-slate-400 mt-3 mb-5 leading-relaxed">{app.message}</p>
                    {app.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAccept(app)} 
                          disabled={updateAppStatus.isPending && updateAppStatus.variables?.applicationId === app.id}
                          className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-blue-600/20">
                          {updateAppStatus.isPending && updateAppStatus.variables?.applicationId === app.id && updateAppStatus.variables?.status === 'ACCEPTED' ? 'Accepting...' : 'Accept'}
                        </button>
                        <button 
                          onClick={() => updateAppStatus.mutate({ applicationId: app.id, status: 'REJECTED' })} 
                          disabled={updateAppStatus.isPending && updateAppStatus.variables?.applicationId === app.id}
                          className="text-sm font-bold border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                          {updateAppStatus.isPending && updateAppStatus.variables?.applicationId === app.id && updateAppStatus.variables?.status === 'REJECTED' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {apps?.filter(app => app.status !== 'REJECTED' && app.status !== 'WITHDRAWN').length === 0 && <p className="text-base font-medium text-slate-500 text-center py-6">No applications yet.</p>}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center py-10">
              <span className="text-lg font-bold text-slate-300 mb-2">Project Activity</span>
              <p className="text-sm">Application details are visible to the project owner.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Apply Role Modal (M2) ── */}
      <ApplyRoleModal
        isOpen={applyModal.isOpen}
        onClose={() => setApplyModal({ isOpen: false, role: null })}
        role={applyModal.role}
        projectId={id}
      />

      {/* ── Delete Project Confirm ── */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          if (confirmModal.type === 'deleteProject') {
            deleteProject.mutate(id);
          }
          setConfirmModal({ isOpen: false, type: null, title: '', message: '' });
        }}
        onCancel={() => setConfirmModal({ isOpen: false, type: null, title: '', message: '' })}
        confirmText="Delete Project"
        isPending={deleteProject.isPending}
      />
    </div>
  );
}
