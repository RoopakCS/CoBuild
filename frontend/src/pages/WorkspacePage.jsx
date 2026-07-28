import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspace';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { ArrowLeft, LockKey, Megaphone, Link as LinkIcon, Users, ShieldWarning } from '@phosphor-icons/react';

import { AnnouncementsList } from '../components/workspace/AnnouncementsList';
import { WorkspaceLinksList } from '../components/workspace/WorkspaceLinksList';
import { TeamDirectory } from '../components/workspace/TeamDirectory';

const TABS = [
  { key: 'announcements', label: 'Announcements', icon: Megaphone },
  { key: 'resources', label: 'Resources', icon: LinkIcon },
  { key: 'team', label: 'Team Directory', icon: Users },
];

export function WorkspacePage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('announcements');

  const { data: user } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getById(projectId),
  });

  // Fetch workspace data — if user isn't authorized, these will return 403
  const {
    data: announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useQuery({
    queryKey: ['workspace', 'announcements', projectId],
    queryFn: () => workspaceApi.getAnnouncements(projectId),
    enabled: !!projectId,
    retry: false,
  });

  const { data: links, isLoading: linksLoading } = useQuery({
    queryKey: ['workspace', 'links', projectId],
    queryFn: () => workspaceApi.getLinks(projectId),
    enabled: !!projectId && activeTab === 'resources',
    retry: false,
  });

  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['workspace', 'team', projectId],
    queryFn: () => workspaceApi.getTeamDirectory(projectId),
    enabled: !!projectId && activeTab === 'team',
    retry: false,
  });

  const isOwner = user?.id === project?.ownerId;
  const isForbidden = announcementsError?.response?.status === 403;

  // ── Loading State ──
  if (projectLoading || announcementsLoading) {
    return (
      <div className="max-w-5xl mx-auto pb-12 animate-pulse">
        <div className="h-6 w-32 bg-surface-dim rounded mb-8"></div>
        <div className="rounded-2xl border border-border-subtle bg-surface p-8 h-24 mb-6"></div>
        <div className="flex gap-3 mb-8">
          <div className="h-10 w-36 bg-surface rounded-xl"></div>
          <div className="h-10 w-28 bg-surface rounded-xl"></div>
          <div className="h-10 w-36 bg-surface rounded-xl"></div>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-dim p-8 h-64"></div>
      </div>
    );
  }

  // ── 403 Forbidden State ──
  if (isForbidden) {
    return (
      <div className="max-w-5xl mx-auto pb-16 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-primary transition-all font-semibold text-sm group mb-8"
        >
          <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="rounded-3xl border border-error/20 bg-error-container p-12 text-center backdrop-blur-xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center">
            <ShieldWarning weight="duotone" className="w-8 h-8 text-error" />
          </div>
          <h2 className="headline-lg tracking-[-0.02em] mb-3">Access Denied</h2>
          <p className="text-base text-text-muted font-medium max-w-md mx-auto leading-relaxed">
            This workspace is restricted to active team members. You must be part of this project to view its private workspace.
          </p>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="mt-8 btn-secondary"
          >
            View Project Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-fade-in">
      {/* ── Back Navigation ── */}
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-all font-semibold text-sm group mb-6"
      >
        <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" /> Back to Project
      </button>

      {/* ── Workspace Header ── */}
      <div className="rounded-3xl border border-border-subtle bg-surface-dim p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-success-green/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner">
            <LockKey weight="duotone" className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-xs text-text-muted font-extrabold uppercase tracking-widest mb-1">Private Workspace</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main tracking-tight font-display">
              {project?.title || 'Project Workspace'}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 mb-8 p-1 bg-surface-dim rounded-2xl border border-border-subtle backdrop-blur-md">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-md'
                  : 'text-text-muted hover:text-text-main hover:bg-surface border border-transparent'
              }`}
            >
              <Icon weight={isActive ? 'duotone' : 'regular'} className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-xl backdrop-blur-sm">
        {activeTab === 'announcements' && (
          <AnnouncementsList
            announcements={announcements || []}
            projectId={projectId}
            currentUserId={user?.id}
            isOwner={isOwner}
          />
        )}

        {activeTab === 'resources' && (
          linksLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 bg-surface-dim rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-28 bg-surface rounded-2xl"></div>
                <div className="h-28 bg-surface rounded-2xl"></div>
              </div>
            </div>
          ) : (
            <WorkspaceLinksList
              links={links || []}
              projectId={projectId}
              currentUserId={user?.id}
              isOwner={isOwner}
            />
          )
        )}

        {activeTab === 'team' && (
          teamLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 bg-surface-dim rounded"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-40 bg-surface rounded-2xl"></div>
                <div className="h-40 bg-surface rounded-2xl"></div>
                <div className="h-40 bg-surface rounded-2xl"></div>
              </div>
            </div>
          ) : (
            <TeamDirectory members={teamMembers || []} />
          )
        )}
      </div>
    </div>
  );
}
