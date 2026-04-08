import api from "./api";

const apiUrl = "CompanyBankAccount";

export const fetchCompanyBankAccountsByCompanyId = async (id) => {
  const response = await api.get(`${apiUrl}/by-company/${id}`);
  return response.data;
};
export const deleteCompanyBankAccount = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
