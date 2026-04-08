import api from "./api";
const apiUrl = "Platform";
export const fetchPlatform = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchPlatformLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const fetchPlatformWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchProductPlatform = async (platformId) => {
  const response = await api.get(`Product/${apiUrl}/${platformId}`);
  return response.data;
};

export const fetchGuidePlatform = async (platformId) => {
  const response = await api.get(`Guide/${apiUrl}/${platformId}`);
  return response.data;
};
