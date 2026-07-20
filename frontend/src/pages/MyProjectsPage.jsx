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
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">My Projects</h1>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400 font-medium">Manage the projects you have created.</p>
        </div>
        <Link to="/projects/new" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-green-500 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-slate-900 transition-all hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5">
          Create New Project
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/50 border border-slate-700/50"></div>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/20 py-16 sm:py-32 text-center backdrop-blur-sm px-4">
          <FolderOpen size={48} className="mb-4 sm:mb-6 text-slate-500" weight="duotone" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-200">You don't own any projects.</h3>
          <p className="mt-2 text-sm sm:text-base text-slate-400 font-medium">Get started by creating your first project.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects?.map(project => (
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
                <p className="text-sm font-medium text-slate-400 line-clamp-1 mb-3">{project.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Role:</span>
                  <span className="text-sm font-semibold text-slate-300">Owner</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-center gap-3 shrink-0 sm:border-l sm:border-slate-700/50 sm:pl-6 sm:h-full">
                <div className="flex items-center text-green-400 text-sm font-bold gap-1 transition-transform group-hover:translate-x-1">
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
