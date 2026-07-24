import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { CaretRight, CaretLeft, FolderOpen } from '@phosphor-icons/react';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { applicationsApi } from '../api/applications';
import { useState, useCallback } from 'react';
import { ProjectFilterBar } from '../components/project/ProjectFilterBar';

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [filterParams, setFilterParams] = useState(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  });

  const { data: user } = useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.getMe });

  const { data: myProjects } = useQuery({
    queryKey: ['projects', 'owner', user?.id],
    queryFn: () => projectsApi.getByOwner(user.id),
    enabled: !!user?.id,
  });

  const { data: memberships } = useQuery({
    queryKey: ['memberships', 'user', user?.id],
    queryFn: () => membershipsApi.getUserMemberships(user.id),
    enabled: !!user?.id,
  });

  const { data: myApplications } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: applicationsApi.getMyApplications,
    enabled: !!user?.id,
  });

  // Build "Your Active Projects" map
  const activeProjectsMap = new Map();
  if (myProjects) {
    myProjects.forEach(p => activeProjectsMap.set(p.id, { ...p, myRole: 'Owner' }));
  }
  if (memberships) {
    memberships.forEach(m => {
      if (!activeProjectsMap.has(m.projectId)) {
        activeProjectsMap.set(m.projectId, { id: m.projectId, title: m.projectTitle, description: 'Member', status: 'ACTIVE', myRole: m.role });
      }
    });
  }
  if (myApplications) {
    myApplications.forEach(app => {
      if (app.status === 'ACCEPTED' && !activeProjectsMap.has(app.projectId)) {
        activeProjectsMap.set(app.projectId, { id: app.projectId, title: app.projectTitle, description: 'Accepted Member', status: 'ACTIVE', myRole: 'Member' });
      }
    });
  }
  const activeProjects = Array.from(activeProjectsMap.values());

  // Pagination state — derived from URL params
  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  // Build query params for the project list endpoint
  const queryParams = { page: currentPage, size: 20 };
  if (filterParams.search) queryParams.search = filterParams.search;
  if (filterParams.domain) queryParams.domain = filterParams.domain;
  if (filterParams.experienceLevel) queryParams.experienceLevel = filterParams.experienceLevel;
  if (filterParams.status) queryParams.status = filterParams.status;
  if (filterParams.skills) queryParams.skills = filterParams.skills.split(',').filter(Boolean);

  const { data: pageData, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', queryParams],
    queryFn: () => projectsApi.getAll(queryParams),
  });

  const rawProjects = pageData?.content || [];
  const projects = user?.id ? rawProjects.filter(p => p.ownerId !== user.id) : rawProjects;
  const totalPages = pageData?.totalPages || 1;

  const handleFilterChange = useCallback((params) => {
    setFilterParams(params);
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-fade-in">
      {/* Hero Header Section */}
      <div className="relative mb-8 sm:mb-12 overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950/90 p-6 sm:p-10 backdrop-blur-xl shadow-md">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 font-display pb-2 leading-tight">
              Build Together
            </h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
              Discover active projects, find talented teammates, and bring your tech ideas to life.
            </p>
          </div>
          
          <Link
            to="/projects/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all duration-300 shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <FolderOpen size={18} weight="bold" />
            <span>Create New Build</span>
          </Link>
        </div>
      </div>

      {activeProjects.length > 0 && (
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-display flex items-center gap-2">
              <span>Your Active Projects</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/15 text-brand-text border border-brand-border/30 font-bold">
                {activeProjects.length}
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-3.5">
            {activeProjects.map((project) => (
              <Link 
                to={`/projects/${project.id}`} 
                key={project.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand-border/40 hover:bg-slate-900/80 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-bold text-xl text-slate-100 tracking-tight truncate group-hover:text-brand-text transition-colors duration-300 font-display">{project.title}</h3>
                    <span className="shrink-0 inline-flex rounded-full bg-blue-600/15 px-3 py-0.5 text-xs font-bold text-brand-text border border-brand-border/30 uppercase tracking-wider">
                      {project.myRole}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-1.5"><span className="text-slate-500 font-semibold">Owner:</span><span className="text-slate-300 font-semibold">{project.ownerName || (project.myRole === 'Owner' ? 'You' : 'Unknown')}</span></div>
                    {project.domain && <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-800/50 text-slate-300">{project.domain}</div>}
                    {project.commitment && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-border/60"></span>{project.commitment}</div>}
                    {project.experienceLevel && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>{project.experienceLevel}</div>}
                    {project.teamSize && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>Team: {project.teamSize}</div>}
                  </div>
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="text-xs font-medium bg-slate-950/80 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 5 && <span className="text-xs font-medium text-slate-500 py-1 px-1">+{project.skills.length - 5} more</span>}
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-center gap-3 shrink-0 sm:border-l sm:border-slate-800/80 sm:pl-6 sm:h-full">
                  <div className="flex items-center text-brand-text font-bold text-sm gap-1.5 transition-all duration-300 group-hover:translate-x-1.5">
                    View Project <CaretRight weight="bold" size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-display whitespace-nowrap">Discover Projects</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-800 via-slate-800/40 to-transparent hidden sm:block"></div>
        </div>

        {/* ── Filter Bar (M3) ── */}
        <ProjectFilterBar onFilterChange={handleFilterChange} />

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-900/40 border border-slate-800/60"></div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 sm:p-8 text-center text-red-400 backdrop-blur-md">
            <p className="text-base sm:text-lg font-medium">{error?.response?.data?.message || error.message || 'Failed to fetch projects'}</p>
            <button onClick={() => refetch()} className="mt-4 text-sm font-bold bg-slate-800 px-5 py-2.5 rounded-xl hover:bg-slate-700 transition-all duration-200">Try again</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 py-16 sm:py-24 text-center backdrop-blur-md px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-4 text-slate-400">
              <FolderOpen size={32} weight="duotone" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-200 font-display">No projects found</h3>
            <p className="mt-2 text-sm sm:text-base text-slate-400 font-medium">Try adjusting your search filters.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3.5">
              {projects.map((project) => (
                <Link 
                  to={`/projects/${project.id}`} 
                  key={project.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 sm:p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand-border/40 hover:bg-slate-900/70 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="font-bold text-xl text-slate-100 tracking-tight truncate group-hover:text-brand-text transition-colors duration-300 font-display">{project.title}</h3>
                      <span className="shrink-0 inline-flex rounded-full bg-blue-600/15 px-3 py-0.5 text-xs font-bold text-brand-text border border-brand-border/30">
                        {project.status || 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-medium text-slate-400">
                      <div className="flex items-center gap-1.5"><span className="text-slate-500 font-semibold">Owner:</span><span className="text-slate-300 font-semibold">{project.ownerName || 'Unknown'}</span></div>
                      {project.domain && <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800/50 text-slate-300">{project.domain}</div>}
                      {project.commitment && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-border/60"></span>{project.commitment}</div>}
                      {project.experienceLevel && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>{project.experienceLevel}</div>}
                      {project.teamSize && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>Team: {project.teamSize}</div>}
                    </div>
                    {project.skills && project.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="text-xs font-medium bg-slate-950/80 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                            {skill}
                          </span>
                        ))}
                        {project.skills.length > 5 && <span className="text-xs font-medium text-slate-500 py-1 px-1">+{project.skills.length - 5} more</span>}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-center gap-3 shrink-0 sm:border-l sm:border-slate-800/80 sm:pl-6 sm:h-full">
                    <div className="flex items-center text-brand-text font-bold text-sm gap-1 transition-all duration-300 group-hover:translate-x-1.5">
                      Explore <CaretRight weight="bold" size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <Link
                  to={`?${new URLSearchParams({ ...filterParams, page: Math.max(0, currentPage - 1) }).toString()}`}
                  className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all border ${
                    currentPage === 0
                      ? 'border-slate-800 text-slate-600 pointer-events-none opacity-50'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100 shadow-md'
                  }`}
                >
                  <CaretLeft size={16} weight="bold" />
                  Previous
                </Link>
                <span className="text-sm font-semibold text-slate-400 px-2">
                  Page <span className="text-slate-200">{currentPage + 1}</span> of {totalPages}
                </span>
                <Link
                  to={`?${new URLSearchParams({ ...filterParams, page: Math.min(totalPages - 1, currentPage + 1) }).toString()}`}
                  className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl transition-all border ${
                    currentPage >= totalPages - 1
                      ? 'border-slate-800 text-slate-600 pointer-events-none opacity-50'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100 shadow-md'
                  }`}
                >
                  Next
                  <CaretRight size={16} weight="bold" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
