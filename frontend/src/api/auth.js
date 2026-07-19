import { apiClient } from '../lib/axios';

export const authApi = {
  login: async (credentials) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },
  register: async (credentials) => {
    const { data } = await apiClient.post('/auth/register', credentials);
    return data;
  },
};
