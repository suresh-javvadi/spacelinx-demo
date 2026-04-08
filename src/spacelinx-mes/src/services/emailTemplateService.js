import api from "./api";

const apiUrl = "EmailTemplate";

export const fetchEmailTemplates = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createEmailTemplate = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateEmailTemplate = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};
