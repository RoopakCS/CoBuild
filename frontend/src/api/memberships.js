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
  removeMember: async ({ projectId, userId, message }) => {
    const { data } = await apiClient.delete(`/v1/memberships/project/${projectId}/user/${userId}`, {
      data: { message }
    });
    return data;
  },
  leaveProject: async ({ membershipId, message }) => {
    const { data } = await apiClient.delete(`/v1/memberships/${membershipId}/leave`, {
      data: { message }
    });
    return data;
  },
  approveLeave: async ({ membershipId, message }) => {
    const { data } = await apiClient.post(`/v1/memberships/${membershipId}/approve-leave`, { message });
    return data;
  },
  rejectLeave: async ({ membershipId, message }) => {
    const { data } = await apiClient.post(`/v1/memberships/${membershipId}/reject-leave`, { message });
    return data;
  }
};
