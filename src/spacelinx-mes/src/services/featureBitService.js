import api from "./api";

const apiUrl = "FeatureBit";

export const fetchFeatureBit = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createFeatureBit = async (featureBit) => {
  const response = await api.post(apiUrl, featureBit);
  return response.data;
};

export const updateFeatureBit = async (id, featureBit) => {
  const response = await api.put(`${apiUrl}/${id}`, featureBit);
  return response.data;
};

export const deleteFeatureBit = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const activateFeatureBit = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/Activate`);
  return response.data;
};

export const deactivateFeatureBit = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/DeActivate`);
  return response.data;
};
export const fetchFeatureBitLookUp = async () => {
  const response = await api.get(`${apiUrl}/LookUp`);
  return response.data;
};
