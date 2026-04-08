import api from "./api";

const apiUrl = "optionSet";

export const fetchOptionSetByAppName = async () => {
  const response = await api.get(`${apiUrl}/application-name`);
  return response.data;
};
export const createOptionSet = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};
export const fetchOptionSetLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const fetchOptionSetById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const updateOptionSet = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};
export const deleteOptionSet = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchOptionSetByName = async (name) => {
  const response = await api.get(`${apiUrl}/name?name=${name}`);
  return response.data;
};
