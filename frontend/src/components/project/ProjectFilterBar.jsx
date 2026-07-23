import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, X, Funnel } from '@phosphor-icons/react';
import { Badge } from '../common/Badge';

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

/**
 * Filter bar for the project dashboard with debounced search, filter chips,
 * and URL search-param synchronisation so filtered views are shareable.
 *
 * @param {{ onFilterChange: (params: object) => void }} props
 */
export function ProjectFilterBar({ onFilterChange }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial state from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [domain, setDomain] = useState(searchParams.get('domain') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');
  const [skills, setSkills] = useState(() => {
    const s = searchParams.get('skills');
    return s ? s.split(',').filter(Boolean) : [];
  });
  const [skillInput, setSkillInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync state → URL and notify parent
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

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (s) => setSkills(skills.filter((sk) => sk !== s));

  const clearAll = () => {
    setSearch('');
    setDomain('');
    setStatus('');
    setExperienceLevel('');
    setSkills([]);
    setSkillInput('');
  };

  const hasActiveFilters = Boolean(debouncedSearch || domain || status || experienceLevel || skills.length);

  const toggleChip = (current, value, setter) => {
    setter(current === value ? '' : value);
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search + toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Search projects by title, description, domain or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 pl-11 pr-10 py-3.5 rounded-2xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 font-medium shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={16} weight="bold" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold border transition-all duration-200 active:scale-95 ${
            showFilters || hasActiveFilters
              ? 'bg-slate-800 border-blue-600/60 text-blue-500 shadow-none font-bold'
              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-900'
          }`}
        >
          <Funnel size={16} weight="bold" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs font-black px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-none">
              {[debouncedSearch, domain, status, experienceLevel].filter(Boolean).length + (skills.length ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-bold text-slate-400 hover:text-slate-200 px-4 py-3 rounded-2xl hover:bg-slate-900/60 transition-colors self-center border border-transparent hover:border-slate-800"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-5 sm:p-6 space-y-6 backdrop-blur-xl shadow-none animate-fade-in">
          {/* Domain chips */}
          <div>
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
              Domain Filter
            </p>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleChip(domain, d, setDomain)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                    domain === d
                      ? 'bg-slate-800 border-blue-600/60 text-blue-500 shadow-none font-bold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Status chips */}
          <div>
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
              Status Filter
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleChip(status, s, setStatus)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                    status === s
                      ? 'bg-slate-800 border-blue-600/60 text-blue-500 shadow-none font-bold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Experience level chips */}
          <div>
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
              Experience Level
            </p>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => toggleChip(experienceLevel, l.value, setExperienceLevel)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                    experienceLevel === l.value
                      ? 'bg-slate-800 border-blue-600/60 text-blue-500 shadow-none font-bold'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skill tags */}
          <div>
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2.5">
              Filter by Required Skills
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type a skill (e.g. React) and press Enter..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1 bg-slate-950/70 border border-slate-800 text-slate-100 placeholder:text-slate-600 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <button
                onClick={addSkill}
                disabled={!skillInput.trim()}
                className="text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2.5 rounded-xl transition-all border border-blue-500/30 disabled:opacity-40"
              >
                Add Tag
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="info" size="sm">
                    {s}
                    <button
                      onClick={() => removeSkill(s)}
                      className="text-blue-400/60 hover:text-blue-300 ml-1"
                    >
                      <X size={10} weight="bold" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
