import api from "./api";

const apiUrl = "Gantt";

// Get Gantt chart data for a project
export const fetchProjectGanttData = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`);
  return response.data;
};

// Update task dates (for drag-drop operations)
export const updateTaskDates = async (taskId, startDate, dueDate) => {
  const response = await api.put(`${apiUrl}/task/${taskId}/dates`, {
    startDate,
    dueDate,
  });
  return response.data;
};

// Update task progress
export const updateTaskProgress = async (taskId, progress) => {
  const response = await api.put(`${apiUrl}/task/${taskId}/progress`, {
    progress,
  });
  return response.data;
};

// Update task order (for reordering in Gantt)
export const updateTaskOrder = async (taskId, sortOrder, parentTaskId = null) => {
  const response = await api.put(`${apiUrl}/task/${taskId}/order`, {
    sortOrder,
    parentTaskId,
  });
  return response.data;
};
