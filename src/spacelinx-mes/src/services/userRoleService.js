import api from "./api";

const apiUrl = "UserRole";

export const fetchUserRoles = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchUserRolesById = async (userRoleId) => {
  const response = await api.get(`${apiUrl}/${userRoleId}`);
  return response.data;
};
export const fetchUserRoleByRoleId = async (roleId) => {
  const response = await api.get(`${apiUrl}/role/${roleId}`);
  return response.data;
};

export const createUserRole = async (userRole) => {
  const response = await api.post(apiUrl, userRole);
  return response.data;
};

export const deleteUserRole = async (userRoleId) => {
  const response = await api.delete(`${apiUrl}/${userRoleId}`);
  return response.data;
};

export const updateUserRole = async (userRoleId, updatedUserRole) => {
  const response = await api.put(`${apiUrl}/${userRoleId}`, updatedUserRole);
  return response.data;
};
export const updateDefaultRole = async (userId, roleId) => {
  const response = await api.put(
    `${apiUrl}/set-is-default/${userId}/${roleId}`
  );
  return response.data;
};
