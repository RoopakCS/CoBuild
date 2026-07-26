import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';

const DOMAINS = [
  'Web Development',
  'Mobile Development',
  'AI/ML',
  'Data Science',
  'DevOps',
  'Blockchain',
  'Game Development',
  'Cybersecurity',
  'IoT',
  'Cloud Computing',
  'Other',
];

const STATUSES = ['OPEN', 'CLOSED', 'IN_PROGRESS'];

const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export function ProjectFilterBar({ onFilterChange }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [domain, setDomain] = useState(searchParams.get('domain') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');
  const [skills, setSkills] = useState(() => {
    const s = searchParams.get('skills');
    return s ? s.split(',').filter(Boolean) : [];
  });
  
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const syncToUrl = useCallback(() => {
    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (domain) params.domain = domain;
    if (status) params.status = status;
    if (experienceLevel) params.experienceLevel = experienceLevel;
    if (skills.length) params.skills = skills.join(',');
    setSearchParams(params, { replace: true });
    onFilterChange?.(params);
  }, [debouncedSearch, domain, status, experienceLevel, skills, setSearchParams, onFilterChange]);

  useEffect(() => {
    syncToUrl();
  }, [syncToUrl]);

  const clearAll = () => {
    setSearch('');
    setDomain('');
    setStatus('');
    setExperienceLevel('');
    setSkills([]);
  };

  const toggleSkill = (skill) => {
    setSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
      
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-surface-dim border border-border-subtle rounded-lg body-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
        />
      </div>

      {/* Domain */}
      <div className="space-y-3">
        <h3 className="label-mono uppercase text-text-muted">Domain</h3>
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map(d => (
            <label key={d} className="cursor-pointer">
              <input 
                type="radio" 
                name="domain" 
                className="hidden peer"
                checked={domain === d}
                onChange={() => setDomain(d)}
              />
              <span className="px-3 py-1.5 rounded-sm border border-border-subtle body-sm font-medium peer-checked:bg-primary peer-checked:text-surface peer-checked:border-primary transition-all inline-block hover:border-text-muted">
                {d}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <h3 className="label-mono uppercase text-text-muted">Status</h3>
        <div className="space-y-2">
          {STATUSES.map(s => (
            <label key={s} className="flex items-center gap-3 group cursor-pointer">
              <input 
                type="radio"
                name="status"
                className="w-4 h-4 border-border-subtle text-primary focus:ring-primary"
                checked={status === s}
                onChange={() => setStatus(s)}
              />
              <span className="body-md text-primary group-hover:text-primary transition-colors">
                {s.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-3">
        <h3 className="label-mono uppercase text-text-muted">Experience Level</h3>
        <div className="space-y-2">
          {EXPERIENCE_LEVELS.map(l => (
            <label key={l.value} className="flex items-center gap-3 group cursor-pointer">
              <input 
                type="radio" 
                name="exp"
                className="w-4 h-4 border-border-subtle text-primary focus:ring-primary"
                checked={experienceLevel === l.value}
                onChange={() => setExperienceLevel(l.value)}
              />
              <span className="body-md text-primary group-hover:text-primary transition-colors">
                {l.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button 
        onClick={clearAll}
        className="w-full py-2 border border-border-subtle text-primary font-semibold button-text rounded-lg hover:bg-surface-dim transition-colors cursor-pointer"
      >
        Reset Filters
      </button>
    </aside>
  );
}

