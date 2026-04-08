import api from "./api";

const apiUrl = "PartLevel";

export const fetchPartLevels = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchPartLevelLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const fetchPartLevelWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createPartLevel = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updatePartLevel = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};
