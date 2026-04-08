import api from "./api";

const apiUrl = "DashboardWidget";

// Standard CRUD operations
export const fetchDashboardWidgets = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchDashboardWidgetById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createDashboardWidget = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateDashboardWidget = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};

export const deleteDashboardWidget = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

// Custom endpoints

/**
 * Get widgets for a specific user
 */
export const fetchWidgetsByUser = async (userId) => {
  const response = await api.get(`${apiUrl}/user/${userId}`);
  return response.data;
};

/**
 * Get current user's dashboard widgets
 */
export const fetchMyDashboard = async () => {
  const response = await api.get(`${apiUrl}/my-dashboard`);
  return response.data;
};

/**
 * Bulk update widget positions (for react-grid-layout)
 */
export const bulkUpdatePositions = async (updates) => {
  const response = await api.put(`${apiUrl}/bulk-positions`, updates);
  return response.data;
};

/**
 * Create default dashboard for a user
 */
export const createDefaultDashboard = async (userId) => {
  const response = await api.post(`${apiUrl}/create-default/${userId}`);
  return response.data;
};
