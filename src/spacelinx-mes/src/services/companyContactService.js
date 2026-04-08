import api from "./api";

const apiUrl = "CompanyContact";

export const fetchCompanyContactByVendorId = async (id) => {
  const response = await api.get(`${apiUrl}/by-company/${id}`);
  return response.data;
};
export const deleteCompanyContact = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchCompanyContact = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
