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
      <div className="mb-8">
        <h1 className="text-3xl font-medium tracking-tight">Projects</h1>
        <p className="mt-2 text-zinc-500">Discover and collaborate on amazing builds.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-zinc-200/50"></div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center text-red-600">
          <p>{error?.response?.data?.message || error.message || 'Failed to fetch projects'}</p>
          <button onClick={() => refetch()} className="mt-4 text-sm font-medium hover:underline">Try again</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 py-24 text-center">
          <FolderOpen size={48} className="mb-4 text-zinc-400" weight="thin" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="mt-1 text-sm text-zinc-500">Get started by creating your first project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link 
              to={`/projects/${project.id}`} 
              key={project.id}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="font-medium text-zinc-900 line-clamp-1">{project.title}</h3>
                  <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                    {project.status || 'ACTIVE'}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-4">{project.description}</p>
                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 3 && <span className="text-xs text-zinc-400 py-1">+{project.skills.length - 3} more</span>}
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                <span className="text-xs font-medium text-zinc-400">{project.ownerName || 'Unknown owner'}</span>
                <CaretRight className="text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-zinc-900" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
