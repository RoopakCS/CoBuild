import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { projectsApi } from '../api/projects';
import { rolesApi } from '../api/roles';
import { Plus, Trash, Wrench, Trophy } from '@phosphor-icons/react';

export function CreateProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryType = searchParams.get('type') === 'HACKATHON' ? 'HACKATHON' : 'SIDE_PROJECT';
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    experienceLevel: 'INTERMEDIATE',
    teamSize: 1,
    commitment: 'PART_TIME',
    repositoryUrl: '',
    skills: [],
    projectType: queryType,
    eventStartDate: '',
    eventEndDate: '',
    registrationDeadline: '',
    prizePool: '',
    organizerName: '',
    hackathonUrl: '',
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [roles, setRoles] = useState([{ title: '', openingsCount: 1 }]);

  const addRole = () => setRoles([...roles, { title: '', openingsCount: 1 }]);
  const removeRole = (index) => setRoles(roles.filter((_, i) => i !== index));
  const updateRole = (index, field, value) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      // Create project first
      const project = await projectsApi.create(payload.projectData);
      
      // Then create all roles
      if (payload.roles && payload.roles.length > 0) {
        for (const role of payload.roles) {
          if (role.title && role.openingsCount > 0) {
            await rolesApi.create({ projectId: project.id, ...role });
          }
        }
      }
      return project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${data.id}`);
    },
    onError: (err) => {
      toast.error('Failed to create project: ' + (err.response?.data?.message || err.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    const validRoles = roles.filter(r => r.title.trim() !== '');
    if (validRoles.length === 0) {
      toast.error('Please add at least one role to your project.');
      return;
    }
    
    const calculatedTeamSize = 1 + validRoles.reduce((sum, r) => sum + (Number(r.openingsCount) || 0), 0);
    
    createMutation.mutate({ projectData: { ...formData, teamSize: calculatedTeamSize, skills }, roles: validRoles });
  };

  const inputClass = "w-full rounded-md bg-surface-dim border border-border-subtle px-4 py-3 body-md text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="headline-xl text-primary tracking-[-0.02em]">
          {formData.projectType === 'HACKATHON' ? 'Post a Hackathon' : 'Create a Project'}
        </h1>
        <p className="body-md text-text-muted">
          {formData.projectType === 'HACKATHON' 
            ? 'List an upcoming hackathon to help developers find teammates and build.'
            : 'Start something new and find the right people to build it with.'}
        </p>
      </div>

      {/* Project Type Toggle */}
      <div className="mb-8 p-1 rounded-xl flex gap-1"
        style={{ background: 'rgba(15,23,42,0.06)', border: '1px solid var(--color-border-subtle)' }}>
        {[
          { value: 'SIDE_PROJECT', label: <span className="flex items-center gap-1.5"><Wrench weight="fill" /> Side Project</span>, sub: 'Ongoing collaboration' },
          { value: 'HACKATHON', label: <span className="flex items-center gap-1.5"><Trophy weight="fill" /> Hackathon</span>, sub: 'Time-boxed event' },
        ].map(({ value, label, sub }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFormData({ ...formData, projectType: value })}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 text-left ${
              formData.projectType === value
                ? 'bg-surface shadow-sm border border-border-subtle'
                : 'hover:bg-surface/60'
            }`}>
            <div className={`body-md font-semibold ${formData.projectType === value ? 'text-primary' : 'text-text-muted'}`}>{label}</div>
            <div className="text-xs text-text-muted mt-0.5">{sub}</div>
          </button>
        ))}
      </div>
      
      <div className="surface-1 rounded-lg p-6 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block label-mono text-primary mb-2">PROJECT TITLE</label>
            <input 
              required
              className={inputClass}
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              placeholder="e.g. Next-Gen AI Tool"
            />
          </div>

          <div>
            <label className="block label-mono text-primary mb-2">DESCRIPTION</label>
            <textarea 
              required
              rows={5}
              className={`${inputClass} resize-none`}
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
              placeholder="Describe what you want to build..."
            />
          </div>

          <div>
            <label className="block label-mono text-primary mb-2">DOMAIN</label>
            <input 
              required
              className={inputClass}
              value={formData.domain} 
              onChange={e => setFormData({ ...formData, domain: e.target.value })} 
              placeholder="e.g. Web3, EdTech, AI/ML, Fintech"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block label-mono text-primary mb-2">EXPERIENCE LEVEL</label>
              <select 
                required
                className={inputClass}
                value={formData.experienceLevel} 
                onChange={e => setFormData({ ...formData, experienceLevel: e.target.value })} 
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block label-mono text-primary mb-2">COMMITMENT</label>
              <select 
                required
                className={inputClass}
                value={formData.commitment} 
                onChange={e => setFormData({ ...formData, commitment: e.target.value })} 
              >
                <option value="PART_TIME">Part Time</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="FLEXIBLE">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block label-mono text-primary mb-2">
              REPOSITORY URL <span className="text-text-muted normal-case font-normal">(optional)</span>
            </label>
            <input 
              type="url"
              className={inputClass}
              value={formData.repositoryUrl} 
              onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })} 
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block label-mono text-primary mb-2">
              REQUIRED SKILLS <span className="text-text-muted normal-case font-normal">(comma separated)</span>
            </label>
            <input 
              className={inputClass}
              value={skillsInput} 
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Python, PostgreSQL"
            />
          </div>

          {/* ── Hackathon-specific fields ─────────────────────────── */}
          {formData.projectType === 'HACKATHON' && (
            <div className="space-y-5 animate-fade-in pt-4 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="label-mono uppercase px-2 py-1 rounded-sm text-tertiary bg-tertiary/10">
                  Hackathon Details
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block label-mono text-primary mb-2">EVENT START DATE</label>
                  <input type="date" className={inputClass} value={formData.eventStartDate}
                    onChange={e => setFormData({ ...formData, eventStartDate: e.target.value })} />
                </div>
                <div>
                  <label className="block label-mono text-primary mb-2">EVENT END DATE</label>
                  <input type="date" className={inputClass} value={formData.eventEndDate}
                    onChange={e => setFormData({ ...formData, eventEndDate: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block label-mono text-primary mb-2">REGISTRATION DEADLINE</label>
                <input type="date" className={inputClass} value={formData.registrationDeadline}
                  onChange={e => setFormData({ ...formData, registrationDeadline: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block label-mono text-primary mb-2">PRIZE POOL <span className="text-text-muted normal-case font-normal">(optional)</span></label>
                  <input className={inputClass} value={formData.prizePool}
                    onChange={e => setFormData({ ...formData, prizePool: e.target.value })}
                    placeholder="e.g. $10,000 in prizes" />
                </div>
                <div>
                  <label className="block label-mono text-primary mb-2">ORGANIZER <span className="text-text-muted normal-case font-normal">(optional)</span></label>
                  <input className={inputClass} value={formData.organizerName}
                    onChange={e => setFormData({ ...formData, organizerName: e.target.value })}
                    placeholder="e.g. MLH, Devfolio" />
                </div>
              </div>

              <div>
                <label className="block label-mono text-primary mb-2">HACKATHON URL <span className="text-text-muted normal-case font-normal">(optional)</span></label>
                <input type="url" className={inputClass} value={formData.hackathonUrl}
                  onChange={e => setFormData({ ...formData, hackathonUrl: e.target.value })}
                  placeholder="https://hackathon.example.com" />
              </div>
            </div>
          )}

          <div className="border-t border-border-subtle pt-8 mt-8">
            <div className="flex items-center justify-between mb-4">
              <label className="block label-mono text-primary">PROJECT ROLES</label>
              <button 
                type="button" 
                onClick={addRole}
                className="flex items-center gap-1.5 label-mono text-text-muted hover:text-primary transition-colors"
              >
                <Plus weight="bold" /> ADD ROLE
              </button>
            </div>
            
            <div className="space-y-3">
              {roles.map((role, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input 
                      required
                      placeholder="Role Title (e.g. Frontend Developer)"
                      className={inputClass}
                      value={role.title}
                      onChange={e => updateRole(idx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <input 
                      type="number"
                      required
                      min={1}
                      title="Openings"
                      className={`${inputClass} text-center font-bold`}
                      value={role.openingsCount}
                      onChange={e => updateRole(idx, 'openingsCount', parseInt(e.target.value, 10))}
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeRole(idx)}
                    disabled={roles.length === 1}
                    className="p-3 mt-0.5 text-text-muted hover:text-error hover:bg-error-container rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                  >
                    <Trash size={20} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center justify-end gap-3 border-t border-border-subtle mt-8">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full md:w-auto btn-secondary px-6 py-2"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full md:w-auto btn-primary px-8 py-2 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
