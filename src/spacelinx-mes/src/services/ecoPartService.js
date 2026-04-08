import api from "./api";

const apiUrl = "EcoPart";

export const createEcoPart = async (id, data) => {
  const response = await api.post(`${apiUrl}/create-eco-part/${id}`, data);
  return response.data;
};
export const createEcoParts = async (id, data) => {
  const response = await api.post(`${apiUrl}/create-eco-parts/${id}`, data);
  return response.data;
};
export const deleteEcoPart = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const updateEcoPart = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};
