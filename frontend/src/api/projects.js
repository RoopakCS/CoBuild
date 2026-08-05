import { apiClient } from '../lib/axios';

export const projectsApi = {
  getAll: async (params) => {
    const { data } = await apiClient.get('/projects', { params });
    return data;
  },
  getHackathons: async (params) => {
    const { data } = await apiClient.get('/projects', { params: { ...params, projectType: 'HACKATHON' } });
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/projects/${id}`);
    return data;
  },
  getByOwner: async (ownerId) => {
    const { data } = await apiClient.get(`/projects/owner/${ownerId}`);
    return data;
  },
  create: async (project) => {
    const { data } = await apiClient.post('/projects', project);
    return data;
  },
  update: async ({ id, ...project }) => {
    const { data } = await apiClient.patch(`/projects/${id}`, project);
    return data;
  },
  delete: async (id) => {
    const { data } = await apiClient.delete(`/projects/${id}`);
    return data;
  },
};

