import api from "./api";

const apiUrl = "company";

export const fetchCompanies = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchVendors = async () => {
  const response = await api.get("company/vendors");
  return response.data;
};
export const fetchPartners = async () => {
  const response = await api.get("company/partners");
  return response.data;
};
export const fetchVendorById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchCompanyLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};
export const createCompany = async (Vendor) => {
  const response = await api.post(`company`, Vendor);
  return response.data;
};

export const updateCompany = async (id, vendor) => {
  const response = await api.put(`company/${id}`, vendor);
  return response.data;
};

export const deleteCompany = async (id) => {
  const response = await api.delete(`company/${id}`);
  return response.data;
};
