import api from "./api";

const apiUrl = "Kanban";

// Get Kanban board data for a project
export const fetchProjectKanbanData = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`);
  return response.data;
};

// Move a task to a different column
export const moveTask = async (taskId, columnId, sortOrder) => {
  const response = await api.put(`${apiUrl}/task/${taskId}/move`, {
    columnId,
    sortOrder,
  });
  return response.data;
};

// Reorder tasks within a column
export const reorderTasks = async (columnId, taskOrders) => {
  const response = await api.put(`${apiUrl}/column/${columnId}/reorder`, {
    taskOrders,
  });
  return response.data;
};

// Get task counts per column
export const fetchColumnStats = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}/stats`);
  return response.data;
};
