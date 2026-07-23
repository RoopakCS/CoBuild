import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { applicationsApi } from '../api/applications';
import { skillsApi } from '../api/skills';
import { ProfileTabs } from '../components/profile/ProfileTabs';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (userLoading) return (
    <div className="max-w-4xl space-y-6 sm:space-y-10 mx-auto pb-12 animate-pulse">
      <div className="mb-6 sm:mb-10">
        <div className="h-10 sm:h-12 w-48 bg-slate-800/80 rounded-lg mb-4"></div>
        <div className="h-5 sm:h-6 w-64 bg-slate-800/50 rounded-lg"></div>
      </div>
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 md:p-10 h-64"></div>
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 md:p-10 h-48"></div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 sm:space-y-10 mx-auto pb-16 animate-fade-in">
      <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 font-display pb-2 leading-tight">Your Profile</h1>
          <p className="mt-2 text-base sm:text-lg text-slate-400 font-medium leading-relaxed">Manage your developer bio, skills, and project applications.</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4.5 py-2.5 rounded-xl transition-all duration-200 self-start sm:self-auto active:scale-95 shadow-sm"
        >
          Sign Out
        </button>
      </div>
      
      {/* Profile Info */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-display">Basic Info</h2>
          <button 
            onClick={() => { setIsEditing(!isEditing); setEditForm(user); }}
            className="text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 transition-all duration-200 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-xl active:scale-95"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form className="space-y-4 sm:space-y-5" onSubmit={e => { e.preventDefault(); updateProfile.mutate(editForm); }}>
            <textarea className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 p-4 rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none" placeholder="Bio" rows={3} value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} />
            <input className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 p-4 rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="GitHub URL" value={editForm.githubUrl || ''} onChange={e => setEditForm({...editForm, githubUrl: e.target.value})} />
            <input className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 p-4 rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="LinkedIn URL" value={editForm.linkedinUrl || ''} onChange={e => setEditForm({...editForm, linkedinUrl: e.target.value})} />
            <select className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 p-4 rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" value={editForm.experienceLevel || 'BEGINNER'} onChange={e => setEditForm({...editForm, experienceLevel: e.target.value})}>
              <option value="BEGINNER" className="bg-slate-900 text-slate-100">Beginner</option>
              <option value="INTERMEDIATE" className="bg-slate-900 text-slate-100">Intermediate</option>
              <option value="ADVANCED" className="bg-slate-900 text-slate-100">Advanced</option>
            </select>
            <div className="pt-2 sm:pt-4 flex justify-end">
              <button type="submit" disabled={updateProfile.isPending} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 text-sm">
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-slate-950/50 p-5 sm:p-6 rounded-2xl border border-slate-800/80">
            <div><p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Name</p><p className="font-bold text-slate-100 text-base sm:text-lg font-display">{user.name}</p></div>
            <div><p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Email</p><p className="font-semibold text-slate-300 text-sm sm:text-base">{user.email}</p></div>
            <div className="col-span-1 md:col-span-2"><p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Bio</p><p className="text-slate-300 text-sm leading-relaxed font-medium">{user.bio || 'No bio set.'}</p></div>
            <div><p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Experience</p><p className="font-bold text-slate-200 text-sm sm:text-base font-display">{user.experienceLevel || 'Not set'}</p></div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-widest mb-1">Social Links</p>
              <div className="flex gap-4 mt-1">
                {user.githubUrl ? <a href={user.githubUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:underline">GitHub ↗</a> : <span className="text-xs text-slate-600">No GitHub</span>}
                {user.linkedinUrl ? <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-400 hover:underline">LinkedIn ↗</a> : <span className="text-xs text-slate-600">No LinkedIn</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-display mb-4 sm:mb-6">Skills & Technologies</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <input className="bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 p-3.5 px-4.5 rounded-2xl flex-1 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="Add a skill (e.g. React, Rust, GraphQL)" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') addSkill.mutate({name: skillInput}); }} />
          <button 
            onClick={() => addSkill.mutate({ name: skillInput })} 
            disabled={addSkill.isPending || !skillInput.trim()} 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-2xl transition-all duration-200 disabled:opacity-50 text-sm shadow-md shadow-blue-600/20 active:scale-95 shrink-0"
          >
            {addSkill.isPending ? 'Adding...' : 'Add Skill'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {skills?.length === 0 && <span className="text-slate-500 text-sm font-medium">No skills added yet.</span>}
          {skills?.map(skill => (
            <span key={skill.id} className="bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2.5 shadow-sm">
              {skill.name}
              <button onClick={() => deleteSkill.mutate(skill.id)} className="text-slate-500 hover:text-red-400 transition-colors font-bold text-base leading-none">&times;</button>
            </span>
          ))}
        </div>
      </div>

      {/* Applications */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 font-display mb-4 sm:mb-6">Your Applications</h2>
        {appsLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-24 bg-slate-900/40 rounded-2xl"></div>
            <div className="h-24 bg-slate-900/40 rounded-2xl"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications?.length === 0 && <div className="text-slate-500 font-medium text-center py-8 text-sm">You haven't applied to any projects yet.</div>}
            {applications?.map(app => (
              <div key={app.id} className="bg-slate-950/50 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-all hover:border-slate-700">
                <div>
                  <h3 className="font-bold text-lg text-slate-100 font-display">{app.projectTitle} <span className="text-xs font-normal text-slate-400 ml-1">for {app.roleTitle}</span></h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1.5 flex items-center gap-2">
                    Status: 
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${app.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : app.status === 'ACCEPTED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {app.status}
                    </span>
                  </p>
                </div>
                {app.status !== 'WITHDRAWN' && app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                  <button 
                    onClick={() => withdrawApp.mutate(app.id)} 
                    disabled={withdrawApp.isPending && withdrawApp.variables === app.id}
                    className="text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-xl transition-all duration-200 self-start md:self-auto disabled:opacity-50 active:scale-95"
                  >
                    {withdrawApp.isPending && withdrawApp.variables === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Profile Tabs — Created / Collaborated / Completed (M3) ── */}
      <ProfileTabs
        createdProjects={user?.createdProjects || []}
        collaboratedProjects={user?.collaboratedProjects || []}
      />
    </div>
  );
}
