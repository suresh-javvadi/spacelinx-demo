import api from "./api";

const apiUrl = "Issue";

export const fetchIssues = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createIssues = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateIssue = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}/issue`, data);
  return response.data;
};

export const activateIssue = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/Activate`);
  return response.data;
};

export const deactivateIssue = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/DeActivate`);
  return response.data;
};

export const deleteIssue = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchIssueById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchIssuesLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};

export const fetchActiveIssues = async () => {
  const response = await api.get(`${apiUrl}/Active`);
  return response.data;
};

export const createIssue = async (data) => {
  const response = await api.post(`${apiUrl}/Issue`, data);
  return response.data;
};
