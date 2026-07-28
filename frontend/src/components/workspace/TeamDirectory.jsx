import { Users, Crown, EnvelopeSimple, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';

export function TeamDirectory({ members }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-success-green/10 rounded-xl border border-success-green/20">
          <Users weight="duotone" className="w-5 h-5 text-success-green" />
        </div>
        <div>
          <h3 className="headline-lg tracking-[-0.02em]">Team Directory</h3>
          <p className="text-xs text-text-muted font-medium">{members?.length || 0} members</p>
        </div>
      </div>

      {/* Members Grid */}
      {(!members || members.length === 0) ? (
        <div className="text-center py-12 text-text-muted bg-surface-dim/30 border border-dashed border-border-subtle rounded-lg">
          <Users weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-text-main">No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.userId}
              className="rounded-2xl border border-border-subtle bg-surface p-5 transition-all hover:border-primary/40 group"
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                {member.profilePhotoUrl ? (
                  <img
                    src={member.profilePhotoUrl}
                    alt={member.userName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-border-subtle group-hover:ring-primary/40 transition-colors"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-surface-dim flex items-center justify-center text-sm font-bold text-text-muted border-2 border-border-subtle">
                    {member.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-main truncate">{member.userName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {member.membershipRole === 'OWNER' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-warning-amber bg-warning-amber/10 px-2 py-0.5 rounded-full border border-warning-amber/20 uppercase tracking-wider">
                        <Crown weight="fill" className="w-3 h-3" /> Owner
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              {member.projectRoleTitle && (
                <div className="mb-3">
                  <span className="label-mono text-[11px] bg-surface-dim px-2.5 py-1 rounded-lg border border-border-subtle text-text-main">
                    {member.projectRoleTitle}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 pt-3 border-t border-border-subtle">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-xs text-text-muted hover:text-primary font-medium transition-colors truncate"
                >
                  <EnvelopeSimple weight="bold" className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </a>
                {member.githubUrl && (
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-text-muted hover:text-primary font-medium transition-colors truncate"
                  >
                    <GithubLogo weight="bold" className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">GitHub</span>
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-text-muted hover:text-primary font-medium transition-colors truncate"
                  >
                    <LinkedinLogo weight="bold" className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
              </div>

              {/* Joined */}
              <p className="text-[11px] text-text-muted mt-3 font-medium">
                Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
