import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CaretRight, FolderOpen } from '@phosphor-icons/react';
import { projectsApi } from '../api/projects';

export function DashboardPage() {
  const { data: pageData, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll({ page: 0, size: 20 }),
  });

  const projects = pageData?.content || [];

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">Projects</h1>
        <p className="mt-3 text-lg text-slate-400 font-medium">Discover and collaborate on amazing builds.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-800/50 border border-slate-700/50"></div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400 backdrop-blur-sm">
          <p className="text-lg font-medium">{error?.response?.data?.message || error.message || 'Failed to fetch projects'}</p>
          <button onClick={() => refetch()} className="mt-4 text-sm font-bold bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">Try again</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-800/20 py-32 text-center backdrop-blur-sm">
          <FolderOpen size={56} className="mb-6 text-slate-500" weight="duotone" />
          <h3 className="text-xl font-bold text-slate-200">No projects found</h3>
          <p className="mt-2 text-slate-400 font-medium">Get started by creating your first project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link 
              to={`/projects/${project.id}`} 
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-green-500/30 hover:bg-slate-800/60 hover:shadow-2xl hover:shadow-green-500/10"
            >
              <div>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <h3 className="font-bold text-xl text-slate-50 tracking-tight line-clamp-1">{project.title}</h3>
                  <span className="shrink-0 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400 border border-green-500/20">
                    {project.status || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-6 leading-relaxed">{project.description}</p>
                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 px-2.5 py-1 rounded-md">
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 3 && <span className="text-xs font-medium text-slate-500 py-1 px-1">+{project.skills.length - 3} more</span>}
                  </div>
                )}
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-slate-700/50 pt-5">
                <span className="text-sm font-semibold text-slate-300">{project.ownerName || 'Unknown owner'}</span>
                <CaretRight weight="bold" className="text-slate-500 transition-all group-hover:translate-x-2 group-hover:text-green-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
