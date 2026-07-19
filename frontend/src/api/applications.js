import { apiClient } from '../lib/axios';

export const applicationsApi = {
  apply: async ({ projectId, ...payload }) => {
    const { data } = await apiClient.post(`/projects/${projectId}/applications`, payload);
    return data;
  },
  getProjectApplications: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/applications`);
    return data;
  },
  getMyApplications: async () => {
    const { data } = await apiClient.get('/users/me/applications');
    return data;
  },
  updateStatus: async ({ applicationId, status }) => {
    const { data } = await apiClient.patch(`/applications/${applicationId}/status`, { status });
    return data;
  },
  withdraw: async (applicationId) => {
    const { data } = await apiClient.patch(`/applications/${applicationId}/withdraw`);
    return data;
  },
};
