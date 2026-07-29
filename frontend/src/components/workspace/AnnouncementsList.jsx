import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspace';
import { PushPin, Trash, Plus, X, Megaphone } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Input, Textarea } from '../common/Input';

export function AnnouncementsList({ announcements, projectId, currentUserId, isOwner }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', isPinned: false });

  const createMutation = useMutation({
    mutationFn: (payload) => workspaceApi.createAnnouncement(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'announcements', projectId] });
      setForm({ title: '', content: '', isPinned: false });
      setShowForm(false);
      toast.success('Announcement posted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create announcement'),
  });

  const deleteMutation = useMutation({
    mutationFn: (announcementId) => workspaceApi.deleteAnnouncement(projectId, announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'announcements', projectId] });
      toast.success('Announcement deleted');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="body-md text-text-muted font-medium">{announcements?.length || 0} posted updates</p>
        </div>
        {(isOwner || currentUserId) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            {showForm ? <X weight="bold" /> : <Plus weight="bold" />}
            {showForm ? 'Cancel' : 'New Post'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border-subtle bg-surface p-6 space-y-4 animate-fade-in rounded-lg shadow-sm">
          <Input
            type="text"
            placeholder="Announcement Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200}
            className="font-bold text-lg"
          />
          <Textarea
            placeholder="Write the announcement details..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={5}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm text-text-muted font-medium cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="w-4 h-4 rounded border-border-subtle bg-surface text-primary focus:ring-primary/30"
              />
              <span className="group-hover:text-primary transition-colors">Pin announcement</span>
            </label>
            <button
              type="submit"
              disabled={createMutation.isPending || !form.title.trim() || !form.content.trim()}
              className="btn-primary px-6"
            >
              {createMutation.isPending ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {(!announcements || announcements.length === 0) ? (
        <div className="py-12">
          <p className="body-md text-text-muted">No announcements have been posted yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`p-6 relative group transition-all border border-border-subtle rounded-lg ${
                a.isPinned ? 'bg-surface-dim' : 'bg-surface'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {a.authorPhotoUrl ? (
                    <img src={a.authorPhotoUrl} alt={a.authorName} className="w-10 h-10 rounded-full object-cover border border-border-subtle" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-sm font-bold text-text-muted">
                      {a.authorName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="body-md font-bold text-primary">{a.authorName}</span>
                      {a.isPinned && (
                        <span className="label-mono text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                          <PushPin weight="fill" className="w-3 h-3" /> PINNED
                        </span>
                      )}
                    </div>
                    <p className="label-mono text-text-muted lowercase mt-0.5">
                      {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Delete button */}
                {(a.authorId === currentUserId || isOwner) && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this announcement?')) {
                        deleteMutation.mutate(a.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-xs font-bold text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Content */}
              <h4 className="headline-lg tracking-[-0.02em] text-primary mb-2">{a.title}</h4>
              <div className="body-md text-primary leading-relaxed whitespace-pre-wrap">{a.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
