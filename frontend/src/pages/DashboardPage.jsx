import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { CaretRight, CaretLeft, FolderOpen, ArrowRight } from '@phosphor-icons/react';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { useState, useCallback } from 'react';
import { ProjectFilterBar } from '../components/project/ProjectFilterBar';
import { ProjectCard } from '../components/project/ProjectCard';

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [filterParams, setFilterParams] = useState(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    return params;
  });

  // Pagination state
  const currentPage = parseInt(searchParams.get('page') || '0', 10);

  // Build query params
  const queryParams = { page: currentPage, size: 20 };
  if (filterParams.search) queryParams.search = filterParams.search;
  if (filterParams.domain) queryParams.domain = filterParams.domain;
  if (filterParams.experienceLevel) queryParams.experienceLevel = filterParams.experienceLevel;
  if (filterParams.status) queryParams.status = filterParams.status;
  if (filterParams.skills) queryParams.skills = filterParams.skills.split(',').filter(Boolean);

  const { data: user } = useQuery({ queryKey: ['users', 'me'], queryFn: usersApi.getMe });

  const { data: pageData, isLoading, error, refetch } = useQuery({
    queryKey: ['projects', queryParams],
    queryFn: () => projectsApi.getAll(queryParams),
  });

  const rawProjects = pageData?.content || [];
  // Filter out projects owned by the current user
  const projects = user?.id ? rawProjects.filter(p => p.ownerId !== user.id) : rawProjects;
  const totalPages = pageData?.totalPages || 1;

  const handleFilterChange = useCallback((params) => {
    setFilterParams(params);
  }, []);

  return (
    <div className="mx-auto pb-16">
      
      {/* Main Discover Layout */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <ProjectFilterBar onFilterChange={handleFilterChange} />

        {/* Project Feed */}
        <section className="flex-grow">
          <div className="flex justify-between items-end mb-6">
            <h1 className="headline-xl text-primary tracking-[-0.02em]">Discover Projects</h1>
            <p className="body-md text-text-muted">Showing {projects.length} active projects</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-lg skeleton border border-border-subtle"></div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg surface-1 p-6 text-center">
              <p className="body-md text-error">{error?.response?.data?.message || error.message || 'Failed to fetch projects'}</p>
              <button onClick={() => refetch()} className="btn-secondary mt-4">Try again</button>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg surface-1 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-dim flex items-center justify-center mb-4 text-text-muted">
                <FolderOpen size={24} weight="regular" />
              </div>
              <h3 className="headline-lg-mobile text-primary">No projects found</h3>
              <p className="body-md text-text-muted mt-2">Try adjusting your search filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-4">
                  <Link
                    to={`?${new URLSearchParams({ ...filterParams, page: Math.max(0, currentPage - 1) }).toString()}`}
                    className={`px-8 py-3 border border-border-subtle rounded-lg text-text-muted font-semibold button-text hover:bg-surface-dim transition-all active:scale-[0.98] ${
                      currentPage === 0 ? 'pointer-events-none opacity-50' : ''
                    }`}
                  >
                    Previous
                  </Link>
                  <Link
                    to={`?${new URLSearchParams({ ...filterParams, page: Math.min(totalPages - 1, currentPage + 1) }).toString()}`}
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
