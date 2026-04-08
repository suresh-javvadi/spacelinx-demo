import api from "./api";

const apiUrl = "TaskComment";

// Standard CRUD operations
export const fetchTaskComments = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchTaskCommentById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createTaskComment = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateTaskComment = async (id, comment) => {
  const response = await api.put(`${apiUrl}/${id}`, comment);
  return response.data;
};

export const deleteTaskComment = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

// Custom endpoints
export const fetchCommentsByTask = async (taskId) => {
  const response = await api.get(`${apiUrl}/task/${taskId}`);
  return response.data;
};

export const fetchCommentReplies = async (commentId) => {
  const response = await api.get(`${apiUrl}/${commentId}/replies`);
  return response.data;
};
