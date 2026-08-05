import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { FolderOpen, Trophy, Rocket } from '@phosphor-icons/react';
import { projectsApi } from '../api/projects';
import { ProjectFilters } from '../components/project/ProjectFilters';
import { HackathonCard } from '../components/project/HackathonCard';

export function HackathonsPage() {
  const [searchParams] = useSearchParams();

  // ── Build query params (mirrors DashboardPage exactly) ─────────────
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const queryParams = { page: currentPage, size: 18 };

  const search = searchParams.get('search');
  const domain = searchParams.get('domain');
  const experienceLevel = searchParams.get('experienceLevel');
  const status = searchParams.get('status');
  const skills = searchParams.get('skills');

  if (search) queryParams.search = search;
  if (domain) queryParams.domain = domain;
  if (experienceLevel) queryParams.experienceLevel = experienceLevel;
  if (status) queryParams.status = status;
  if (skills) queryParams.skills = skills.split(',').filter(Boolean);

  const { data: pageData, isLoading, error, refetch } = useQuery({
    queryKey: ['hackathons', queryParams],
    queryFn: () => projectsApi.getHackathons(queryParams),
  });

  const hackathons = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;
  const hasFilters = search || domain || experienceLevel || status || skills;

  return (
    <div className="mx-auto pb-16">
      <div className="flex flex-col gap-8">

        {/* ── Page Header (Website Design Style Hero) ──────────────── */}
        <section className="relative w-full rounded-2xl overflow-hidden surface-1 border-border-subtle p-8 sm:p-12 mb-2 isolate shadow-sm">
          {/* Background glow effects (Glassmorphism inspired) */}
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[300px] md:h-[400px] bg-tertiary/15 rounded-full blur-[80px] -z-10 pointer-events-none animate-fade-in" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[60px] -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
            <div className="flex flex-col gap-3">
              {/* Eyebrow label */}
              <span className="label-mono text-tertiary font-bold uppercase tracking-[0.15em] animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                Hackathons & Events
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[1.1] text-primary animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">dream team.</span>
              </h1>
              <p className="mt-2 text-base sm:text-lg text-text-muted max-w-xl animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                Join time-boxed events and build something remarkable. Stop building in isolation and start shipping with ambitious developers.
              </p>
            </div>

            {/* Quick stats — surface-0 cards to pop against the surface-1 background */}
            <div className="flex gap-4 flex-wrap md:flex-col md:items-end animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <div className="surface-0 rounded-xl px-5 py-3 flex items-center gap-4 border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                  <Rocket size={20} weight="fill" className="text-tertiary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-primary text-base leading-tight">
                    {isLoading ? '-' : hackathons.length} Active Events
                  </span>
                  <span className="text-xs text-text-muted font-medium">Recruiting now</span>
                </div>
              </div>
              <div className="surface-0 rounded-xl px-5 py-3 flex items-center gap-4 border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-warning-amber/10 flex items-center justify-center">
                  <Trophy size={20} weight="fill" className="text-warning-amber" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-primary text-base leading-tight">Win Prizes</span>
                  <span className="text-xs text-text-muted font-medium">Compete & Build</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Content Area ───────────────────────────────────── */}
        <section className="flex-grow w-full">
          {/* ── Filters (reusing exact same ProjectFilters component) ─── */}
          <ProjectFilters />

          {/* ── Cards grid / states ─────────────────────────────────── */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-52 rounded-lg skeleton border border-border-subtle" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg surface-1 p-6 text-center">
              <p className="body-md text-error">{error?.response?.data?.message || 'Failed to load hackathons'}</p>
              <button onClick={() => refetch()} className="btn-secondary mt-4">Try again</button>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg surface-1 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-dim flex items-center justify-center mb-4 text-text-muted">
                <FolderOpen size={24} weight="regular" />
              </div>
              <h3 className="headline-lg-mobile text-primary">No hackathons found</h3>
              <p className="body-md text-text-muted mt-2 mb-6">
                {hasFilters ? 'Try adjusting your filters.' : 'Be the first to post a hackathon!'}
              </p>
              <Link to="/projects/new" className="btn-primary flex items-center gap-2">
                <Rocket size={15} weight="fill" /> Post a Hackathon
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {hackathons.map(h => <HackathonCard key={h.id} project={h} />)}
              </div>

              {/* Pagination — mirrors DashboardPage exactly */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-4">
                  <Link
                    to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: Math.max(0, currentPage - 1) }).toString()}`}
                    className={`px-8 py-3 border border-border-subtle rounded-lg text-text-muted font-semibold button-text hover:bg-surface-dim transition-all active:scale-[0.98] ${
                      currentPage === 0 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Previous
                  </Link>
                  <Link
                    to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: Math.min(totalPages - 1, currentPage + 1) }).toString()}`}
                    className={`px-8 py-3 border border-border-subtle rounded-lg text-text-muted font-semibold button-text hover:bg-surface-dim transition-all active:scale-[0.98] ${
                      currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Next
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
