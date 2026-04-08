import api from "./api";

const apiUrl = "InventoryStock";

export const fetchInventoryStock = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchInventoryStockWithPartId = async (id) => {
  const response = await api.get(`${apiUrl}/inventory-part-details/${id}`);
  return response.data;
};

export const createInventoryStock = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateInventoryStock = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};

export const deleteInventoryStock = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchInventoryStockById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchInventoryStocksLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};

export const fetchActiveInventoryStock = async () => {
  const response = await api.get(`${apiUrl}/Active`);
  return response.data;
};
export const fetchInventoryStockByLocation = async (id) => {
  const response = await api.get(`${apiUrl}/inventory/by-location/${id}`);
  return response.data;
};
