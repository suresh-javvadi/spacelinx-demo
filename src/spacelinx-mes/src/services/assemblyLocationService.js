import api from "./api";

const apiUrl = "AssemblyLocation";
export const fetchAssemblyLocations = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchAssemblyLocationsLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const fetchAssemblyLocationsById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const createAssemblyLocation = async (assemblyLocation) => {
  const response = await api.post(apiUrl, assemblyLocation);
  return response.data;
};

export const updateAssemblyLocation = async (id, assemblyLocation) => {
  const response = await api.put(`${apiUrl}/${id}`, assemblyLocation);
  return response.data;
};

export const deleteAssemblyLocation = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
