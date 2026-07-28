import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { applicationsApi } from '../api/applications';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { useState } from 'react';
import { ArrowLeft, CheckCircle, Clock, LockKey } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RoleList } from '../components/project/RoleList';
import { ApplyRoleModal } from '../components/application/ApplyRoleModal';
import { TeamMemberList } from '../components/team/TeamMemberList';
import { GitHubStatsCard } from '../components/github/GitHubStatsCard';
import { ActivityFeed } from '../components/project/ActivityFeed';

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
    <div className="mx-auto pb-12 space-y-8">
      <div className="h-6 w-32 skeleton"></div>
      <div className="h-32 skeleton"></div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 h-96 skeleton"></div>
        <div className="col-span-12 lg:col-span-4 h-96 skeleton"></div>
      </div>
    </div>
  );
  
  if (error || !project) return <div className="text-error bg-error-container p-8 text-center rounded-lg border border-error/20">Failed to load project</div>;

  const isOwner = user?.id === project.ownerId;
  const hasApplied = myApps?.some(a => a.projectId === id && a.status === 'PENDING');
  const isMember = members?.some(m => m.userId === user?.id && m.status === 'ACTIVE');
  const isProjectOpen = project.status === 'OPEN';
  const canApply = !isOwner && !isMember && !hasApplied && isProjectOpen;

  return (
    <div className="pb-16">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-primary transition-all font-semibold button-text group">
          <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
      </div>

      {/* Hero Section */}
      <section className="mb-8 border-b border-border-subtle pb-8">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              {project.status === 'OPEN' ? (
                <span className="badge-success">
                  Recruiting
                </span>
              ) : (
                <span className="badge-neutral">
                  {project.status}
                </span>
              )}
            </div>
            <h1 className="headline-xl text-primary tracking-[-0.02em] leading-tight">
              {project.title}
            </h1>
          </div>
          
          <div className="flex gap-3 shrink-0 items-start">
            {isOwner && (
              <>
                <button 
                  onClick={() => navigate(`/projects/${id}/edit`)}
                  className="btn-secondary btn-sm uppercase tracking-widest"
                >
                  Edit Project
                </button>
                <button 
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      type: 'deleteProject',
                      title: 'Delete Project',
                      message: 'Are you sure you want to delete this project? This action cannot be undone.'
                    });
                  }} 
                  className="btn-secondary btn-sm text-error border-error/30 hover:bg-error-container uppercase tracking-widest"
                >
                  {deleteProject.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
            {!isOwner && canApply && (
              <button 
                onClick={() => {
                  const firstRole = project.roles?.[0];
                  if (firstRole) setApplyModal({ isOpen: true, role: firstRole });
                  else toast.error("No roles available to apply for.");
                }}
                className="btn-primary btn-sm uppercase tracking-widest px-6 py-2"
              >
                Apply to Join
              </button>
            )}
            {!isOwner && isMember && (
              <span className="flex items-center gap-2 text-primary bg-surface-dim px-4 py-2 rounded-md button-text font-bold border border-border-subtle">
                <CheckCircle size={18} weight="fill" className="text-success-green" /> Member
              </span>
            )}
            {!isOwner && hasApplied && (
              <span className="flex items-center gap-2 text-warning-amber bg-warning-amber/10 px-4 py-2 rounded-md button-text font-bold border border-warning-amber/20">
                <Clock size={18} weight="fill" /> Application Sent
              </span>
            )}
            {(isOwner || isMember) && (
              <button 
                onClick={() => navigate(`/projects/${id}/workspace`)}
                className="btn-primary btn-sm flex items-center gap-2 uppercase tracking-widest px-5 py-2 shadow-sm"
              >
                <LockKey size={18} weight="bold" /> Workspace
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid Content */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Overview Card */}
          <div className="surface-1 p-8 rounded-lg">
            <h3 className="headline-lg tracking-[-0.02em] mb-6">Overview</h3>
            <div className="space-y-6">
              <p className="body-lg text-text-muted leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-subtle border border-border-subtle mt-8 rounded-sm overflow-hidden">
                <div className="p-6 bg-surface">
                  <span className="label-mono text-text-muted uppercase tracking-[0.2em] block mb-2">Primary Domain</span>
                  <p className="body-md font-medium text-primary">{project.domain || 'Not Specified'}</p>
                </div>
                <div className="p-6 bg-surface">
                  <span className="label-mono text-text-muted uppercase tracking-[0.2em] block mb-2">Core Tech Stack</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.skills && project.skills.length > 0 ? (
                      project.skills.map((skill, idx) => (
                        <span key={idx} className="label-mono px-2 py-1 bg-surface-dim border border-border-subtle rounded text-text-muted">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="body-md font-medium text-primary">Not Specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <ActivityFeed 
            projectId={id} 
            isOwner={isOwner} 
            isMember={isMember} 
            currentUserId={user?.id} 
          />

          {/* Roles Section */}
          <RoleList
            roles={project.roles || []}
            isOwner={isOwner}
            projectId={id}
            onApplyClick={(role) => setApplyModal({ isOpen: true, role })}
            canApply={canApply}
          />

          {/* Applications (Owner Only) */}
          {isOwner && (
            <div className="surface-1 p-8 rounded-lg">
              <h3 className="headline-lg tracking-[-0.02em] mb-6">Applications</h3>
              <div className="space-y-px bg-border-subtle border border-border-subtle rounded-sm overflow-hidden">
                {apps?.filter(app => app.status !== 'REJECTED' && app.status !== 'WITHDRAWN').map(app => (
                  <div key={app.id} className="p-6 bg-surface hover:bg-surface-dim transition-colors flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="body-lg font-bold text-primary">{app.applicantName}</h4>
                        <span className="text-text-muted">for</span>
                        <span className="label-mono font-bold text-primary">{app.roleTitle}</span>
                        <span className={`ml-2 ${
                          app.status === 'PENDING' ? 'badge-warning' : 
                          app.status === 'ACCEPTED' ? 'badge-success' : 
                          'badge-neutral'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="body-sm text-text-muted">{app.message}</p>
                    </div>
                    {app.status === 'PENDING' && (
                      <div className="flex gap-2 items-center">
                        <button 
                          onClick={() => updateAppStatus.mutate({ applicationId: app.id, status: 'REJECTED' })} 
                          disabled={updateAppStatus.isPending && updateAppStatus.variables?.applicationId === app.id}
                          className="btn-secondary btn-sm text-error border-error/20"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleAccept(app)} 
                          disabled={updateAppStatus.isPending && updateAppStatus.variables?.applicationId === app.id}
                          className="btn-primary btn-sm"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {apps?.filter(app => app.status !== 'REJECTED' && app.status !== 'WITHDRAWN').length === 0 && (
                  <div className="p-6 bg-surface text-center">
                    <p className="body-md text-text-muted">No applications yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Project Parameters */}
          <div className="surface-1 p-6 rounded-lg">
            <h3 className="label-mono uppercase tracking-[0.3em] text-text-muted mb-6 border-b border-border-subtle pb-4">
              Project Parameters
            </h3>
            <div className="space-y-5">
              <div>
                <span className="block label-mono text-text-muted uppercase mb-1">Commitment</span>
                <span className="body-md font-medium text-primary">{project.commitment || 'Not specified'}</span>
              </div>
              <div>
                <span className="block label-mono text-text-muted uppercase mb-1">Experience Level</span>
                <span className="body-md font-medium text-primary">{project.experienceLevel || 'Not specified'}</span>
              </div>
              <div>
                <span className="block label-mono text-text-muted uppercase mb-1">Team Size Limit</span>
                <span className="body-md font-medium text-primary">{project.teamSize || 'Open'}</span>
              </div>
            </div>
          </div>

          {/* GitHub Stats Card */}
          <GitHubStatsCard projectId={id} repositoryUrl={project.repositoryUrl} />

          {/* Team Card */}
          <TeamMemberList
            members={members || []}
            isOwner={isOwner}
            currentUserId={user?.id}
            projectId={id}
            ownerId={project.ownerId}
          />
          
        </div>
      </div>

      <ApplyRoleModal
        isOpen={applyModal.isOpen}
        onClose={() => setApplyModal({ isOpen: false, role: null })}
        role={applyModal.role}
        projectId={id}
      />

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
