import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CaretRight, FolderOpen } from '@phosphor-icons/react';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { applicationsApi } from '../api/applications';
import { useState, useEffect } from 'react';

export function DashboardPage() {
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [level, setLevel] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

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
  
  const queryParams = { page: 0, size: 20 };
  if (debouncedSearch) queryParams.search = debouncedSearch;
  if (domain) queryParams.domain = domain;
  if (level) queryParams.level = level;

  const { data: pageData, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', queryParams],
    queryFn: () => projectsApi.getAll(queryParams),
  });

  const projects = pageData?.content || [];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">Projects</h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400 font-medium">Discover and collaborate on amazing builds.</p>
      </div>

      {activeProjects.length > 0 && (
        <div className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 mb-4 sm:mb-6">
            Your Active Projects
          </h2>
          <div className="flex flex-col gap-4">
            {activeProjects.map((project) => (
              <Link 
                to={`/projects/${project.id}`} 
                key={project.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-green-500/30 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-bold text-xl text-slate-50 tracking-tight truncate">{project.title}</h3>
                    <span className="shrink-0 inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-400 border border-green-500/20 uppercase tracking-wider">
                      {project.myRole}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-3">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-1.5"><span className="text-slate-500 font-bold uppercase tracking-wider">Owner:</span><span className="text-slate-300 font-semibold">{project.ownerName || (project.myRole === 'Owner' ? 'You' : 'Unknown')}</span></div>
                    {project.domain && <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">{project.domain}</div>}
                    {project.commitment && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>{project.commitment}</div>}
                    {project.experienceLevel && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>{project.experienceLevel}</div>}
                    {project.teamSize && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>Team: {project.teamSize}</div>}
                  </div>
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 5 && <span className="text-xs font-medium text-slate-500 py-1 px-1">+{project.skills.length - 5} more</span>}
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-center gap-3 shrink-0 sm:border-l sm:border-slate-700/50 sm:pl-6 sm:h-full">
                  <div className="flex items-center text-green-400 text-sm font-bold gap-1 transition-transform group-hover:translate-x-1">
                    View <CaretRight weight="bold" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 whitespace-nowrap">Discover Projects</h2>
            <div className="h-px flex-1 bg-slate-700/50 hidden sm:block"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
            />
            <select 
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none"
            >
              <option value="">Any Level</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/50 border border-slate-700/50"></div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 sm:p-8 text-center text-red-400 backdrop-blur-sm">
            <p className="text-base sm:text-lg font-medium">{error?.response?.data?.message || error.message || 'Failed to fetch projects'}</p>
            <button onClick={() => refetch()} className="mt-4 text-sm font-bold bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">Try again</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/20 py-16 sm:py-32 text-center backdrop-blur-sm px-4">
            <FolderOpen size={48} className="mb-4 sm:mb-6 text-slate-500" weight="duotone" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-200">No projects found</h3>
            <p className="mt-2 text-sm sm:text-base text-slate-400 font-medium">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {projects.map((project) => (
              <Link 
                to={`/projects/${project.id}`} 
                key={project.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-6 backdrop-blur-sm transition-all hover:border-green-500/30 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-bold text-xl text-slate-50 tracking-tight truncate">{project.title}</h3>
                    <span className="shrink-0 inline-flex rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-400 border border-green-500/20">
                      {project.status || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-3">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-1.5"><span className="text-slate-500 font-bold uppercase tracking-wider">Owner:</span><span className="text-slate-300 font-semibold">{project.ownerName || 'Unknown'}</span></div>
                    {project.domain && <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">{project.domain}</div>}
                    {project.commitment && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>{project.commitment}</div>}
                    {project.experienceLevel && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>{project.experienceLevel}</div>}
                    {project.teamSize && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>Team: {project.teamSize}</div>}
                  </div>
                  {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.skills.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                      {project.skills.length > 5 && <span className="text-xs font-medium text-slate-500 py-1 px-1">+{project.skills.length - 5} more</span>}
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-center gap-3 shrink-0 sm:border-l sm:border-slate-700/50 sm:pl-6 sm:h-full">
                  <div className="flex items-center text-green-400 text-sm font-bold gap-1 transition-transform group-hover:translate-x-1">
                    View <CaretRight weight="bold" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
