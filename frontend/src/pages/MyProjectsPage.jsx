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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">My Projects</h1>
          <p className="mt-2 text-zinc-500">Manage the projects you have created.</p>
        </div>
        <Link to="/projects/new" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Create New
        </Link>
      </div>

      {isLoading ? (
        <div className="text-zinc-500">Loading your projects...</div>
      ) : projects?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 py-16 text-center">
          <FolderOpen size={48} className="mb-4 text-zinc-400" />
          <h3 className="font-medium">You don't own any projects.</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map(project => (
            <Link 
              to={`/projects/${project.id}`} 
              key={project.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 hover:border-zinc-300"
            >
              <h3 className="font-medium text-zinc-900">{project.title}</h3>
              <p className="text-sm text-zinc-500 line-clamp-2 mt-2">{project.description}</p>
              <div className="mt-4 text-xs font-medium text-zinc-400">Manage Project &rarr;</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
