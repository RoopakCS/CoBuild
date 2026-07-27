import { apiClient } from '../lib/axios';

export const githubApi = {
  getStats: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/github-stats`);
    return data;
  },
};
