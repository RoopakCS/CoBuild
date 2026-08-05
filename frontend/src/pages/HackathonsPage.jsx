import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { FolderOpen, Rocket } from '@phosphor-icons/react';
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

        {/* ── Main Content Area ───────────────────────────────────── */}
        <section className="flex-grow w-full">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="headline-xl text-primary tracking-[-0.02em]">Hackathons & Events</h1>
            <p className="body-md text-text-muted">Showing {hackathons.length} active events</p>
          </div>
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
