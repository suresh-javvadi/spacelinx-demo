import api from "./api";

const apiUrl = "MaterialKit";
export const fetchMaterialKit = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchMaterialKitLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};
export const createMaterialKit = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};
export const createMaterialKitWithImage = async (data) => {
  const response = await api.post(`${apiUrl}/image`, data);
  return response.data;
};
export const updateMaterialKit = async (id, tool) => {
  const response = await api.put(`${apiUrl}/${id}`, tool);
  return response.data;
};
export const deleteMaterialKit = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchMaterialKitWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchKitWithId = async (id) => {
  const response = await api.get(`kit/${id}`);
  return response.data;
};
export const updateMaterialKitPicture = async (id, pictureData) => {
  const response = await api.put(
    `${apiUrl}/picture-upload?id=${id}`,
    pictureData
  );
  return response.data;
};
