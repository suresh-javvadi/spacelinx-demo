import api from "./api";

const lineItemApiUrl = "GrnLineItem";

export const fetchGRNLineItemsByGRNId = async (grnId) => {
  const response = await api.get(`${lineItemApiUrl}?grnId=${grnId}`);
  return response.data;
};

export const fetchGRNLineItemById = async (id) => {
  const response = await api.get(`${lineItemApiUrl}/${id}`);
  return response.data;
};

export const createGRNLineItem = async (lineItemData) => {
  const response = await api.post(lineItemApiUrl, lineItemData);
  return response.data;
};

export const updateGRNLineItem = async (id, lineItemData) => {
  const response = await api.put(`${lineItemApiUrl}/${id}`, lineItemData);
  return response.data;
};

export const deleteGRNLineItem = async (id) => {
  const response = await api.delete(`${lineItemApiUrl}/${id}`);
  return response.data;
};
