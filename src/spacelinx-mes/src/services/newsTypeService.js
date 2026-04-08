import api from "./api";

const apiUrl = "newstype";
export const fetchNewsTypes = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchNewsTypeLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createNewsType = async (newsType) => {
  const response = await api.post(apiUrl, newsType);
  return response.data;
};

export const updateNewsType = async (id, newsType) => {
  const response = await api.put(`${apiUrl}/${id}`, newsType);
  return response.data;
};

export const deleteNewsType = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
