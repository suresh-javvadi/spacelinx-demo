import api from "./api";

const apiUrl = "machine";
export const fetchMachines = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchMachinesLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const fetchMachineWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const createMachine = async (machine) => {
  const response = await api.post(apiUrl, machine);
  return response.data;
};

export const updateMachine = async (id, machine) => {
  const response = await api.put(`${apiUrl}/${id}`, machine);
  return response.data;
};

export const deleteMachine = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
