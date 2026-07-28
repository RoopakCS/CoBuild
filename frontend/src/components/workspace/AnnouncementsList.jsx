import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspace';
import { PushPin, Trash, Plus, X, Megaphone } from '@phosphor-icons/react';
import { toast } from 'sonner';

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
      toast.success('Announcement posted!');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-warning-amber/10 rounded-xl border border-warning-amber/20">
            <Megaphone weight="duotone" className="w-5 h-5 text-warning-amber" />
          </div>
          <div>
            <h3 className="headline-lg tracking-[-0.02em]">Announcements</h3>
            <p className="text-xs text-text-muted font-medium">{announcements?.length || 0} posted</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary btn-sm flex items-center gap-2 uppercase tracking-widest px-4 py-2"
        >
          {showForm ? <X weight="bold" className="w-4 h-4" /> : <Plus weight="bold" className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border-subtle bg-surface-dim p-5 space-y-4 animate-fade-in">
          <input
            type="text"
            placeholder="Announcement title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200}
            className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-muted font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <textarea
            placeholder="Write your announcement..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-muted font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-text-muted font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="w-4 h-4 rounded border-border-subtle bg-surface text-primary focus:ring-primary/30"
              />
              <PushPin weight="fill" className="w-3.5 h-3.5 text-warning-amber" />
              Pin this announcement
            </label>
            <button
              type="submit"
              disabled={createMutation.isPending || !form.title.trim() || !form.content.trim()}
              className="btn-primary btn-sm px-5 py-2"
            >
              {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {(!announcements || announcements.length === 0) ? (
        <div className="text-center py-12 text-text-muted bg-surface-dim/30 border border-dashed border-border-subtle rounded-lg">
          <Megaphone weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-text-main">No announcements yet</p>
          <p className="text-sm mt-1">Team updates and important notices will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border p-5 relative group transition-all ${
                a.pinned
                  ? 'border-warning-amber/30 bg-warning-amber/5'
                  : 'border-border-subtle bg-surface'
              }`}
            >
              {/* Pinned badge */}
              {a.pinned && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-extrabold text-warning-amber bg-warning-amber/10 px-2.5 py-1 rounded-full border border-warning-amber/20 uppercase tracking-wider">
                  <PushPin weight="fill" className="w-3 h-3" /> Pinned
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                {a.authorPhotoUrl ? (
                  <img src={a.authorPhotoUrl} alt={a.authorName} className="w-8 h-8 rounded-full object-cover ring-1 ring-border-subtle" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-xs font-bold text-text-muted border border-border-subtle">
                    {a.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-text-main">{a.authorName}</p>
                  <p className="text-[11px] text-text-muted font-medium">
                    {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Content */}
              <h4 className="text-base font-bold text-text-main mb-2">{a.title}</h4>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{a.content}</p>

              {/* Delete button (author or owner) */}
              {(a.authorId === currentUserId || isOwner) && (
                <button
                  onClick={() => deleteMutation.mutate(a.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-text-muted hover:text-error transition-all p-1.5 rounded-lg hover:bg-error-container"
                  title="Delete announcement"
                >
                  <Trash weight="bold" className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
