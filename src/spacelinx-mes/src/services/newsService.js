import api from "./api";

const apiUrl = "news";
export const fetchNews = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchNewsLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const createNews = async (news) => {
  const response = await api.post(apiUrl, news);
  return response.data;
};

export const updateNews = async (id, news) => {
  const response = await api.put(`${apiUrl}/${id}`, news);
  return response.data;
};

export const deleteNews = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
