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
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Megaphone weight="duotone" className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Announcements</h3>
            <p className="text-xs text-slate-500 font-medium">{announcements?.length || 0} posted</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          {showForm ? <X weight="bold" className="w-4 h-4" /> : <Plus weight="bold" className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-500/30 bg-blue-600/5 p-5 space-y-4 animate-fade-in">
          <input
            type="text"
            placeholder="Announcement title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
          <textarea
            placeholder="Write your announcement..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-400 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/30"
              />
              <PushPin weight="fill" className="w-3.5 h-3.5 text-amber-400" />
              Pin this announcement
            </label>
            <button
              type="submit"
              disabled={createMutation.isPending || !form.title.trim() || !form.content.trim()}
              className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-blue-600/20"
            >
              {createMutation.isPending ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {(!announcements || announcements.length === 0) ? (
        <div className="text-center py-12 text-slate-500">
          <Megaphone weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-slate-400">No announcements yet</p>
          <p className="text-sm mt-1">Team updates and important notices will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border p-5 relative group transition-all ${
                a.pinned
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : 'border-slate-700/50 bg-slate-800/30'
              }`}
            >
              {/* Pinned badge */}
              {a.pinned && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] font-extrabold text-amber-400 bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/25 uppercase tracking-wider">
                  <PushPin weight="fill" className="w-3 h-3" /> Pinned
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-3 mb-3">
                {a.authorPhotoUrl ? (
                  <img src={a.authorPhotoUrl} alt={a.authorName} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white border border-blue-400/30">
                    {a.authorName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-slate-200">{a.authorName}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Content */}
              <h4 className="text-base font-bold text-slate-100 mb-2">{a.title}</h4>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{a.content}</p>

              {/* Delete button (author or owner) */}
              {(a.authorId === currentUserId || isOwner) && (
                <button
                  onClick={() => deleteMutation.mutate(a.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-500/10"
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
