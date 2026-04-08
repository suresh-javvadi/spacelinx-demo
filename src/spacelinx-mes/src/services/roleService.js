import api from "./api";

const apiUrl = "Role";
export const fetchRoles = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createRole = async (role) => {
  const response = await api.post(apiUrl, role);
  return response.data;
};

export const createNewRole = async (role) => {
  const response = await api.post(`${apiUrl}/create-role`, role);
  return response.data;
};

export const updateRole = async (roleId, role) => {
  const response = await api.put(`${apiUrl}/${roleId}`, role);
  return response.data;
};

export const updateRoleWithRole = async (roleId, role) => {
  const response = await api.put(`${apiUrl}/role-update/${roleId}`, role);
  return response.data;
};

export const deleteRole = async (roleId) => {
  const response = await api.delete(`${apiUrl}/${roleId}`);
  return response.data;
};
