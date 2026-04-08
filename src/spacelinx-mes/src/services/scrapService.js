import api from "./api";

const apiUrl = "ScrapRequest";

// GET → All scrap with staff details
export const fetchScrap = async () => {
  const response = await api.get(`${apiUrl}/scrap-with-user`);
  return response.data;
};

// POST → Create new scrap

export const createScrap = async (formData) => {
  const response = await api.post(`${apiUrl}/scrap-details`, formData);
  return response.data;
};

// GET → Scrap details by ID
export const fetchScrapDetails = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};

// PUT → Update scrap (multipart/form-data)
export const updateScrap = async (id, formData) => {
  const response = await api.put(`${apiUrl}/scrap-update/${id}`, formData);
  return response.data;
};

export const submitScrap = async (id) => {
  const response = await api.put(`${apiUrl}/submit/${id}`);
  return response.data;
};
export const approveScrap = async (id) => {
  const response = await api.put(`${apiUrl}/approve/${id}`);
  return response.data;
};
export const rejectScrap = async (id) => {
  const response = await api.put(`${apiUrl}/reject/${id}`);
  return response.data;
};
