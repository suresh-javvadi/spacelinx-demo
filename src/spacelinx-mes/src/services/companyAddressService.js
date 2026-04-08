import api from "./api";

const apiUrl = "CompanyAddress";

export const fetchCompanyAddressById = async (companyId) => {
  const response = await api.get(`${apiUrl}/by-company/${companyId}`);
  return response.data;
};
export const createCompanyAddress = async (address, id) => {
  const response = await api.post(
    `Address/company-address?companyId=${id}`,
    address,
    id
  );
  return response.data;
};

export const updateCompanyAddressByCompanyId = async (id, address) => {
  const response = await api.put(`Address/company-address/${id}`, address);
  return response.data;
};
export const deleteCompanyAddress = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
