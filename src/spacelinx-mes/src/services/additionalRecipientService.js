import api from "./api";

const apiUrl = "/AdditionalRecipientConfiguration";

export const fetchAdditionalRecipients = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchAdditionalRecipientsTemplateCode = async (templateCode) => {
  const response = await api.get(`${apiUrl}/template/${templateCode}`);
  return response.data;
};

export const createAdditionalRecipient = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateAdditionalRecipient = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};

export const deleteAdditionalRecipient = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
