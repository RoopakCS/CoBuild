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

  if (userLoading) return <div className="text-slate-500 text-lg animate-pulse text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-10 mx-auto pb-12">
      <div className="mb-6 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-slate-50">Your Profile</h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400 font-medium">Manage your information, skills, and applications.</p>
      </div>
      
      {/* Profile Info */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50">Basic Info</h2>
          <button 
            onClick={() => { setIsEditing(!isEditing); setEditForm(user); }}
            className="text-xs sm:text-sm font-bold text-green-400 hover:text-green-300 transition-colors bg-green-500/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form className="space-y-4 sm:space-y-5" onSubmit={e => { e.preventDefault(); updateProfile.mutate(editForm); }}>
            <input className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 sm:p-4 rounded-xl text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all" placeholder="Bio" value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
            <input className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 sm:p-4 rounded-xl text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all" placeholder="GitHub URL" value={editForm.githubUrl || ''} onChange={e => setEditForm({...editForm, githubUrl: e.target.value})} />
            <input className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 sm:p-4 rounded-xl text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all" placeholder="LinkedIn URL" value={editForm.linkedinUrl || ''} onChange={e => setEditForm({...editForm, linkedinUrl: e.target.value})} />
            <select className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 sm:p-4 rounded-xl text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all appearance-none" value={editForm.experienceLevel || 'BEGINNER'} onChange={e => setEditForm({...editForm, experienceLevel: e.target.value})}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <div className="pt-2 sm:pt-4 flex justify-end">
              <button type="submit" disabled={updateProfile.isPending} className="w-full sm:w-auto bg-green-500 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 text-sm sm:text-base">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-slate-900/30 p-4 sm:p-6 rounded-2xl border border-slate-700/30">
            <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Name</p><p className="font-semibold text-slate-200 text-base sm:text-lg">{user.name}</p></div>
            <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Email</p><p className="font-semibold text-slate-400 text-sm sm:text-base">{user.email}</p></div>
            <div className="col-span-1 md:col-span-2"><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Bio</p><p className="text-slate-300 text-sm sm:text-base leading-relaxed">{user.bio || 'No bio set.'}</p></div>
            <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Experience</p><p className="font-semibold text-slate-200 text-sm sm:text-base">{user.experienceLevel || 'Not set'}</p></div>
            <div className="flex gap-4">
              <div><p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Links</p>
                <div className="flex gap-3 mt-1">
                  {user.githubUrl ? <a href={user.githubUrl} target="_blank" className="text-sm font-bold text-slate-300 hover:text-green-400 transition-colors">GitHub ↗</a> : <span className="text-sm text-slate-600">No GitHub</span>}
                  {user.linkedinUrl ? <a href={user.linkedinUrl} target="_blank" className="text-sm font-bold text-slate-300 hover:text-green-400 transition-colors">LinkedIn ↗</a> : <span className="text-sm text-slate-600">No LinkedIn</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-sm">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 mb-4 sm:mb-6">Skills</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <input className="bg-slate-900/50 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 px-4 rounded-xl flex-1 text-sm sm:text-base focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all" placeholder="Add a skill (e.g. React)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') addSkill.mutate({name: skillInput}); }} />
          <button onClick={() => addSkill.mutate({ name: skillInput })} disabled={!skillInput.trim()} className="bg-slate-200 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-white transition-colors disabled:opacity-50 text-sm sm:text-base">Add</button>
        </div>
        <div className="flex flex-wrap gap-3">
          {skills?.length === 0 && <span className="text-slate-500 font-medium">No skills added yet.</span>}
          {skills?.map(skill => (
            <span key={skill.id} className="bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 flex items-center gap-3">
              {skill.name}
              <button onClick={() => deleteSkill.mutate(skill.id)} className="text-slate-500 hover:text-red-400 transition-colors font-bold text-lg leading-none mt-[-2px]">&times;</button>
            </span>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-sm">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-50 mb-4 sm:mb-6">Applications</h2>
        {appsLoading ? <div className="text-slate-500 animate-pulse py-4">Loading applications...</div> : (
          <div className="space-y-4">
            {applications?.length === 0 && <div className="text-slate-500 font-medium text-center py-8">You haven't applied to any projects yet.</div>}
            {applications?.map(app => (
              <div key={app.id} className="bg-slate-900/40 border border-slate-700/80 p-5 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-200">{app.projectTitle}</h3>
                  <p className="text-sm font-medium text-slate-400 mt-1">Status: <span className={`font-bold ${app.status === 'PENDING' ? 'text-yellow-400' : app.status === 'ACCEPTED' ? 'text-green-400' : 'text-slate-500'}`}>{app.status}</span></p>
                </div>
                {app.status !== 'WITHDRAWN' && app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                  <button onClick={() => withdrawApp.mutate(app.id)} className="text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors self-start md:self-auto">Withdraw</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
