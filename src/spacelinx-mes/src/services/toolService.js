import api from "./api";

const apiUrl = "tool";
export const fetchTools = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchToolsLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createTool = async (tool) => {
  const response = await api.post(apiUrl, tool);
  return response.data;
};

export const updateTool = async (id, tool) => {
  const response = await api.put(`${apiUrl}/${id}`, tool);
  return response.data;
};

export const deleteTool = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
