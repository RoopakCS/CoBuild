import { apiClient } from '../lib/axios';

export const usersApi = {
  getMe: async () => {
    const { data } = await apiClient.get('/users/me');
    return data;
  },
  updateProfile: async (profile) => {
    const { data } = await apiClient.put('/users/me', profile);
    return data;
  },
  getById: async (id) => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },
};
