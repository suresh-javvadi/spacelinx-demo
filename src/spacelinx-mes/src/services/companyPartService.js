import api from "./api";

const apiUrl = "CompanyPart";

export const createCompanyPart = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const fetchCompanyPartsById = async (id) => {
  const response = await api.get(`${apiUrl}/by-company/${id}`);
  return response.data;
};

export const deleteCompanyPart = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
