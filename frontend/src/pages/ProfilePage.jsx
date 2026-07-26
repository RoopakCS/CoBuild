import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { applicationsApi } from '../api/applications';
import { skillsApi } from '../api/skills';
import { SignOut, PencilSimple, Code, Link as LinkIcon, ClipboardText, UserCircle, MapPin, X } from '@phosphor-icons/react';

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
    <div className="pb-16 space-y-6">
      <div className="h-32 skeleton rounded-lg"></div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 h-64 skeleton rounded-lg"></div>
        <div className="col-span-12 lg:col-span-4 h-64 skeleton rounded-lg"></div>
      </div>
    </div>
  );

  const inputClass = "w-full rounded-md bg-surface-dim border border-border-subtle px-4 py-3 body-md text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="pb-16 animate-fade-in">
      
      {/* Header Section */}
      <section className="mb-6">
        <div className="surface-1 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-primary border-2 border-border-subtle flex-shrink-0 flex items-center justify-center">
               <span className="text-surface font-bold text-[28px] sm:text-[32px] tracking-tight">{user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}</span>
            </div>
            <div>
              <h1 className="headline-lg text-primary">{user.name}</h1>
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-text-muted body-sm">
                  <MapPin size={16} /> Remote
                </span>
                <span className="flex items-center gap-1.5 text-text-muted body-sm">
                   <LinkIcon size={16} /> {user.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => { setIsEditing(!isEditing); setEditForm(user); }}
              className="btn-secondary px-6 py-2.5 flex items-center justify-center gap-2"
            >
              <PencilSimple size={18} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button 
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-md button-text transition-all border border-error/20 text-error hover:bg-error/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <SignOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Bento Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* About Me / Edit Form */}
          <div className="surface-1 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle size={24} className="text-primary" />
              <h2 className="headline-lg-mobile text-primary tracking-tight">About Me</h2>
            </div>
            
            {isEditing ? (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); updateProfile.mutate(editForm); }}>
                <div>
                  <textarea 
                    className={`${inputClass} resize-none`} 
                    placeholder="Bio" rows={4} 
                    maxLength={300}
                    value={editForm.bio || ''} 
                    onChange={e => setEditForm({...editForm, bio: e.target.value})} 
                  />
                  <p className="label-mono text-text-muted mt-1 text-right">{(editForm.bio || '').length} / 300</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    className={inputClass} 
                    placeholder="GitHub URL" 
                    value={editForm.githubUrl || ''} 
                    onChange={e => setEditForm({...editForm, githubUrl: e.target.value})} 
                  />
                  <input 
                    className={inputClass} 
                    placeholder="LinkedIn URL" 
                    value={editForm.linkedinUrl || ''} 
                    onChange={e => setEditForm({...editForm, linkedinUrl: e.target.value})} 
                  />
                </div>
                <div>
                  <select className={inputClass} value={editForm.experienceLevel || 'BEGINNER'} onChange={e => setEditForm({...editForm, experienceLevel: e.target.value})}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end">
                  <button type="submit" disabled={updateProfile.isPending} className="btn-primary px-8 py-2.5 w-full sm:w-auto">
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-text-muted leading-relaxed mb-6 body-md">
                  {user.bio || 'No bio provided. Click Edit Profile to add one.'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-md border border-border-subtle">
                    <p className="label-mono text-text-muted mb-1">EXPERIENCE LEVEL</p>
                    <p className="body-md font-bold text-primary">{user.experienceLevel || 'Not set'}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Technical Stack (Skills) */}
          <div className="surface-1 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Code size={24} className="text-primary" />
              <h2 className="headline-lg-mobile text-primary tracking-tight">Technical Stack</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input 
                className={`flex-1 ${inputClass}`} 
                placeholder="Add a skill (e.g. React, Rust)" 
                value={skillInput} 
                onChange={e => setSkillInput(e.target.value)} 
                onKeyDown={(e) => { if(e.key === 'Enter' && skillInput.trim()) addSkill.mutate({name: skillInput}); }} 
              />
              <button 
                onClick={() => addSkill.mutate({ name: skillInput })} 
                disabled={addSkill.isPending || !skillInput.trim()} 
                className="btn-secondary px-6 py-3 w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Add Skill
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skills?.length === 0 && <span className="text-text-muted body-sm">No skills added yet.</span>}
              {skills?.map(skill => (
                <span key={skill.id} className="bg-surface text-primary px-3 py-1.5 rounded-md label-mono font-semibold border border-border-subtle flex items-center gap-2 group">
                  {skill.name}
                  <button 
                    onClick={() => deleteSkill.mutate(skill.id)} 
                    className="text-text-muted hover:text-error transition-colors cursor-pointer"
                  >
                    <X size={14} weight="bold" />
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Connect Links */}
          <div className="surface-1 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon size={24} className="text-primary" />
              <h2 className="headline-lg-mobile text-primary tracking-tight">Connect</h2>
            </div>
            <div className="space-y-2">
              <a 
                href={user.githubUrl || '#'} 
                target={user.githubUrl ? "_blank" : undefined}
                rel="noreferrer"
                className={`flex items-center justify-between group p-3 rounded-md transition-all border border-transparent ${user.githubUrl ? 'hover:bg-surface hover:border-border-subtle cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <span className={`body-md ${user.githubUrl ? 'text-text-muted group-hover:text-primary' : 'text-text-muted'}`}>GitHub</span>
                <ArrowUpRightIcon active={!!user.githubUrl} />
              </a>
              <a 
                href={user.linkedinUrl || '#'} 
                target={user.linkedinUrl ? "_blank" : undefined}
                rel="noreferrer"
                className={`flex items-center justify-between group p-3 rounded-md transition-all border border-transparent ${user.linkedinUrl ? 'hover:bg-surface hover:border-border-subtle cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
              >
                <span className={`body-md ${user.linkedinUrl ? 'text-text-muted group-hover:text-primary' : 'text-text-muted'}`}>LinkedIn</span>
                <ArrowUpRightIcon active={!!user.linkedinUrl} />
              </a>
            </div>
          </div>

          {/* Active Applications */}
          <div className="surface-1 rounded-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ClipboardText size={24} className="text-primary" />
                <h2 className="headline-lg-mobile text-primary tracking-tight">Applications</h2>
              </div>
              <span className="label-mono bg-primary text-surface px-2 py-0.5 rounded-sm">
                {applications?.length || 0}
              </span>
            </div>
            
            {appsLoading ? (
              <div className="space-y-4">
                <div className="h-16 skeleton rounded-md"></div>
              </div>
            ) : applications?.length === 0 ? (
               <p className="text-text-muted body-sm">No active applications.</p>
            ) : (
              <div className="space-y-4">
                {applications?.map(app => (
                  <div key={app.id} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-sm mt-1.5 ${
                        app.status === 'ACCEPTED' ? 'bg-success-green' : 
                        app.status === 'PENDING' ? 'bg-warning-amber' : 
                        app.status === 'REJECTED' ? 'bg-error' : 'bg-border-subtle'
                      }`}></div>
                      <div className="w-[1px] h-full bg-border-subtle mt-1.5"></div>
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start">
                        <p className="body-md font-bold text-primary">{app.projectTitle}</p>
                        <span className={`label-mono uppercase tracking-wider ${
                          app.status === 'ACCEPTED' ? 'text-success-green' : 
                          app.status === 'PENDING' ? 'text-warning-amber' : 
                          app.status === 'REJECTED' ? 'text-error' : 'text-text-muted'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="body-sm text-text-muted mt-0.5">{app.roleTitle}</p>
                      
                      {app.status === 'PENDING' && (
                        <button 
                          onClick={() => withdrawApp.mutate(app.id)} 
                          disabled={withdrawApp.isPending && withdrawApp.variables === app.id}
                          className="mt-2 label-mono text-text-muted hover:text-error transition-colors uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowUpRightIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-text-muted group-hover:text-primary transition-colors" : "text-text-muted opacity-50"}>
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  );
}
