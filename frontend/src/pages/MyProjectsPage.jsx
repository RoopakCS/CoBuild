import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { applicationsApi } from '../api/applications';
import { useSearchParams } from 'react-router-dom';
import { ProjectFilters } from '../components/project/ProjectFilters';
import { ProjectCard } from '../components/project/ProjectCard';

export function MyProjectsPage() {
  const [activeTab, setActiveTab] = useState('owned');
  const [searchParams] = useSearchParams();

  const search = searchParams.get('search');
  const domain = searchParams.get('domain');
  const experienceLevel = searchParams.get('experienceLevel');
  const status = searchParams.get('status');
  const skills = searchParams.get('skills');
  
  const { data: user } = useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.getMe });
  
  const { data: ownedProjects = [], isLoading: isLoadingOwned } = useQuery({
    queryKey: ['projects', 'owner', user?.id],
    queryFn: () => projectsApi.getByOwner(user.id),
    enabled: !!user?.id,
  });

  const { data: memberships = [], isLoading: isLoadingMemberships } = useQuery({
    queryKey: ['memberships', 'user', user?.id],
    queryFn: () => membershipsApi.getUserMemberships(user.id),
    enabled: !!user?.id,
  });

  const { data: applications = [], isLoading: isLoadingApps } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: applicationsApi.getMyApplications,
    enabled: !!user?.id,
  });

  // Calculate summary stats
  const totalContributions = memberships.filter(m => m.status === 'ACTIVE' || m.status === 'LEAVE_PENDING').length;
  const activeProposals = applications.filter(a => a.status === 'PENDING').length;

  const filteredOwnedProjects = useMemo(() => {
    return ownedProjects.filter(p => {
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (status && p.status !== status) return false;
      if (domain && p.domain !== domain) return false;
      if (experienceLevel && p.experienceLevel !== experienceLevel) return false;
      if (skills) {
        const selectedSkills = skills.split(',').filter(Boolean);
        if (selectedSkills.length > 0 && (!p.skills || !selectedSkills.some(s => p.skills.includes(s)))) return false;
      }
      return true;
    });
  }, [ownedProjects, search, status, domain, experienceLevel, skills]);

  const filteredMemberships = useMemo(() => {
    return memberships.filter(m => {
      if (search && !m.projectTitle?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [memberships, search]);

  const filteredApplications = useMemo(() => {
    return applications.filter(a => {
      if (search && !a.projectTitle?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [applications, search]);

  return (
    <div className="pb-16 flex flex-col gap-8">
      
      {/* Main Content */}
      <div className="flex-grow w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="headline-xl text-primary tracking-[-0.02em] mb-2">Project Hub</h1>
          <p className="body-md text-text-muted max-w-2xl">Manage your initiatives and team collaborations.</p>
        </div>
        
        {/* View Toggle Tabs */}
        <div className="flex p-1 bg-surface-dim rounded-lg w-fit border border-border-subtle">
          <button 
            onClick={() => setActiveTab('owned')}
            className={`px-6 py-2 rounded-md button-text transition-all ${
              activeTab === 'owned' 
                ? 'bg-surface shadow-sm text-primary border border-border-subtle' 
                : 'text-text-muted hover:text-primary border border-transparent'
            }`}
          >
            Owned
          </button>
          <button 
            onClick={() => setActiveTab('joined')}
            className={`px-6 py-2 rounded-md button-text transition-all ${
              activeTab === 'joined' 
                ? 'bg-surface shadow-sm text-primary border border-border-subtle' 
                : 'text-text-muted hover:text-primary border border-transparent'
            }`}
          >
            Joined
          </button>
        </div>
      </div>

      <ProjectFilters />

      {/* Owned Projects Section */}
      {activeTab === 'owned' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
          
          {isLoadingOwned ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-64"></div>
              ))}
            </>
          ) : (
            filteredOwnedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}

        </div>
      )}

      {/* Joined Projects Section */}
      {activeTab === 'joined' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-primary text-surface rounded-lg flex items-center justify-between">
              <div>
                <h4 className="headline-lg font-bold mb-1">Total Contributions</h4>
                <p className="label-mono opacity-80 uppercase tracking-widest">Across all workspaces</p>
              </div>
              <span className="headline-xl">{String(totalContributions).padStart(2, '0')}</span>
            </div>
            <div className="p-6 surface-1 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="headline-lg font-bold mb-1 text-primary">Active Proposals</h4>
                <p className="label-mono text-text-muted uppercase tracking-widest">Pending acceptance</p>
              </div>
              <span className="headline-xl text-primary">{String(activeProposals).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="surface-1 rounded-lg overflow-hidden">
            {(isLoadingMemberships || isLoadingApps) ? (
              <div className="p-8 text-center"><p className="body-md text-text-muted">Loading...</p></div>
            ) : (memberships.length === 0 && applications.length === 0) ? (
              <div className="p-12 text-center">
                <p className="body-lg text-primary mb-2">No joined projects yet.</p>
                <p className="body-sm text-text-muted">Explore the Dashboard to find projects to join.</p>
                <Link to="/" className="btn-secondary mt-6 inline-block">Discover Projects</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface border-b border-border-subtle">
                    <tr>
                      <th className="px-6 py-4 label-mono text-text-muted">PROJECT</th>
                      <th className="px-6 py-4 label-mono text-text-muted">ROLE</th>
                      <th className="px-6 py-4 label-mono text-text-muted">STATUS</th>
                      <th className="px-6 py-4 label-mono text-text-muted text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    
                    {/* Active Memberships */}
                    {filteredMemberships.map(m => (
                      <tr key={`m-${m.id}`} className="hover:bg-surface transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="body-md text-primary font-semibold">{m.projectTitle}</span>
                            <span className="label-mono text-text-muted uppercase tracking-wider mt-1">Workspace</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 label-mono text-text-muted">{m.roleTitle || 'Contributor'}</td>
                        <td className="px-6 py-5">
                          <span className={m.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}>
                            {m.status === 'ACTIVE' ? 'CONTRIBUTING' : 'LEAVING'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link to={`/projects/${m.projectId}`} className="button-text text-primary hover:underline">
                            View Workspace
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {/* Pending Applications */}
                    {filteredApplications.map(app => (
                      <tr key={`a-${app.id}`} className="hover:bg-surface transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="body-md text-primary font-semibold">{app.projectTitle}</span>
                            <span className="label-mono text-text-muted uppercase tracking-wider mt-1">Application</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 label-mono text-text-muted">{app.roleTitle}</td>
                        <td className="px-6 py-5">
                          <span className={
                            app.status === 'PENDING' ? 'badge-warning' : 
                            app.status === 'REJECTED' ? 'badge-error' :
                            'badge-neutral'
                          }>
                            {app.status === 'PENDING' ? 'UNDER REVIEW' : app.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link to={`/projects/${app.projectId}`} className="button-text text-text-muted hover:text-primary">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
