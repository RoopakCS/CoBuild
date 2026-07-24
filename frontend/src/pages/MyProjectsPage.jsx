import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { FolderOpen, CaretRight } from '@phosphor-icons/react';

export function MyProjectsPage() {
  const { data: user } = useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.getMe });
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', 'owner', user?.id],
    queryFn: () => projectsApi.getByOwner(user.id),
    enabled: !!user?.id,
  });

  return (
    <div className="max-w-5xl mx-auto pb-16 animate-fade-in">
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 font-display pb-2 leading-tight">My Projects</h1>
          <p className="mt-2 text-base sm:text-lg text-slate-400 font-medium leading-relaxed">Manage the projects you own and lead.</p>
        </div>
        <Link to="/projects/new" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 text-sm font-bold transition-all duration-200 shadow-md shadow-blue-600/20 active:scale-95">
          Create New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-900/40 border border-slate-800/80"></div>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 py-16 sm:py-24 text-center backdrop-blur-xl px-4">
          <FolderOpen size={48} className="mb-4 text-blue-500/60" weight="duotone" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-200 font-display">You don't own any projects.</h3>
          <p className="mt-1.5 text-sm text-slate-400 font-medium">Get started by creating your first project build.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects?.map(project => (
            <Link 
              to={`/projects/${project.id}`} 
              key={project.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand-border/40 hover:bg-slate-900/70 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="mb-2 flex items-center gap-3">
                  <h3 className="font-bold text-xl text-slate-100 font-display tracking-tight truncate">{project.title}</h3>
                  <span className="shrink-0 inline-flex rounded-full bg-blue-600/15 px-3 py-0.5 text-xs font-bold text-brand-text border border-brand-border/30">
                    {project.status || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-1.5"><span className="text-slate-500 font-semibold">Role:</span><span className="text-brand-text font-extrabold">Owner</span></div>
                  {project.domain && <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-800/50 text-slate-300">{project.domain}</div>}
                  {project.commitment && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-border/60"></span>{project.commitment}</div>}
                  {project.experienceLevel && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>{project.experienceLevel}</div>}
                  {project.teamSize && <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>Team: {project.teamSize}</div>}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-center gap-3 shrink-0 sm:border-l sm:border-slate-800/80 sm:pl-6 sm:h-full">
                <div className="flex items-center text-brand-text font-bold text-sm gap-1.5 transition-transform group-hover:translate-x-1.5">
                  Manage <CaretRight weight="bold" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
