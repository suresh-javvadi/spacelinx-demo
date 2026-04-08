import api from "./api";

const apiUrl = "RolePermission";

export const fetchRolePermissions = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchRolePermissionById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchRolePermissionByRoleId = async (roleId) => {
  const response = await api.get(`${apiUrl}/role/${roleId}`);
  return response.data;
};
export const createRolePermission = async (rolePermission) => {
  const response = await api.post(apiUrl, rolePermission);
  return response.data;
};

export const deleteRolePermission = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const updateRolePermission = async (id, updatedRolePermission) => {
  const response = await api.put(`${apiUrl}/${id}`, updatedRolePermission);
  return response.data;
};

export const activateRolePermission = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/Activate`);
  return response.data;
};

export const deactivateRolePermission = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/DeActivate`);
  return response.data;
};
