import api from "./api";

const apiUrl = "/Build";
export const fetchBuild = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchBuildWithProductId = async (productId) => {
  try {
    const response = await api.get(`${apiUrl}/${productId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBuild = async (build) => {
  try {
    const response = await api.post(apiUrl, build);
    return response.data;
  } catch (error) {
    throw error;
  }
};
