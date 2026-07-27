import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspace';
import { Link as LinkIcon, Trash, Plus, X, ArrowSquareOut } from '@phosphor-icons/react';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { value: 'DISCORD', label: 'Discord', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  { value: 'SLACK', label: 'Slack', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { value: 'FIGMA', label: 'Figma', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { value: 'TRELLO', label: 'Trello', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { value: 'JIRA', label: 'Jira', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: 'GITHUB', label: 'GitHub', color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/20' },
  { value: 'NOTION', label: 'Notion', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { value: 'OTHER', label: 'Other', color: 'text-slate-400', bg: 'bg-slate-600/10 border-slate-600/20' },
];

function getCategoryStyle(category) {
  return CATEGORY_OPTIONS.find(c => c.value === category) || CATEGORY_OPTIONS[CATEGORY_OPTIONS.length - 1];
}

export function WorkspaceLinksList({ links, projectId, currentUserId, isOwner }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', category: 'OTHER' });

  const createMutation = useMutation({
    mutationFn: (payload) => workspaceApi.createLink(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'links', projectId] });
      setForm({ title: '', url: '', category: 'OTHER' });
      setShowForm(false);
      toast.success('Resource link added!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add link'),
  });

  const deleteMutation = useMutation({
    mutationFn: (linkId) => workspaceApi.deleteLink(projectId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', 'links', projectId] });
      toast.success('Link removed');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to remove link'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <LinkIcon weight="duotone" className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Resources</h3>
            <p className="text-xs text-slate-500 font-medium">{links?.length || 0} links</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          {showForm ? <X weight="bold" className="w-4 h-4" /> : <Plus weight="bold" className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Resource'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-500/30 bg-blue-600/5 p-5 space-y-4 animate-fade-in">
          <input
            type="text"
            placeholder="Link title (e.g., Team Discord)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
          <input
            type="url"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
          />
          <div className="flex items-center justify-between gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-slate-900/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={createMutation.isPending || !form.title.trim() || !form.url.trim()}
              className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-md shadow-blue-600/20 whitespace-nowrap"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      )}

      {/* Links Grid */}
      {(!links || links.length === 0) ? (
        <div className="text-center py-12 text-slate-500">
          <LinkIcon weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-slate-400">No resources shared yet</p>
          <p className="text-sm mt-1">Add links to Discord, Figma, Trello, and other team tools.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((link) => {
            const style = getCategoryStyle(link.category);
            return (
              <div
                key={link.id}
                className={`rounded-2xl border p-4 group relative transition-all hover:border-blue-500/30 ${style.bg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider ${style.color} bg-white/5 px-2 py-0.5 rounded-md`}>
                        {style.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 truncate">{link.title}</h4>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium mt-1.5 truncate transition-colors group/link"
                    >
                      <ArrowSquareOut weight="bold" className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{link.url}</span>
                    </a>
                    <p className="text-[11px] text-slate-500 mt-2 font-medium">
                      Added by {link.addedByName} · {new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Delete */}
                  {isOwner && (
                    <button
                      onClick={() => deleteMutation.mutate(link.id)}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-red-500/10 shrink-0"
                      title="Remove link"
                    >
                      <Trash weight="bold" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
