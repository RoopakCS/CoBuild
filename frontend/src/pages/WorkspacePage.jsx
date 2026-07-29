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
      <div className="max-w-5xl mx-auto pb-12 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-border-subtle rounded mb-8"></div>
        <div className="h-10 w-64 bg-border-subtle rounded mb-4"></div>
        <div className="flex gap-6 border-b border-border-subtle pb-4">
          <div className="h-6 w-24 bg-border-subtle rounded"></div>
          <div className="h-6 w-24 bg-border-subtle rounded"></div>
          <div className="h-6 w-32 bg-border-subtle rounded"></div>
        </div>
        <div className="h-64 w-full bg-border-subtle rounded-lg"></div>
      </div>
    );
  }

  // ── 403 Forbidden State ──
  if (isForbidden) {
    return (
      <div className="max-w-5xl mx-auto pb-16 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-medium text-sm mb-12"
        >
          <ArrowLeft weight="bold" /> Back
        </button>

        <div className="py-16 text-center border border-border-subtle rounded-lg bg-surface flex flex-col items-center">
          <ShieldWarning weight="duotone" className="w-12 h-12 text-text-muted mb-4 opacity-50" />
          <h2 className="headline-lg tracking-[-0.02em] mb-2">Access Denied</h2>
          <p className="body-md text-text-muted max-w-md">
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
        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-medium text-sm mb-8 group"
      >
        <ArrowLeft weight="bold" className="group-hover:-translate-x-1 transition-transform" /> Back to Project
      </button>

      {/* ── Workspace Header ── */}
      <div className="mb-10">
        <h1 className="headline-xl tracking-[-0.03em] text-primary">
          Workspace
        </h1>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-8 border-b border-border-subtle mb-8 overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-primary'
              }`}
            >
              <Icon weight={isActive ? 'bold' : 'regular'} className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="animate-fade-in">
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
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-border-subtle rounded mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-32 bg-border-subtle rounded-lg"></div>
                <div className="h-32 bg-border-subtle rounded-lg"></div>
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
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-40 bg-border-subtle rounded mb-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-24 bg-border-subtle rounded-lg"></div>
                <div className="h-24 bg-border-subtle rounded-lg"></div>
                <div className="h-24 bg-border-subtle rounded-lg"></div>
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
