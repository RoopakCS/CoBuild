import { apiClient } from '../lib/axios';

export const rolesApi = {
  create: async ({ projectId, ...payload }) => {
    const { data } = await apiClient.post(`/projects/${projectId}/roles`, payload);
    return data;
  },
  getProjectRoles: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/roles`);
    return data;
  },
  delete: async ({ projectId, roleId }) => {
    const { data } = await apiClient.delete(`/projects/${projectId}/roles/${roleId}`);
    return data;
  }
};
