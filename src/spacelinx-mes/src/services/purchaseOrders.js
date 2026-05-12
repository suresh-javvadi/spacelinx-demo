import api from "./api";

const apiUrl = "PurchaseOrder";

export const fetchPurchaseOrders = async ({ allDepartments = false } = {}) => {
  const params = allDepartments ? { allDepartments: true } : undefined;
  const response = await api.get(`${apiUrl}/purchase-order`, { params });
  return response.data;
};
export const fetchPurchaseOrderwithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};
export const fetchPOLookUp = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};
export const updatePurchaseOrder = async (id, po) => {
  const response = await api.put(`${apiUrl}/purchase-order-update/${id}`, po);
  return response.data;
};
export const submitPurchaseOrder = async (id) => {
  const response = await api.put(`${apiUrl}/submit/${id}`);
  return response.data;
};
export const approvePurchaseOrder = async (id) => {
  const response = await api.put(`${apiUrl}/approve/${id}`);
  return response.data;
};
export const rejectPurchaseOrder = async (id) => {
  const response = await api.put(`${apiUrl}/reject/${id}`);
  return response.data;
};
export const closePurchaseOrder = async (id) => {
  const response = await api.put(`${apiUrl}/close/${id}`);
  return response.data;
};
export const createPO = async (po) => {
  const response = await api.post(`${apiUrl}/purchase-order-details`, po);
  return response.data;
};
export const deletePO = async (poId) => {
  const response = await api.delete(`${apiUrl}/${poId}`);
  return response.data;
};
export const fetchZohoCsv = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/export/zoho-csv`, {
    responseType: "blob",
  });
  return response.data;
};

export const fetchZohoCsvByIds = async (ids) => {
  const response = await api.post(
    `${apiUrl}/export/zoho-csv-multiple`,
    {
      ids,
    },
    {
      responseType: "blob",
    },
  );

  return response.data;
};
