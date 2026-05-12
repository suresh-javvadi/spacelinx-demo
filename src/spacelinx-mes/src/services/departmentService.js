import api from "./api";

const apiUrl = "Department";

export const fetchDepartments = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchDepartmentById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchDepartmentLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const createDepartment = async (department) => {
  const response = await api.post(apiUrl, department);
  return response.data;
};

export const updateDepartment = async (id, department) => {
  const response = await api.put(`${apiUrl}/${id}`, department);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
