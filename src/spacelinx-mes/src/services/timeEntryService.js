import api from "./api";

const apiUrl = "TimeEntry";

// Standard CRUD operations
export const fetchTimeEntries = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchTimeEntryById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createTimeEntry = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateTimeEntry = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};

export const deleteTimeEntry = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

// Custom endpoints

/**
 * Log time entry with activity tracking
 */
export const logTime = async (data) => {
  const response = await api.post(`${apiUrl}/log`, data);
  return response.data;
};

/**
 * Get time entries for a specific task
 */
export const fetchTimeEntriesByTask = async (taskId) => {
  const response = await api.get(`${apiUrl}/task/${taskId}`);
  return response.data;
};

/**
 * Get time summary for a task
 */
export const fetchTaskTimeSummary = async (taskId) => {
  const response = await api.get(`${apiUrl}/task/${taskId}/summary`);
  return response.data;
};

/**
 * Get time entries for a specific staff member
 */
export const fetchTimeEntriesByStaff = async (staffId) => {
  const response = await api.get(`${apiUrl}/staff/${staffId}`);
  return response.data;
};

/**
 * Get current user's time entries
 */
export const fetchMyTimeEntries = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const url = queryString ? `${apiUrl}/my-entries?${queryString}` : `${apiUrl}/my-entries`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get time entries for a project
 */
export const fetchTimeEntriesByProject = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`);
  return response.data;
};

/**
 * Get time summary for a project
 */
export const fetchProjectTimeSummary = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}/summary`);
  return response.data;
};

/**
 * Get time report with filters
 */
export const fetchTimeReport = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.projectId) params.append('projectId', filters.projectId);
  if (filters.staffId) params.append('staffId', filters.staffId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.billable !== undefined && filters.billable !== null) {
    params.append('billable', filters.billable);
  }
  if (filters.workType) params.append('workType', filters.workType);

  const queryString = params.toString();
  const url = queryString ? `${apiUrl}/report?${queryString}` : `${apiUrl}/report`;
  const response = await api.get(url);
  return response.data;
};
