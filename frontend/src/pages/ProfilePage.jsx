import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { applicationsApi } from '../api/applications';

export function ProfilePage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.getMe(),
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => applicationsApi.getMyApplications(),
  });

  if (userLoading) return <div className="text-zinc-500">Loading profile...</div>;
  if (!user) return <div className="text-red-500">Failed to load profile.</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-medium tracking-tight mb-8">Your Profile</h1>
      
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm mb-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Name</h4>
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Email</h4>
            <p className="text-sm font-medium">{user.email}</p>
          </div>
          <div className="col-span-2">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Bio</h4>
            <p className="text-sm text-zinc-600">{user.bio || 'No bio provided.'}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-medium tracking-tight mb-4">Your Applications</h2>
      {appsLoading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-zinc-200/50"></div>
      ) : applications?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {applications.map(app => (
            <div key={app.id} className="rounded-xl border border-zinc-200 bg-white p-5 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-zinc-900">{app.projectTitle || 'Unknown Project'}</h4>
                <p className="text-sm text-zinc-500 mt-1">Status: <span className="font-medium">{app.status}</span></p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center text-zinc-500">
          You haven't applied to any projects yet.
        </div>
      )}
    </div>
  );
}
