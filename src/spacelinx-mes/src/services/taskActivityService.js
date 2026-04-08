import api from "./api";

const apiUrl = "TaskActivity";

// Read-only endpoints for activity feed
export const fetchActivitiesByTask = async (taskId, limit = 50) => {
  const response = await api.get(`${apiUrl}/task/${taskId}`, { params: { limit } });
  return response.data;
};

export const fetchActivitiesByProject = async (projectId, limit = 100) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`, { params: { limit } });
  return response.data;
};

export const fetchMyActivity = async (limit = 50) => {
  const response = await api.get(`${apiUrl}/my-activity`, { params: { limit } });
  return response.data;
};

export const fetchActivitiesByType = async (taskId, activityType, limit = 50) => {
  const response = await api.get(`${apiUrl}/task/${taskId}/type/${activityType}`, { params: { limit } });
  return response.data;
};
