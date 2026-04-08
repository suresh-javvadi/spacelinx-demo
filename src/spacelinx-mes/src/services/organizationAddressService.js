import api from "./api";

const apiUrl = "OrganizationAddress";

export const fetchAllOrganizationAddressById = async (OrganizationId) => {
  const response = await api.get(`${apiUrl}/by-organization/${OrganizationId}`);
  return response.data;
};

export const createOrganizationAddress = async (Organization, id) => {
  const response = await api.post(
    `${apiUrl}/organization-address?organizationId=${id}`,
    Organization
  );
  return response.data;
};

export const updateOrganizationAddress = async (id, Organization) => {
  const response = await api.put(
    `${apiUrl}/organization-address/${id}`,
    Organization
  );
  return response.data;
};

export const deleteOrganizationAddress = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
