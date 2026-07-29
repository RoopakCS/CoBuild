import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspace';
import { Link as LinkIcon, Trash, Plus, X, ArrowSquareOut } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Input, Select } from '../common/Input';

const CATEGORY_OPTIONS = [
  { value: 'DISCORD', label: 'Discord', color: 'text-tertiary' },
  { value: 'SLACK', label: 'Slack', color: 'text-success-green' },
  { value: 'FIGMA', label: 'Figma', color: 'text-tertiary' },
  { value: 'TRELLO', label: 'Trello', color: 'text-primary' },
  { value: 'JIRA', label: 'Jira', color: 'text-primary' },
  { value: 'GITHUB', label: 'GitHub', color: 'text-text-main' },
  { value: 'NOTION', label: 'Notion', color: 'text-warning-amber' },
  { value: 'OTHER', label: 'Other', color: 'text-text-muted' },
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="body-md text-text-muted font-medium">{links?.length || 0} links shared</p>
        </div>
        {(isOwner || currentUserId) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            {showForm ? <X weight="bold" /> : <Plus weight="bold" />}
            {showForm ? 'Cancel' : 'Add Link'}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-border-subtle bg-surface p-6 space-y-4 animate-fade-in rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Link Title (e.g. Figma File)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              maxLength={200}
            />
            <Input
              type="url"
              placeholder="https://..."
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-48 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
            <button
              type="submit"
              disabled={createMutation.isPending || !form.title.trim() || !form.url.trim()}
              className="btn-primary px-6"
            >
              {createMutation.isPending ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      )}

      {/* Links Grid */}
      {(!links || links.length === 0) ? (
        <div className="py-12">
          <p className="body-md text-text-muted">No resources have been shared yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => {
            const style = getCategoryStyle(link.category);
            return (
              <div
                key={link.id}
                className="p-5 border border-border-subtle rounded-lg bg-surface group relative transition-colors hover:border-text-muted"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`label-mono ${style.color}`}>
                      {style.label}
                    </span>
                  </div>
                  {/* Delete */}
                  {isOwner && (
                    <button
                      onClick={() => {
                        if (window.confirm('Remove this link?')) {
                          deleteMutation.mutate(link.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="text-xs font-bold text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest shrink-0"
                      title="Remove link"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <h4 className="body-md font-bold text-primary truncate">{link.title}</h4>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 body-sm text-text-muted hover:text-primary transition-colors group/link mt-1"
                >
                  <ArrowSquareOut weight="bold" className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{link.url}</span>
                </a>
                <p className="label-mono text-text-muted lowercase mt-4">
                  Added by {link.addedByName}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
