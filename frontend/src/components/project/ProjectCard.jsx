import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';

export function ProjectCard({ project }) {
  return (
    <div className="group surface-1 rounded-lg overflow-hidden flex flex-col hover:border-text-muted transition-all duration-200 cursor-pointer">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            {project.status !== 'CLOSED' && (
              <span className="badge-success">
                RECRUITING
              </span>
            )}
            <h2 className="headline-lg-mobile mt-2 group-hover:text-tertiary transition-colors tracking-[-0.02em]">{project.title}</h2>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-dim overflow-hidden flex items-center justify-center text-text-muted font-bold text-xs uppercase">
              {project.ownerName ? project.ownerName.substring(0, 2) : 'UK'}
            </div>
            {project.teamSize > 1 && (
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary flex items-center justify-center">
                <span className="label-mono text-surface font-bold">+{project.teamSize - 1}</span>
              </div>
            )}
          </div>
        </div>
        
        <p className="body-md text-text-muted line-clamp-2">
          {project.description}
        </p>
        
        {project.skills && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.skills.slice(0, 4).map((skill, idx) => (
              <span key={idx} className="label-mono px-2 py-1 bg-surface-dim border border-border-subtle rounded text-text-muted">
                {skill}
              </span>
            ))}
            {project.skills.length > 4 && <span className="label-mono px-2 py-1 text-text-muted">+{project.skills.length - 4}</span>}
          </div>
        )}
      </div>
      
      <div className="mt-auto bg-surface px-6 py-4 flex justify-between items-center border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="body-md text-text-muted">By {project.ownerName || 'Unknown'}</span>
        </div>
        <Link to={`/projects/${project.id}`} className="text-primary font-semibold button-text flex items-center gap-1 group/btn">
          View Details 
          <ArrowRight weight="bold" className="body-lg group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
