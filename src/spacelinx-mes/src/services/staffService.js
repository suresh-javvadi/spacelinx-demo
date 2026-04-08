import api from "./api";

const apiUrl = "Staff";

export const fetchStaff = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const createStaff = async (staff) => {
  const response = await api.post(`${apiUrl}`, staff);
  return response.data;
};
export const createStaffWithImage = async (staff) => {
  const response = await api.post(`${apiUrl}/image`, staff);
  return response.data;
};
export const updateStaff = async (id, staff) => {
  const response = await api.put(`${apiUrl}/${id}`, staff);
  return response.data;
};
export const updateStaffWithImage = async (id, staff) => {
  const response = await api.put(`${apiUrl}/image/${id}`, staff);
  return response.data;
};

export const deleteStaff = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchStaffByOrgId = async (id) => {
  const response = await api.get(`${apiUrl}/by-organization/${id}`);
  return response.data;
};
export const fetchStaffLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
