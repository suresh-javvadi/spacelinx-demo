import api from "./api";

const apiUrl = "machinetype";
export const fetchMachineTypes = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchMachineTypesLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createMachineType = async (machineType) => {
  const response = await api.post(apiUrl, machineType);
  return response.data;
};

export const updateMachineType = async (id, machineType) => {
  const response = await api.put(`${apiUrl}/${id}`, machineType);
  return response.data;
};

export const deleteMachineType = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
