import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspace';
import { Link as LinkIcon, Trash, Plus, X, ArrowSquareOut } from '@phosphor-icons/react';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { value: 'DISCORD', label: 'Discord', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  { value: 'SLACK', label: 'Slack', color: 'text-success-green', bg: 'bg-success-green/10 border-success-green/20' },
  { value: 'FIGMA', label: 'Figma', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { value: 'TRELLO', label: 'Trello', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  { value: 'JIRA', label: 'Jira', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  { value: 'GITHUB', label: 'GitHub', color: 'text-text-main', bg: 'bg-surface-dim border-border-subtle' },
  { value: 'NOTION', label: 'Notion', color: 'text-warning-amber', bg: 'bg-warning-amber/10 border-warning-amber/20' },
  { value: 'OTHER', label: 'Other', color: 'text-text-muted', bg: 'bg-surface-dim border-border-subtle' },
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
          <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
            <LinkIcon weight="duotone" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="headline-lg tracking-[-0.02em]">Resources</h3>
            <p className="text-xs text-text-muted font-medium">{links?.length || 0} links</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary btn-sm flex items-center gap-2 uppercase tracking-widest px-4 py-2"
        >
          {showForm ? <X weight="bold" className="w-4 h-4" /> : <Plus weight="bold" className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Resource'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border-subtle bg-surface-dim p-5 space-y-4 animate-fade-in">
          <input
            type="text"
            placeholder="Link title (e.g., Team Discord)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200}
            className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-muted font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <input
            type="url"
            placeholder="https://..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main placeholder-text-muted font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <div className="flex items-center justify-between gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-main font-medium focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={createMutation.isPending || !form.title.trim() || !form.url.trim()}
              className="btn-primary btn-sm px-5 py-2 whitespace-nowrap"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Link'}
            </button>
          </div>
        </form>
      )}

      {/* Links Grid */}
      {(!links || links.length === 0) ? (
        <div className="text-center py-12 text-text-muted bg-surface-dim/30 border border-dashed border-border-subtle rounded-lg">
          <LinkIcon weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-text-main">No resources shared yet</p>
          <p className="text-sm mt-1">Add links to Discord, Figma, Trello, and other team tools.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {links.map((link) => {
            const style = getCategoryStyle(link.category);
            return (
              <div
                key={link.id}
                className={`rounded-2xl border p-4 group relative transition-all hover:border-primary/30 ${style.bg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`label-mono px-2 py-0.5 rounded-md ${style.color}`}>
                        {style.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-text-main truncate">{link.title}</h4>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-medium mt-1.5 truncate transition-colors group/link"
                    >
                      <ArrowSquareOut weight="bold" className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{link.url}</span>
                    </a>
                    <p className="text-[11px] text-text-muted mt-2 font-medium">
                      Added by {link.addedByName} · {new Date(link.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Delete */}
                  {isOwner && (
                    <button
                      onClick={() => deleteMutation.mutate(link.id)}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-error hover:bg-error-container transition-all p-1.5 rounded-lg shrink-0"
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
