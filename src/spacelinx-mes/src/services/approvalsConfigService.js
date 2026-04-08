import api from "./api";

const apiUrl = "/ApprovalConfiguration";

export const fetchApprovalConfigs = async (type) => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const createApprovalConfig = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};
export const updateApprovalConfig = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};
export const fetchApprovalConfigByType = async (type) => {
  const response = await api.get(`${apiUrl}/entity/${type}`);
  return response.data;
};
