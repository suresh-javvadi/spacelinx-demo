import api from "./api";

const apiUrl = "Permission";

export const fetchPermissions = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchPermissionsLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createPermission = async (permission) => {
  const response = await api.post(apiUrl, permission);
  return response.data;
};
export const updatePermission = async (id, name) => {
  const response = await api.put(
    `${apiUrl}/permission-update/${id}?permissionName=${name}`
  );
  return response.data;
};
export const deletePermission = async (name) => {
  const response = await api.delete(`${apiUrl}/permission-delete/${name}`);
  return response.data;
};
