import api from "./api";

const apiUrl = "ProjectDashboard";

/**
 * Get task summary statistics
 */
export const fetchTaskSummary = async (projectId = null) => {
  const url = projectId
    ? `${apiUrl}/task-summary?projectId=${projectId}`
    : `${apiUrl}/task-summary`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get project progress for all projects
 */
export const fetchProjectProgress = async () => {
  const response = await api.get(`${apiUrl}/project-progress`);
  return response.data;
};

/**
 * Get overdue tasks
 */
export const fetchOverdueTasks = async (projectId = null, limit = 10) => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  params.append("limit", limit.toString());

  const response = await api.get(`${apiUrl}/overdue-tasks?${params}`);
  return response.data;
};

/**
 * Get current user's tasks
 */
export const fetchDashboardMyTasks = async (limit = 10) => {
  const response = await api.get(`${apiUrl}/my-tasks?limit=${limit}`);
  return response.data;
};

/**
 * Get team workload summary
 */
export const fetchTeamWorkload = async (projectId = null) => {
  const url = projectId
    ? `${apiUrl}/team-workload?projectId=${projectId}`
    : `${apiUrl}/team-workload`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get recent activity
 */
export const fetchRecentActivity = async (projectId = null, limit = 20) => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  params.append("limit", limit.toString());

  const response = await api.get(`${apiUrl}/recent-activity?${params}`);
  return response.data;
};

/**
 * Get status distribution
 */
export const fetchStatusDistribution = async (projectId = null) => {
  const url = projectId
    ? `${apiUrl}/status-distribution?projectId=${projectId}`
    : `${apiUrl}/status-distribution`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get priority breakdown
 */
export const fetchPriorityBreakdown = async (projectId = null) => {
  const url = projectId
    ? `${apiUrl}/priority-breakdown?projectId=${projectId}`
    : `${apiUrl}/priority-breakdown`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get time logged chart data
 */
export const fetchTimeLoggedChart = async (projectId = null, days = 30) => {
  const params = new URLSearchParams();
  if (projectId) params.append("projectId", projectId);
  params.append("days", days.toString());

  const response = await api.get(`${apiUrl}/time-logged-chart?${params}`);
  return response.data;
};

/**
 * Get milestone tracker data
 */
export const fetchMilestoneTracker = async (projectId = null) => {
  const url = projectId
    ? `${apiUrl}/milestone-tracker?projectId=${projectId}`
    : `${apiUrl}/milestone-tracker`;
  const response = await api.get(url);
  return response.data;
};
