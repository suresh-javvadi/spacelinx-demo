import api from "./api";

const apiUrl = "StockMovement";

export const fetchStockMovementsWithUser = async () => {
  const response = await api.get(`${apiUrl}/stock-movement-with-user`);
  return response.data;
};
export const createStockMovement = async (payload) => {
  const response = await api.post(`${apiUrl}/create`, payload);
  return response.data;
};
export const createSMWithLineItems = async (payload) => {
  const response = await api.post(`${apiUrl}/with-line-items`, payload);
  return response.data;
};
export const submitSMWithLineItems = async (payload) => {
  const response = await api.post(`${apiUrl}/submit-with-line-items`, payload);
  return response.data;
};
export const approveStockMovement = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/approve`);
  return response.data;
};
export const rejectStockMovement = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/reject`);
  return response.data;
};
export const fetchStockMovementById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};
