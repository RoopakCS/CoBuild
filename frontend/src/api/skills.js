import { apiClient } from '../lib/axios';

export const skillsApi = {
  addSkill: async (skill) => {
    const { data } = await apiClient.post('/skills', skill);
    return data;
  },
  getMySkills: async () => {
    const { data } = await apiClient.get('/skills');
    return data;
  },
  updateSkill: async ({ id, ...skill }) => {
    const { data } = await apiClient.put(`/skills/${id}`, skill);
    return data;
  },
  deleteSkill: async (id) => {
    const { data } = await apiClient.delete(`/skills/${id}`);
    return data;
  },
};
