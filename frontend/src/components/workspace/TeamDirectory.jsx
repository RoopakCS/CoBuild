import { Users, Crown, EnvelopeSimple, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';

export function TeamDirectory({ members }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-green-500/10 rounded-xl border border-green-500/20">
          <Users weight="duotone" className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Team Directory</h3>
          <p className="text-xs text-slate-500 font-medium">{members?.length || 0} members</p>
        </div>
      </div>

      {/* Members Grid */}
      {(!members || members.length === 0) ? (
        <div className="text-center py-12 text-slate-500">
          <Users weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-slate-400">No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.userId}
              className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-5 transition-all hover:border-blue-500/30 hover:bg-slate-800/50 group"
            >
              {/* Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                {member.profilePhotoUrl ? (
                  <img
                    src={member.profilePhotoUrl}
                    alt={member.userName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 group-hover:border-blue-500/40 transition-colors"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white border-2 border-blue-400/30">
                    {member.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-100 truncate">{member.userName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {member.membershipRole === 'OWNER' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/25 uppercase tracking-wider">
                        <Crown weight="fill" className="w-3 h-3" /> Owner
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/25 uppercase tracking-wider">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Badge */}
              {member.projectRoleTitle && (
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-slate-300 bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-700/50">
                    {member.projectRoleTitle}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 pt-3 border-t border-slate-700/30">
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-400 font-medium transition-colors truncate"
                >
                  <EnvelopeSimple weight="bold" className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </a>
                {member.githubUrl && (
                  <a
                    href={member.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors truncate"
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
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-300 font-medium transition-colors truncate"
                  >
                    <LinkedinLogo weight="bold" className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">LinkedIn</span>
                  </a>
                )}
              </div>

              {/* Joined */}
              <p className="text-[11px] text-slate-600 mt-3 font-medium">
                Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
