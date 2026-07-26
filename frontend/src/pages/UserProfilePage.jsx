import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { membershipsApi } from '../api/memberships';
import { UserCircle, MapPin, Link as LinkIcon, Briefcase } from '@phosphor-icons/react';

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

  if (userLoading) return (
    <div className="pb-16">
      <div className="h-32 skeleton rounded-lg mb-6"></div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 h-64 skeleton rounded-lg"></div>
        <div className="col-span-12 lg:col-span-4 h-64 skeleton rounded-lg"></div>
      </div>
    </div>
  );
  if (!user) return <div className="text-error bg-error-container p-8 text-center rounded-lg border border-error/20">User not found</div>;

  return (
    <div className="pb-16 animate-fade-in">
      
      {/* Header Section */}
      <section className="mb-6">
        <div className="surface-1 rounded-lg p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-surface-dim border-2 border-border-subtle flex-shrink-0 flex items-center justify-center text-text-muted">
               <UserCircle size={64} weight="light" />
            </div>
            <div>
              <h1 className="headline-lg text-primary">{user.name}</h1>
              <p className="label-mono text-text-muted uppercase mt-1 tracking-wider">{user.experienceLevel || 'Developer'} / CoBuild Member</p>
              <div className="flex gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-text-muted body-sm">
                  <MapPin size={16} /> Remote
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* About */}
          <div className="surface-1 rounded-lg p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <UserCircle size={24} className="text-primary" />
              <h2 className="headline-lg-mobile text-primary tracking-tight">About</h2>
            </div>
            <p className="text-text-muted leading-relaxed mb-6 body-md">
              {user.bio || 'This user has not provided a bio.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface p-4 rounded-md border border-border-subtle">
                <p className="label-mono text-text-muted mb-1">EXPERIENCE LEVEL</p>
                <p className="body-md font-bold text-primary">{user.experienceLevel || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Project Highlights / Memberships */}
          <div className="surface-1 rounded-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Briefcase size={24} className="text-primary" />
                <h2 className="headline-lg-mobile text-primary tracking-tight">Projects</h2>
              </div>
            </div>
            
            {membershipsLoading ? (
               <div className="space-y-4">
                 <div className="h-16 skeleton rounded-md"></div>
                 <div className="h-16 skeleton rounded-md"></div>
               </div>
            ) : memberships?.length === 0 ? (
               <p className="text-text-muted body-sm">This user hasn't joined any projects yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberships?.map(mem => (
                  <Link 
                    to={`/projects/${mem.projectId}`} 
                    key={mem.id} 
                    className="bg-surface p-5 rounded-md border border-border-subtle hover:border-primary transition-colors group block cursor-pointer"
                  >
                    <h3 className="body-md font-bold text-primary group-hover:text-primary mb-1 line-clamp-1">{mem.projectTitle}</h3>
                    <p className="label-mono text-text-muted">ROLE: {mem.roleTitle}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={mem.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}>
                        {mem.status === 'ACTIVE' ? 'CONTRIBUTING' : mem.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
