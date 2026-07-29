import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesApi } from '../../api/activities';
import { Textarea, FormField } from '../common/Input';
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
      <div className="mb-8">
        <h3 className="headline-lg tracking-[-0.02em]">Project Activity</h3>
      </div>

      <div className="relative">
        {/* Post Box (Only for Team Members and Owners) */}
        {(isOwner || isMember) && (
          <div className="relative z-10 mb-10">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                rows={3}
                placeholder="Share an update, milestone, or request..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-sm"
              />
              <div className="flex justify-end items-center">
                <button
                  type="submit"
                  disabled={postMutation.isPending || !content.trim()}
                  className="btn-primary btn-sm px-5 py-1.5 disabled:opacity-50"
                >
                  {postMutation.isPending ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-8 relative z-10 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="flex-1 space-y-3 pt-2">
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
          <div className="relative z-10">
            <p className="text-sm font-medium text-text-muted">
              {(isOwner || isMember) 
                ? "Be the first to post an update." 
                : "No public updates yet."}
            </p>
          </div>
        )}

        {/* Activity List */}
        {!isLoading && activities.length > 0 && (
          <div className="space-y-8 relative z-10">
            {activities.map((activity) => {
              const canDelete = isOwner || activity.authorId === currentUserId;
              
              return (
                <div key={activity.id} className="group">
                  {/* Content Area */}
                  <div className="min-w-0 pt-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="truncate pr-4 flex items-center gap-2">
                        {activity.authorProfileImageUrl ? (
                          <img 
                            src={activity.authorProfileImageUrl} 
                            alt={activity.authorName} 
                            className="w-5 h-5 rounded-full object-cover border border-border-subtle"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-surface-dim border border-border-subtle flex items-center justify-center text-[9px] font-bold text-text-muted">
                            {activity.authorName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span className="body-sm font-bold text-primary">{activity.authorName}</span>
                        <span className="text-[5px] text-border-subtle">•</span>
                        <span className="label-mono text-text-muted lowercase">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {/* Delete Action (Hidden by default, shown on group hover) */}
                      {canDelete && (
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this activity?')) {
                              deleteMutation.mutate({ projectId, activityId: activity.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="text-xs font-bold text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    
                    {/* Message Body */}
                    <div className="body-sm text-primary leading-relaxed whitespace-pre-wrap break-words">
                      {activity.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

