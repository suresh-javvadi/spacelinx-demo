import api from "./api";

const apiUrl = "GuideStepTask";
export const fetchGuideStepTask = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchGuideStepTaskWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchGuideStepTaskWithStepId = async (id) => {
  const response = await api.get(`${apiUrl}/guidestep/${id}`);
  return response.data;
};
export const createGuideStepTask = async (task) => {
  const response = await api.post(apiUrl, task);
  return response.data;
};

export const updateGuideStepTask = async (id, updatedTask) => {
  const response = await api.put(`${apiUrl}/${id}`, updatedTask);
  return response.data;
};

export const deleteGuideStepTask = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const guideStepTaskReorder = async (id, sequence) => {
  const response =
    await api.put(`${apiUrl}/reorder-task?guideStepTaskId=${id}&newSequence=${sequence}
`);
  return response.data;
};
