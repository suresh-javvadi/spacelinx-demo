import api from "./api";

const apiUrl = "InventoryTransaction";

export const fetchInventoryTransactions = async (partId) => {
  const response = await api.get(`${apiUrl}/InventoryTransactions/${partId}`);
  return response.data;
};

export const fetchInventoryTransactionsByPart = async (partId) => {
  const response = await api.get(
    `${apiUrl}/InventoryTransactions-details/${partId}`
  );
  return response.data;
};

export const fetchAllInventoryTransactions = async (partId) => {
  const response = await api.get(`${apiUrl}/InventoryTransactions-details`);
  return response.data;
};
