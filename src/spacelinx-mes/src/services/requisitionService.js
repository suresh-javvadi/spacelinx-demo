import api from "./api";

const apiUrl = "Requisition";

export const fetchRequisitions = async ({ allDepartments = false } = {}) => {
  const params = allDepartments ? { allDepartments: true } : undefined;
  const response = await api.get(`${apiUrl}/requisition`, { params });
  return response.data;
};

export const fetchRequisitionLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const createRequisition = async (data) => {
  const response = await api.post(`${apiUrl}/requisition-details`, data);
  return response.data;
};

export const deleteRequisition = async (id) => {
  const response = await api.delete(`${apiUrl}/requisition-delete/${id}`);
  return response.data;
};

export const fetchRequisitionById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};

export const updateRequisition = async (id, data) => {
  const response = await api.put(
    `${apiUrl}/requisition-details-update/${id}`,
    data
  );
  return response.data;
};

export const submitRequisition = async (id) => {
  const response = await api.put(`${apiUrl}/submit/${id}`);
  return response.data;
};

export const rejectRequisition = async (id) => {
  const response = await api.put(`${apiUrl}/reject/${id}`);
  return response.data;
};

export const approveRequisition = async (id) => {
  const response = await api.put(`${apiUrl}/approve/${id}`);
  return response.data;
};

export const createPurchaseOrderFromRequisition = async (id, companyId) => {
  const response = await api.post(`${apiUrl}/${id}/create-purchase-order`, {
    companyId,
  });
  return response.data;
};
