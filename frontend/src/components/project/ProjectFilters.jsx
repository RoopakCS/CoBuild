import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, Funnel, X } from '@phosphor-icons/react';

const DOMAINS = [
  'Web Development', 'Mobile Development', 'AI/ML', 'Data Science',
  'DevOps', 'Blockchain', 'Game Development', 'Cybersecurity',
  'IoT', 'Cloud Computing', 'Other',
];

const STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
];

const EXPERIENCE_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export function ProjectFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [domain, setDomain] = useState(searchParams.get('domain') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const syncToUrl = useCallback(() => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      
      if (debouncedSearch) params.set('search', debouncedSearch); else params.delete('search');
      if (domain) params.set('domain', domain); else params.delete('domain');
      if (status) params.set('status', status); else params.delete('status');
      if (experienceLevel) params.set('experienceLevel', experienceLevel); else params.delete('experienceLevel');
      
      return params;
    }, { replace: true });
  }, [debouncedSearch, domain, status, experienceLevel, setSearchParams]);

  useEffect(() => {
    syncToUrl();
  }, [syncToUrl]);

  const clearAll = () => {
    setSearch('');
    setDomain('');
    setStatus('');
    setExperienceLevel('');
  };

  const hasActiveFilters = domain || status || experienceLevel;

  return (
    <div className="w-full mb-8 space-y-4">
      {/* Search and Toggle Row */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-grow">
          <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search projects by title or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-surface border border-border-subtle rounded-md body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary p-1 rounded-full hover:bg-surface-dim transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className={`p-3 rounded-md border transition-all flex items-center justify-center relative shadow-sm hover:shadow-md ${
            isFiltersOpen || hasActiveFilters
              ? 'bg-primary text-surface border-primary' 
              : 'bg-surface border-border-subtle text-text-muted hover:text-primary'
          }`}
          title="Toggle Filters"
        >
          <Funnel size={24} />
          {hasActiveFilters && !isFiltersOpen && (
             <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-surface border border-primary"></span>
          )}
        </button>
      </div>

      {/* Expanded Filters Panel */}
      {isFiltersOpen && (
        <div className="p-6 bg-surface border border-border-subtle rounded-lg shadow-sm animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
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
                  <label key={s.value} className="flex items-center gap-3 group cursor-pointer w-fit">
                    <input 
                      type="radio"
                      name="status"
                      className="w-4 h-4 border-border-subtle text-primary focus:ring-primary"
                      checked={status === s.value}
                      onChange={() => setStatus(s.value)}
                    />
                    <span className="body-md text-primary group-hover:text-primary transition-colors">
                      {s.label}
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
                  <label key={l.value} className="flex items-center gap-3 group cursor-pointer w-fit">
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

          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle flex justify-end">
            <button 
              onClick={clearAll}
              disabled={!hasActiveFilters && !search}
              className="px-6 py-2 border border-border-subtle text-text-muted font-semibold button-text rounded-md hover:bg-surface-dim hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
