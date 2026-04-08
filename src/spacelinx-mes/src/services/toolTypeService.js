import api from "./api";

const apiUrl = "tooltype";
export const fetchToolTypes = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchToolTypesLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createToolType = async (toolType) => {
  const response = await api.post(apiUrl, toolType);
  return response.data;
};

export const updateToolType = async (id, toolType) => {
  const response = await api.put(`${apiUrl}/${id}`, toolType);
  return response.data;
};

export const deleteToolType = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
