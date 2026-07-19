import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';

export function UserProfilePage() {
  const { id } = useParams();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id),
  });

  const { data: memberships, isLoading: membershipsLoading } = useQuery({
    queryKey: ['memberships', 'user', id],
    queryFn: () => membershipsApi.getUserMemberships(id),
  });

  if (userLoading) return <div className="text-slate-500 text-lg animate-pulse text-center py-10">Loading profile...</div>;
  if (!user) return <div className="text-red-400 bg-red-500/10 p-8 text-center rounded-2xl border border-red-500/20">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">{user.name}</h1>
        <p className="mt-3 text-lg text-slate-400 font-medium">Developer Profile</p>
      </div>

      <div className="rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8 md:p-10 shadow-2xl backdrop-blur-sm mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Email</p>
            <p className="text-lg font-semibold text-slate-200">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Experience</p>
            <p className="text-lg font-semibold text-slate-200">{user.experienceLevel || 'Not specified'}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Bio</p>
            <p className="text-slate-300 leading-relaxed text-lg">{user.bio || 'No bio provided'}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Links</p>
            <div className="flex gap-6 mt-2">
              {user.githubUrl ? <a href={user.githubUrl} target="_blank" rel="noreferrer" className="text-base font-bold text-green-400 hover:text-green-300 transition-colors">GitHub ↗</a> : <span className="text-slate-600">No GitHub</span>}
              {user.linkedinUrl ? <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-base font-bold text-green-400 hover:text-green-300 transition-colors">LinkedIn ↗</a> : <span className="text-slate-600">No LinkedIn</span>}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-slate-50 mb-6">Projects they are in</h2>
      {membershipsLoading ? (
        <div className="text-slate-500 animate-pulse py-4">Loading projects...</div>
      ) : memberships?.length === 0 ? (
        <div className="text-slate-500 font-medium py-4">This user hasn't joined any projects yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships?.map(mem => (
            <div key={mem.id} className="border border-slate-700/80 bg-slate-900/40 p-6 rounded-2xl">
              <h3 className="font-bold text-lg text-slate-200 mb-2">{mem.projectTitle}</h3>
              <p className="text-sm font-medium text-slate-400">Role: <span className="font-bold text-green-400">{mem.role}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
