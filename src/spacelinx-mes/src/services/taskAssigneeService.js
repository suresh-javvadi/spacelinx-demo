import api from "./api";

const apiUrl = "TaskAssignee";

// Standard CRUD operations
export const fetchTaskAssignees = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchTaskAssigneeById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createTaskAssignee = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateTaskAssignee = async (id, assignee) => {
  const response = await api.put(`${apiUrl}/${id}`, assignee);
  return response.data;
};

export const deleteTaskAssignee = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

// Custom endpoints
export const fetchAssigneesByTask = async (taskId) => {
  const response = await api.get(`${apiUrl}/task/${taskId}`);
  return response.data;
};

export const fetchAssigneesByStaff = async (staffId) => {
  const response = await api.get(`${apiUrl}/staff/${staffId}`);
  return response.data;
};

export const bulkAssignToTask = async (taskId, assignments) => {
  const response = await api.post(`${apiUrl}/task/${taskId}/bulk`, { assignments });
  return response.data;
};
