import api from "./api";

const apiUrl = "RoleFilter";

export const fetchRoleFilters = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchRoleFilterById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchRoleFilterByRoleId = async (roleId) => {
  const response = await api.get(`${apiUrl}/by-role/${roleId}`);
  return response.data;
};

export const createRoleFilter = async (roleFilter) => {
  const response = await api.post(apiUrl, roleFilter);
  return response.data;
};

export const updateRoleFilter = async (id, updatedRoleFilter) => {
  const response = await api.put(`${apiUrl}/${id}`, updatedRoleFilter);
  return response.data;
};

export const deleteRoleFilter = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const activateRoleFilter = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/Activate`);
  return response.data;
};

export const deactivateRoleFilter = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/DeActivate`);
  return response.data;
};
