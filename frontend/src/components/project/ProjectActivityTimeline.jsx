import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../../api/activities';
import { formatDistanceToNow } from 'date-fns';
import { PaperPlaneRight, Trash, UserCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';

export function ProjectActivityTimeline({ projectId, isOwner, isMember, currentUserId }) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => activitiesApi.getProjectActivities(projectId),
  });

  const createMutation = useMutation({
    mutationFn: activitiesApi.createActivity,
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast.success('Update posted!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post update');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: activitiesApi.deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
      toast.success('Update deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete update');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    createMutation.mutate({ projectId, content });
  };

  const activities = activitiesData?.content || [];
  const canPost = isOwner || isMember;

  return (
    <div className="surface-1 p-8 rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <h3 className="headline-lg tracking-[-0.02em]">Activity</h3>
        <span className="label-mono text-text-muted uppercase tracking-[0.2em]">
          {activities.length} {activities.length === 1 ? 'Update' : 'Updates'}
        </span>
      </div>

      {/* Post Box */}
      {canPost && (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="border border-border-subtle rounded-sm overflow-hidden bg-surface">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share a progress update..."
              rows={3}
              className="w-full bg-surface p-4 body-md text-primary focus:outline-none resize-none placeholder:text-text-muted border-0"
              disabled={createMutation.isPending}
            />
            <div className="flex justify-end px-4 py-3 border-t border-border-subtle bg-surface-dim">
              <button
                type="submit"
                disabled={!content.trim() || createMutation.isPending}
                className="btn-primary btn-sm uppercase tracking-widest flex items-center gap-2"
              >
                <PaperPlaneRight weight="bold" size={14} />
                {createMutation.isPending ? 'Posting...' : 'Post Update'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Activity Feed */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-20 skeleton"></div>
          <div className="h-20 skeleton"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-px bg-border-subtle border border-border-subtle rounded-sm overflow-hidden">
          {activities.map((activity) => {
            const isAuthor = activity.authorId === currentUserId;
            const canDelete = isOwner || isAuthor;

            return (
              <div
                key={activity.id}
                className="group p-6 bg-surface hover:bg-surface-dim transition-colors"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    {activity.authorProfileImageUrl ? (
                      <img src={activity.authorProfileImageUrl} alt={activity.authorName} className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <UserCircle size={24} weight="duotone" className="text-text-muted" />
                    )}
                    <span className="body-sm font-bold text-primary">{activity.authorName}</span>
                    <span className="label-mono text-text-muted">·</span>
                    <span className="label-mono text-text-muted">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this update?")) {
                          deleteMutation.mutate({ projectId, activityId: activity.id });
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity btn-secondary px-2 py-1 text-xs text-error border-error/20 hover:bg-error-container"
                      title="Delete update"
                    >
                      <Trash size={14} />
                    </button>
                  )}
                </div>

                {/* Content */}
                <p className="body-md text-text-muted leading-relaxed whitespace-pre-wrap pl-[34px]">
                  {activity.content}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface border border-border-subtle">
          <p className="body-md font-medium text-text-muted">No updates yet.</p>
          {canPost && (
            <p className="body-sm text-text-muted mt-1">Post the first update to keep the team in sync.</p>
          )}
        </div>
      )}
    </div>
  );
}
