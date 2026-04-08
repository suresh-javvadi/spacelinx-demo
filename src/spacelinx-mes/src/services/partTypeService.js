import api from "./api";

const apiUrl = "PartType";
export const fetchPartTypes = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchPartTypesLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createPartType = async (partType) => {
  const response = await api.post(apiUrl, partType);
  return response.data;
};

export const updatePartType = async (id, partType) => {
  const response = await api.put(`${apiUrl}/${partType.id}`, partType);
  return response.data;
};

export const deletePartType = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
