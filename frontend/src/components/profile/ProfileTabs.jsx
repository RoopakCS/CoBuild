import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretRight, FolderOpen, Clock } from '@phosphor-icons/react';
import { Badge } from '../common/Badge';

const TAB_CONFIG = [
  { key: 'created', label: 'Created Projects' },
  { key: 'collaborated', label: 'Collaborated Projects' },
  { key: 'completed', label: 'Completed Projects' },
];

/**
 * Tabbed view of a user's projects — created, collaborated, and completed (placeholder).
 *
 * @param {{ createdProjects: object[], collaboratedProjects: object[] }} props
 */
export function ProfileTabs({ createdProjects = [], collaboratedProjects = [] }) {
  const [activeTab, setActiveTab] = useState('created');

  const getProjects = () => {
    switch (activeTab) {
      case 'created':
        return createdProjects;
      case 'collaborated':
        return collaboratedProjects;
      case 'completed':
        return null; // placeholder
      default:
        return [];
    }
  };

  const projects = getProjects();

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-sm">
      {/* Tab Switcher */}
      <div className="flex gap-1 bg-slate-900/50 p-1 rounded-xl border border-slate-700/40 mb-6 sm:mb-8 overflow-x-auto">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-0 text-sm font-bold py-2.5 px-3 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-slate-800 text-green-400 shadow-sm border border-slate-700/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'completed' ? (
        // Completed — placeholder
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <Clock size={48} weight="duotone" className="text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">Coming Soon</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Completed projects will appear here once project lifecycle states ship post-V1.
          </p>
        </div>
      ) : projects && projects.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
          <FolderOpen size={48} weight="duotone" className="text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-300 mb-2">No projects yet</h3>
          <p className="text-sm text-slate-500">
            {activeTab === 'created'
              ? 'Projects you create will appear here.'
              : 'Projects you collaborate on will appear here.'}
          </p>
        </div>
      ) : (
        // Project list
        <div className="space-y-3">
          {projects?.map((project) => (
            <Link
              to={`/projects/${project.id}`}
              key={project.id}
              className="group flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/30 p-4 sm:p-5 transition-all hover:border-green-500/30 hover:bg-slate-900/50 hover:shadow-lg hover:shadow-green-500/5"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="font-bold text-base text-slate-100 tracking-tight truncate">
                    {project.title}
                  </h3>
                  {project.status && (
                    <Badge
                      variant={project.status === 'OPEN' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {project.status}
                    </Badge>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-slate-400 line-clamp-1 mb-2">
                    {project.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  {project.domain && (
                    <span className="font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700/50">
                      {project.domain}
                    </span>
                  )}
                  {project.teamSize && <span>Team: {project.teamSize}</span>}
                </div>
              </div>
              <div className="flex items-center text-green-400 text-sm font-bold gap-1 transition-transform group-hover:translate-x-1 shrink-0">
                <CaretRight weight="bold" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
