import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../../api/activities';
import { Textarea, FormField } from '../common/Input';
import { Trash, PaperPlaneRight, UserCircle, Lightning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function ActivityFeed({ projectId, isOwner, isMember, currentUserId }) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => activitiesApi.getProjectActivities(projectId, 0, 50),
    enabled: !!projectId,
  });

  const postMutation = useMutation({
    mutationFn: activitiesApi.createActivity,
    onSuccess: () => {
      toast.success('Activity posted');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post activity');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: activitiesApi.deleteActivity,
    onSuccess: () => {
      toast.success('Activity deleted');
      queryClient.invalidateQueries({ queryKey: ['activities', projectId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete activity');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    postMutation.mutate({ projectId, content: content.trim() });
  };

  const activities = data?.content || [];

  return (
    <div className="surface-1 p-6 md:p-8 rounded-lg">
      <div className="flex items-center gap-2 mb-6 border-b border-border-subtle pb-4">
        <Lightning size={24} className="text-tertiary" weight="duotone" />
        <h3 className="headline-lg tracking-[-0.02em]">Project Activity</h3>
      </div>

      {/* Post Box (Only for Team Members and Owners) */}
      {(isOwner || isMember) && (
        <form onSubmit={handleSubmit} className="mb-8 p-4 bg-surface-dim rounded-lg border border-border-subtle">
          <FormField htmlFor="post-activity">
            <Textarea
              id="post-activity"
              rows={3}
              placeholder="Share an update, milestone, or request with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-surface text-sm border-transparent focus:border-border-subtle shadow-sm mb-3"
            />
          </FormField>
          <div className="flex justify-between items-center">
            <p className="text-xs text-text-muted">Supports plain text formatting.</p>
            <button
              type="submit"
              disabled={postMutation.isPending || !content.trim()}
              className="btn-primary btn-sm flex items-center gap-2 px-5 py-2 shadow-sm rounded-full disabled:opacity-50"
            >
              {postMutation.isPending ? 'Posting...' : 'Post Update'}
              <PaperPlaneRight size={16} weight="bold" />
            </button>
          </div>
        </form>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4 p-4 rounded-lg border border-border-subtle/50 bg-surface-dim/30">
              <div className="w-10 h-10 bg-border-subtle rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-border-subtle rounded"></div>
                <div className="h-3 w-full bg-border-subtle rounded"></div>
                <div className="h-3 w-3/4 bg-border-subtle rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities.length === 0 && (
        <div className="text-center py-10 px-4 bg-surface-dim/30 border border-dashed border-border-subtle rounded-lg">
          <Lightning size={32} weight="duotone" className="text-text-muted mx-auto mb-3 opacity-50" />
          <h4 className="text-sm font-semibold text-primary mb-1">No activities yet</h4>
          <p className="text-sm text-text-muted">
            {(isOwner || isMember) 
              ? "Be the first to post an update to show project momentum." 
              : "This project hasn't posted any public updates yet."}
          </p>
        </div>
      )}

      {/* Activity List */}
      {!isLoading && activities.length > 0 && (
        <div className="space-y-5">
          {activities.map((activity) => {
            const canDelete = isOwner || activity.authorId === currentUserId;
            
            return (
              <div key={activity.id} className="group flex gap-4 p-4 rounded-lg bg-surface border border-border-subtle hover:border-tertiary/40 transition-colors shadow-sm">
                
                {/* Avatar */}
                <div className="shrink-0">
                  {activity.authorProfileImageUrl ? (
                    <img 
                      src={activity.authorProfileImageUrl} 
                      alt={activity.authorName} 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-dim"
                    />
                  ) : (
                    <UserCircle size={40} weight="light" className="text-text-muted" />
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="truncate pr-4">
                      <span className="font-bold text-primary text-sm mr-2">{activity.authorName}</span>
                      <span className="text-xs text-text-muted font-medium">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {/* Delete Action (Hidden by default, shown on group hover) */}
                    {canDelete && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this activity?')) {
                            deleteMutation.mutate({ projectId, activityId: activity.id });
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-text-muted hover:text-error hover:bg-error-container rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        title="Delete activity"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    )}
                  </div>
                  
                  {/* Message Body */}
                  <div className="text-sm text-primary leading-relaxed whitespace-pre-wrap break-words">
                    {activity.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
