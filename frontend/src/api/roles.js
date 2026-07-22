import { apiClient } from '../lib/axios';

export const rolesApi = {
  getProjectRoles: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/roles`);
    return data;
  },

  create: async ({ projectId, ...payload }) => {
    const { data } = await apiClient.post(`/projects/${projectId}/roles`, payload);
    return data;
  },

  update: async ({ projectId, roleId, ...payload }) => {
    const { data } = await apiClient.patch(`/projects/${projectId}/roles/${roleId}`, payload);
    return data;
  },

  delete: async ({ projectId, roleId }) => {
    const { data } = await apiClient.delete(`/projects/${projectId}/roles/${roleId}`);
    return data;
  },
};
