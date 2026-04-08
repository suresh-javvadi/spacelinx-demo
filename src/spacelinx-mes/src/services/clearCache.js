import api from "./api";
const apiUrl = "/Cache";
export const clearCache = async () => {
  const response = await api.delete(`${apiUrl}/clear`);
  return response.data;
};
