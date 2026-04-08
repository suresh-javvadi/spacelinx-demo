import api from "./api";

const apiUrl = "BoardColumn";

// Standard CRUD operations
export const fetchBoardColumns = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchBoardColumnById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createBoardColumn = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateBoardColumn = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};

export const deleteBoardColumn = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

// Get columns for a specific project
export const fetchBoardColumnsByProject = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`);
  return response.data;
};

// Reorder columns within a project
export const reorderBoardColumns = async (projectId, columnOrders) => {
  const response = await api.put(`${apiUrl}/project/${projectId}/reorder`, {
    columnOrders,
  });
  return response.data;
};

// Set a column as default
export const setDefaultColumn = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/set-default`);
  return response.data;
};

// Create default columns for a project
export const createDefaultColumns = async (projectId) => {
  const response = await api.post(`${apiUrl}/project/${projectId}/create-defaults`);
  return response.data;
};
