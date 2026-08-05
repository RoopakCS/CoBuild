import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Calendar, Timer, Buildings, Users } from '@phosphor-icons/react';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DeadlinePill({ dateStr }) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return (
    <span className="badge-error">Reg. Closed</span>
  );
  if (diff === 0) return (
    <span className="badge-warning">Closes Today</span>
  );
  if (diff <= 7) return (
    <span className="badge-warning">{diff}d left</span>
  );
  return (
    <span className="badge-neutral">{diff} days left</span>
  );
}

export function HackathonCard({ project }) {
  const openRoles = project.roles?.filter(r => (r.openingsCount - r.filledCount) > 0) ?? [];
  const totalOpenings = openRoles.reduce((sum, r) => sum + (r.openingsCount - r.filledCount), 0);

  return (
    <div className="group surface-1 rounded-lg overflow-hidden flex flex-col hover:border-tertiary transition-all duration-200 cursor-pointer hover:shadow-[0_4px_20px_rgba(59,130,246,0.08)]">

      {/* Top accent strip — indigo, distinguishes from ProjectCard's plain surface */}
      <div className="h-0.5 w-full bg-tertiary opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 space-y-4">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono px-2 py-0.5 rounded-sm uppercase tracking-wider text-tertiary bg-tertiary/10 border border-tertiary/20">
            Hackathon
          </span>
          {project.status === 'OPEN' && (
            <span className="badge-success">Recruiting</span>
          )}
          {project.prizePool && (
            <span className="flex items-center gap-1 label-mono px-2 py-0.5 rounded-sm uppercase tracking-wider text-warning-amber bg-warning-amber/10">
              <Trophy size={10} weight="fill" /> {project.prizePool}
            </span>
          )}
        </div>

        {/* Title row */}
        <div className="flex justify-between items-start gap-3">
          <h2 className="headline-lg-mobile text-primary group-hover:text-tertiary transition-colors tracking-[-0.02em] line-clamp-2 flex-1">
            {project.title}
          </h2>
          {/* Organizer avatar */}
          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-xs bg-tertiary">
            {(project.organizerName || project.ownerName || 'CX').substring(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Description */}
        <p className="body-md text-text-muted line-clamp-2">
          {project.description}
        </p>

        {/* Event date strip — only shown when dates are present */}
        {(project.eventStartDate || project.registrationDeadline) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 py-3 px-4 bg-surface-dim rounded-md border border-border-subtle">
            {project.eventStartDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-text-muted flex-shrink-0" />
                <span className="label-mono text-text-muted">
                  {formatDate(project.eventStartDate)}
                  {project.eventEndDate && <> – {formatDate(project.eventEndDate)}</>}
                </span>
              </div>
            )}
            {project.registrationDeadline && (
              <div className="flex items-center gap-1.5">
                <Timer size={13} className="text-text-muted flex-shrink-0" />
                <DeadlinePill dateStr={project.registrationDeadline} />
              </div>
            )}
            {project.organizerName && (
              <div className="flex items-center gap-1.5">
                <Buildings size={13} className="text-text-muted flex-shrink-0" />
                <span className="label-mono text-text-muted">{project.organizerName}</span>
              </div>
            )}
          </div>
        )}

        {/* Skills */}
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="label-mono px-2 py-1 bg-surface-dim border border-border-subtle rounded text-text-muted">
                {skill}
              </span>
            ))}
            {project.skills.length > 4 && (
              <span className="label-mono px-2 py-1 text-text-muted">+{project.skills.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer — matches ProjectCard footer pattern exactly */}
      <div className="mt-auto bg-surface px-6 py-4 flex justify-between items-center border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <Users size={13} className="text-text-muted" />
          <span className="body-md text-text-muted">
            {totalOpenings > 0 ? `${totalOpenings} open spot${totalOpenings > 1 ? 's' : ''}` : 'Team full'}
          </span>
          {project.domain && (
            <>
              <span className="text-border-subtle">·</span>
              <span className="body-md text-text-muted">{project.domain}</span>
            </>
          )}
        </div>
        <Link
          to={`/projects/${project.id}`}
          className="text-primary font-semibold button-text flex items-center gap-1 group/btn hover:text-tertiary transition-colors"
        >
          View &amp; Apply
          <ArrowRight weight="bold" className="body-lg group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
