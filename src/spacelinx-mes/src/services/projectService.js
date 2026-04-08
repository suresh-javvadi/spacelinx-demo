import api from "./api";

const apiUrl = "Project";

export const fetchProject = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchProjectById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createProject = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateProject = async (id, project) => {
  const response = await api.put(`${apiUrl}/${id}`, project);
  return response.data;
};

export const fetchProjectsLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
