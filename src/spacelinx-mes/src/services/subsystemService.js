import api from "./api";

const apiUrl = "Subsystem";

export const fetchSubsystems = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchSubsystemsLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createSubsystem = async (subsystem) => {
  const response = await api.post(`${apiUrl}`, subsystem);
  return response.data;
};
export const updateSubsystem = async (id, subsystem) => {
  const response = await api.put(`${apiUrl}/${id}`, subsystem);
  return response.data;
};
