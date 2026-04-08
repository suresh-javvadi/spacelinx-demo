import api from "./api";

const apiUrl = "User";
export const fetchUsers = async () => {
  const response = await api.get(`${apiUrl}/with-roles`);
  return response.data;
};
export const fetchUsersByRoleId = async (roleId) => {
  const response = await api.get(`${apiUrl}/role/${roleId}`);
  return response.data;
};
export const createUser = async (user) => {
  const response = await api.post(`${apiUrl}/with-roles`, user);
  return response.data;
};

export const updateUser = async (id, user) => {
  const response = await api.put(`${apiUrl}/with-roles/${id}`, user);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const deleteUserFromApp = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}/application/by-name`);
  return response.data;
};

export const updateactivate = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/activate`);
  return response.data;
};
export const updatedeactivate = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/deactivate`);
  return response.data;
};

export const fetchUsersByAppName = async () => {
  const response = await api.get(`${apiUrl}/app-name`);
  return response.data;
};
export const fetchUserLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
