import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { FolderOpen } from '@phosphor-icons/react';

export function MyProjectsPage() {
  const { data: user } = useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.getMe });
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', 'owner', user?.id],
    queryFn: () => projectsApi.getByOwner(user.id),
    enabled: !!user?.id,
  });

  return (
    <div>
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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2].map(i => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-800/50 border border-slate-700/50"></div>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/20 py-16 sm:py-32 text-center backdrop-blur-sm px-4">
          <FolderOpen size={48} className="mb-4 sm:mb-6 text-slate-500" weight="duotone" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-200">You don't own any projects.</h3>
          <p className="mt-2 text-sm sm:text-base text-slate-400 font-medium">Get started by creating your first project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects?.map(project => (
            <Link 
              to={`/projects/${project.id}`} 
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-green-500/30 hover:bg-slate-800/60 hover:shadow-2xl hover:shadow-green-500/10"
            >
              <div>
                <h3 className="font-bold text-xl text-slate-50 tracking-tight">{project.title}</h3>
                <p className="text-sm font-medium text-slate-400 line-clamp-2 mt-3 leading-relaxed">{project.description}</p>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-slate-700/50 pt-5 text-sm font-semibold text-green-400">
                <span>Manage Project</span>
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
