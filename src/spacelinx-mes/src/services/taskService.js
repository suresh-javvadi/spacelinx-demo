import api from "./api";

const apiUrl = "Task";

// Standard CRUD operations
export const fetchTasks = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchTaskById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createTask = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await api.put(`${apiUrl}/${id}`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchTasksLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const fetchActiveTasks = async () => {
  const response = await api.get(`${apiUrl}/Active`);
  return response.data;
};

// Enhanced task management endpoints
export const fetchTasksByProject = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`);
  return response.data;
};

export const fetchTaskHierarchy = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}/hierarchy`);
  return response.data;
};

export const fetchSubtasks = async (taskId) => {
  const response = await api.get(`${apiUrl}/${taskId}/subtasks`);
  return response.data;
};

export const fetchMyTasks = async () => {
  const response = await api.get(`${apiUrl}/my-tasks`);
  return response.data;
};

export const updateTaskStatus = async (id, status) => {
  const response = await api.put(`${apiUrl}/${id}/status`, { status });
  return response.data;
};

export const updateTaskProgress = async (id, progressPercent) => {
  const response = await api.put(`${apiUrl}/${id}/progress`, { progressPercent });
  return response.data;
};
