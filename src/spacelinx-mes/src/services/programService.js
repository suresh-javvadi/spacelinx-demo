import api from "./api";

const apiUrl = "Program";

export const fetchProgram = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

// Correct for fetching linked projects for a program
export const fetchLinkedProjects = async (programId) => {
  const response = await api.get(`${apiUrl}/projects/${programId}`);
  return response.data;
};

export const fetchProgramLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const createProgram = async (program) => {
  const response = await api.post(apiUrl, program);
  return response.data;
};

export const updateProgram = async (id, program) => {
  const response = await api.put(`${apiUrl}/${id}`, program);
  return response.data;
};

export const deleteProgram = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
