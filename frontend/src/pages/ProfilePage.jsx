import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { applicationsApi } from '../api/applications';
import { skillsApi } from '../api/skills';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const [skillInput, setSkillInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const { data: user, isLoading: userLoading } = useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.getMe });
  const { data: applications, isLoading: appsLoading } = useQuery({ queryKey: ['applications', 'me'], queryFn: applicationsApi.getMyApplications });
  const { data: skills, isLoading: skillsLoading } = useQuery({ queryKey: ['skills', 'me'], queryFn: skillsApi.getMySkills });

  const updateProfile = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      setIsEditing(false);
    }
  });

  const addSkill = useMutation({
    mutationFn: skillsApi.addSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', 'me'] });
      setSkillInput('');
    }
  });

  const deleteSkill = useMutation({
    mutationFn: skillsApi.deleteSkill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills', 'me'] })
  });

  const withdrawApp = useMutation({
    mutationFn: applicationsApi.withdraw,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications', 'me'] })
  });

  if (userLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">Your Profile</h1>
        <p className="text-zinc-500 mt-2">Manage your information, skills, and applications.</p>
      </div>
      
      {/* Profile Info */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Basic Info</h2>
          <button 
            onClick={() => { setIsEditing(!isEditing); setEditForm(user); }}
            className="text-sm font-medium text-blue-600"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); updateProfile.mutate(editForm); }}>
            <input className="w-full border p-2 rounded" placeholder="Bio" value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
            <input className="w-full border p-2 rounded" placeholder="GitHub URL" value={editForm.githubUrl || ''} onChange={e => setEditForm({...editForm, githubUrl: e.target.value})} />
            <input className="w-full border p-2 rounded" placeholder="LinkedIn URL" value={editForm.linkedinUrl || ''} onChange={e => setEditForm({...editForm, linkedinUrl: e.target.value})} />
            <select className="w-full border p-2 rounded" value={editForm.experienceLevel || 'BEGINNER'} onChange={e => setEditForm({...editForm, experienceLevel: e.target.value})}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="EXPERT">Expert</option>
            </select>
            <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded">Save</button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <p className="font-medium">{user.name}</p>
            <p className="text-zinc-500">{user.email}</p>
            <p className="col-span-2 text-sm">{user.bio || 'No bio'}</p>
            <p className="text-sm">Exp: {user.experienceLevel || 'Not set'}</p>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-xl font-medium mb-4">Skills</h2>
        <div className="flex gap-2 mb-4">
          <input className="border p-2 rounded text-sm flex-1" placeholder="Add a skill" value={skillInput} onChange={e => setSkillInput(e.target.value)} />
          <button onClick={() => addSkill.mutate({ name: skillInput })} className="bg-zinc-900 text-white px-4 py-2 rounded text-sm">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills?.map(skill => (
            <span key={skill.id} className="bg-zinc-100 px-3 py-1 rounded text-sm flex items-center gap-2">
              {skill.name}
              <button onClick={() => deleteSkill.mutate(skill.id)} className="text-red-500">&times;</button>
            </span>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-xl font-medium mb-4">Applications</h2>
        {appsLoading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {applications?.map(app => (
              <div key={app.id} className="border p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{app.projectTitle}</h3>
                  <p className="text-sm text-zinc-500">Status: {app.status}</p>
                </div>
                {app.status !== 'WITHDRAWN' && app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                  <button onClick={() => withdrawApp.mutate(app.id)} className="text-sm text-red-600 border border-red-200 px-3 py-1 rounded">Withdraw</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
