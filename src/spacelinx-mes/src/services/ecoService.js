import api from "./api";

const apiUrl = "Eco";

export const fetchEco = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createEco = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const createEcoWithParts = async (data) => {
  const response = await api.post(`${apiUrl}/create-eco-with-parts`, data);
  return response.data;
};

export const fetchEcoWithStatus = async (status) => {
  const response = await api.get(`${apiUrl}/Status?status=${status}`);
  return response.data;
};

export const fetchEcoDetailsById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};

export const fetchEcoLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const fetchEcoById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const updateEco = async (id, data) => {
  const response = await api.put(`${apiUrl}/eco-update/${id}`, data);
  return response.data;
};

export const deleteEco = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const submitEco = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/submit`);
  return response.data;
};

export const discardEco = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/discard`);
  return response.data;
};

export const rejectEco = async (id, notes) => {
  const response = await api.put(`${apiUrl}/${id}/reject?notes=${notes}
`);
  return response.data;
};

export const approveEco = async (id, notes) => {
  const response = await api.put(`${apiUrl}/approve/${id}?comment=${notes}`);
  return response.data;
};
export const fetchEcoWithUser = async () => {
  const response = await api.get(`${apiUrl}/eco-with-users`);
  return response.data;
};

export const fetchEcoApprovalHistory = async (id) => {
  const response = await api.get(`${apiUrl}/eco-approval-history/${id}`);
  return response.data;
};
