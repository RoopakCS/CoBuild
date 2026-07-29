import { useQuery } from '@tanstack/react-query';
import { githubApi } from '../../api/github';
import { 
  GithubLogo, 
  Star, 
  GitFork, 
  WarningCircle, 
  ArrowSquareOut, 
  Clock, 
  Code, 
  GitBranch, 
  CheckCircle 
} from '@phosphor-icons/react';

export function GitHubStatsCard({ projectId, repositoryUrl }) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['github-stats', projectId],
    queryFn: () => githubApi.getStats(projectId),
    enabled: !!projectId && !!repositoryUrl,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  // Skeleton Loader State
  if (isLoading) {
    return (
      <div className="surface-1 rounded-lg p-6 space-y-4 shadow-lg animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 skeleton rounded-md"></div>
          <div className="h-6 w-24 skeleton rounded-full"></div>
        </div>
        <div className="h-4 w-3/4 skeleton rounded-md"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 skeleton rounded-md border border-border-subtle"></div>
          ))}
        </div>
      </div>
    );
  }

  // No Repo Configured State
  if (!repositoryUrl) {
    return (
      <div className="surface-1 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-surface-dim text-text-muted rounded-md">
            <GithubLogo size={28} weight="duotone" />
          </div>
          <div>
            <h4 className="font-semibold text-text-main">No Repository Linked</h4>
            <p className="text-sm text-text-muted">Link a public GitHub repository to display live activity stats.</p>
          </div>
        </div>
      </div>
    );
  }

  // Graceful Fallback (Repo Private or Unavailable)
  if (error || (stats && !stats.isAvailable)) {
    const errorMsg = stats?.errorMessage || 'Repository metrics unavailable';
    return (
      <div className="surface-1 rounded-lg p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-muted font-medium">
            <GithubLogo size={22} weight="bold" />
            <span>GitHub Repository</span>
          </div>
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold"
          >
            Open Repo <ArrowSquareOut size={14} />
          </a>
        </div>
        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-sm">
          <WarningCircle size={20} className="shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Render Health Status Indicator
  const renderHealthBadge = () => {
    switch (stats.healthStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-2 px-3 py-1 badge-success rounded-sm text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-green"></span>
            </span>
            Active Repo
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 badge-warning rounded-sm text-xs font-semibold">
            <Clock size={14} />
            Stale (30-90d)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 badge-error rounded-sm text-xs font-semibold">
            Inactive (&gt;90d)
          </span>
        );
    }
  };

  return (
    <div className="surface-1 rounded-lg p-6 space-y-5 transition-all duration-300 hover:border-border/80">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
            <GithubLogo size={24} weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-main hover:text-primary transition-colors">
                {stats.owner}/{stats.repoName}
              </h3>
            </div>
            {stats.defaultBranch && (
              <p className="text-xs text-text-muted flex items-center gap-1">
                <GitBranch size={12} /> default: <span className="font-mono text-text-main/80">{stats.defaultBranch}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {renderHealthBadge()}
          <a
            href={stats.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-text-muted hover:text-primary bg-surface-dim hover:bg-surface border border-border-subtle rounded-md transition-all"
            title="View on GitHub"
          >
            <ArrowSquareOut size={18} />
          </a>
        </div>
      </div>

      {/* Repo Description */}
      {stats.description && (
        <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
          {stats.description}
        </p>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        
        {/* Language */}
        <div className="bg-surface-dim border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <Code size={14} className="text-primary" />
            <span>Language</span>
          </div>
          <span className="font-semibold text-sm text-text-main truncate">
            {stats.primaryLanguage || 'Unknown'}
          </span>
        </div>

        {/* Stars */}
        <div className="bg-surface-dim border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <Star size={14} className="text-warning-amber" />
            <span>Stars</span>
          </div>
          <span className="font-semibold text-sm text-text-main">
            {stats.starsCount.toLocaleString()}
          </span>
        </div>

        {/* Forks */}
        <div className="bg-surface-dim border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <GitFork size={14} className="text-tertiary" />
            <span>Forks</span>
          </div>
          <span className="font-semibold text-sm text-text-main">
            {stats.forksCount.toLocaleString()}
          </span>
        </div>

        {/* Open Issues */}
        <div className="bg-surface-dim border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <WarningCircle size={14} className="text-tertiary" />
            <span>Open Issues</span>
          </div>
          <span className="font-semibold text-sm text-text-main">
            {stats.openIssuesCount.toLocaleString()}
          </span>
        </div>

      </div>

      {/* Top 5 Contributors Footer */}
      {stats.topContributors && stats.topContributors.length > 0 && (
        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Users size={14} />
            <span>Top Contributors</span>
          </div>
          <div className="flex items-center -space-x-2 overflow-hidden p-1">
            {stats.topContributors.map((c) => (
              <a
                key={c.login}
                href={c.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`${c.login} (${c.contributions} commits)`}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-border-subtle hover:ring-primary transition-all hover:scale-110 z-0 hover:z-10"
              >
                <img
                  src={c.avatarUrl}
                  alt={c.login}
                  className="h-full w-full rounded-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
