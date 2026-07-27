import { apiClient } from '../lib/axios';

export const activitiesApi = {
  // Get paginated activities for a project
  getProjectActivities: async (projectId, page = 0, size = 10) => {
    const response = await apiClient.get(`/projects/${projectId}/activities`, {
      params: { page, size }
    });
    return response.data; // Expected: Page<ProjectActivityResponse>
  },

  // Create a new activity update
  createActivity: async ({ projectId, content }) => {
    const response = await apiClient.post(`/projects/${projectId}/activities`, { content });
    return response.data;
  },

  // Delete an activity
  deleteActivity: async ({ projectId, activityId }) => {
    const response = await apiClient.delete(`/projects/${projectId}/activities/${activityId}`);
    return response.data;
  }
};
