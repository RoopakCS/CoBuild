import { Users, Crown, EnvelopeSimple, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';

export function TeamDirectory({ members }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="body-md text-text-muted font-medium">{members?.length || 0} members</p>
        </div>
      </div>

      {/* Members Grid */}
      {(!members || members.length === 0) ? (
        <div className="py-12">
          <p className="body-md text-text-muted">No team members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.userId}
              className="p-5 border border-border-subtle rounded-lg bg-surface group transition-colors hover:border-text-muted flex flex-col"
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 mb-4">
                {member.profilePhotoUrl ? (
                  <img
                    src={member.profilePhotoUrl}
                    alt={member.userName}
                    className="w-12 h-12 rounded-full object-cover border border-border-subtle"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-dim border border-border-subtle flex items-center justify-center text-sm font-bold text-text-muted">
                    {member.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="body-md font-bold text-primary truncate">{member.userName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {member.membershipRole === 'OWNER' ? (
                      <span className="label-mono text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                        <Crown weight="fill" className="w-3 h-3" /> OWNER
                      </span>
                    ) : (
                      <span className="label-mono text-text-muted bg-surface-dim px-1.5 py-0.5 rounded-sm border border-border-subtle">
                        MEMBER
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              {member.projectRoleTitle && (
                <div className="mb-4">
                  <span className="label-mono text-text-main">
                    {member.projectRoleTitle}
                  </span>
                </div>
              )}

              <div className="mt-auto">
                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-border-subtle">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 body-sm text-text-muted hover:text-primary transition-colors truncate"
                  >
                    <EnvelopeSimple weight="bold" className="w-4 h-4 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  {member.githubUrl && (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 body-sm text-text-muted hover:text-primary transition-colors truncate"
                    >
                      <GithubLogo weight="bold" className="w-4 h-4 shrink-0" />
                      <span className="truncate">GitHub</span>
                    </a>
                  )}
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 body-sm text-text-muted hover:text-primary transition-colors truncate"
                    >
                      <LinkedinLogo weight="bold" className="w-4 h-4 shrink-0" />
                      <span className="truncate">LinkedIn</span>
                    </a>
                  )}
                </div>

                {/* Joined */}
                <p className="label-mono text-text-muted lowercase mt-4">
                  Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
