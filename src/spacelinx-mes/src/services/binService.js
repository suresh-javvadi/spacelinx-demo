import api from "./api";
const apiUrl = "BinManagement";
export const fetchBins = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchBinsByLocationId = async (id) => {
  const response = await api.get(`${apiUrl}/location/${id}`);
  return response.data;
};
export const createBin = async (binData) => {
  const response = await api.post(apiUrl, binData);
  return response.data;
};
export const updateBin = async (id, binData) => {
  const response = await api.put(`${apiUrl}/${id}`, binData);
  return response.data;
};
export const deleteBin = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
