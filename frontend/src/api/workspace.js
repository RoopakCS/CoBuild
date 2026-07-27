import { apiClient } from '../lib/axios';

export const workspaceApi = {

  // ── Announcements ──

  getAnnouncements: async (projectId) => {
    const { data } = await apiClient.get(`/v1/projects/${projectId}/workspace/announcements`);
    return data;
  },

  createAnnouncement: async (projectId, payload) => {
    const { data } = await apiClient.post(`/v1/projects/${projectId}/workspace/announcements`, payload);
    return data;
  },

  deleteAnnouncement: async (projectId, announcementId) => {
    await apiClient.delete(`/v1/projects/${projectId}/workspace/announcements/${announcementId}`);
  },

  // ── Workspace Links ──

  getLinks: async (projectId) => {
    const { data } = await apiClient.get(`/v1/projects/${projectId}/workspace/links`);
    return data;
  },

  createLink: async (projectId, payload) => {
    const { data } = await apiClient.post(`/v1/projects/${projectId}/workspace/links`, payload);
    return data;
  },

  deleteLink: async (projectId, linkId) => {
    await apiClient.delete(`/v1/projects/${projectId}/workspace/links/${linkId}`);
  },

  // ── Team Directory ──

  getTeamDirectory: async (projectId) => {
    const { data } = await apiClient.get(`/v1/projects/${projectId}/workspace/team`);
    return data;
  },

};
