import api from "./api";

const apiUrl = "PartTypeCategory";
export const fetchPartTypeCategories = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const createPartTypeCategory = async (part) => {
  const response = await api.post(apiUrl, part);
  return response.data;
};
export const fetchPartTypeCategoryById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const updatePartTypeCategory = async (id, part) => {
  const response = await api.put(`${apiUrl}/${id}`, part);
  return response.data;
};
export const deletePartTypeCategory = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchPartTypeCategoryLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
