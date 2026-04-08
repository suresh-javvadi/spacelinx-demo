import api from "./api";

const apiUrl = "TaskDependency";

// Standard CRUD operations
export const fetchTaskDependencies = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchTaskDependencyById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createTaskDependency = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateTaskDependency = async (id, dependency) => {
  const response = await api.put(`${apiUrl}/${id}`, dependency);
  return response.data;
};

export const deleteTaskDependency = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

// Custom endpoints
export const fetchDependenciesByTask = async (taskId) => {
  const response = await api.get(`${apiUrl}/task/${taskId}`);
  return response.data;
};

export const fetchDependenciesByProject = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`);
  return response.data;
};
