import { apiClient } from '../lib/axios';

export const membershipsApi = {
  addMember: async (payload) => {
    const { data } = await apiClient.post('/v1/memberships', payload);
    return data;
  },
  getProjectMembers: async (projectId) => {
    const { data } = await apiClient.get(`/v1/memberships/project/${projectId}`);
    return data;
  },
  getUserMemberships: async (userId) => {
    const { data } = await apiClient.get(`/v1/memberships/user/${userId}`);
    return data;
  },
  removeMember: async ({ projectId, userId }) => {
    const { data } = await apiClient.delete(`/v1/memberships/project/${projectId}/user/${userId}`);
    return data;
  },
  leaveProject: async (membershipId) => {
    const { data } = await apiClient.delete(`/v1/memberships/${membershipId}/leave`);
    return data;
  }
};
