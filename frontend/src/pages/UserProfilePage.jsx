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

  if (userLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-medium tracking-tight mb-8">{user.name}'s Profile</h1>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 mb-8">
        <p className="text-sm font-medium">Email: {user.email}</p>
        <p className="text-sm text-zinc-600 mt-2">{user.bio || 'No bio provided'}</p>
        {user.githubUrl && <a href={user.githubUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm block mt-2">GitHub</a>}
        {user.linkedinUrl && <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-sm block mt-1">LinkedIn</a>}
        <p className="text-sm text-zinc-600 mt-2">Experience: {user.experienceLevel}</p>
      </div>

      <h2 className="text-xl font-medium mb-4">Projects they are in</h2>
      {membershipsLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {memberships?.map(mem => (
            <div key={mem.id} className="border border-zinc-200 p-4 rounded-xl">
              <h3 className="font-medium">{mem.projectTitle}</h3>
              <p className="text-sm text-zinc-500">Role: {mem.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
