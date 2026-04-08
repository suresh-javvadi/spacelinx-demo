import api from "./api";

const apiUrl = "InventoryPart";

export const fetchInventoryPart = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchInventoryPartWithPartId = async (id) => {
  const response = await api.get(`${apiUrl}/inventory-part-details/${id}`);
  return response.data;
};

export const createInventoryPart = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateInventoryPart = async (id, data) => {
  const response = await api.put(`${apiUrl}/inventory-part-Update/${id}`, data);
  return response.data;
};
export const updateInventoryPartById = async (id, data) => {
  const response = await api.put(
    `${apiUrl}/inventory-part-update-details/${id}`,
    data,
  );
  return response.data;
};

export const activateInventoryPart = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/Activate`);
  return response.data;
};

export const deactivateInventoryPart = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/DeActivate`);
  return response.data;
};

export const deleteInventoryPart = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchInventoryPartById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchInventoryPartsLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};

export const fetchActiveInventoryPart = async () => {
  const response = await api.get(`${apiUrl}/Active`);
  return response.data;
};

export const fetchInventoryService = async () => {
  const response = await api.get(`${apiUrl}/inventory-services`);
  return response.data;
};

export const fetchInventoryParts = async () => {
  const response = await api.get(`${apiUrl}/inventory-parts`);
  return response.data;
};
export const fetchInventoryPartWithPrice = async () => {
  const response = await api.get(`${apiUrl}/inventory-part_price`);
  return response.data;
};

export const fetchInventoryGoods = async () => {
  const response = await api.get(`${apiUrl}/inventory-goods`);
  return response.data;
};
export const fetchInventoryPartsByLocation = async (id) => {
  const response = await api.get(`${apiUrl}/inventory-parts/by-location/${id}`);
  return response.data;
};
export const fetchInPartsTrackingIdsById = async (id, mt) => {
  const response = await api.get(
    `${apiUrl}/inventory-parts/${id}/tracking-ids/${mt}`,
  );
  return response.data;
};

export const fetchInventoryPartPurchaseHistory = async (id) => {
  const response = await api.get(`${apiUrl}/purchase-history/${id}`);
  return response.data;
};

export const fetchInventoryPartIssuedHistory = async (id) => {
  const response = await api.get(`${apiUrl}/issue-history/${id}`);
  return response.data;
};
