import api from "./api";

const apiUrl = "Organization";

export const fetchAllOrganization = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchAllOrganizationWithAddresses = async () => {
  const response = await api.get(`${apiUrl}/Organization-With-Address`);
  return response.data;
};
export const createOrganization = async (Organization) => {
  const response = await api.post(`${apiUrl}`, Organization);
  return response.data;
};

export const createOrganizationWithImage = async (Organization) => {
  const response = await api.post(`${apiUrl}/image`, Organization);
  return response.data;
};

export const updateOrganization = async (id, Organization) => {
  const response = await api.put(`${apiUrl}/${id}`, Organization);
  return response.data;
};

export const updateOrganizationWithImage = async (id, Organization) => {
  const response = await api.put(`${apiUrl}/image/${id}`, Organization);
  return response.data;
};

export const deleteOrganization = async (id) => {
  const response = await api.delete(`${apiUrl}/organization-${id}`);
  return response.data;
};
