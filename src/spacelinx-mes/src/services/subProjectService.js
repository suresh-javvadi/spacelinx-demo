import api from "./api";

const apiUrl = "SubProject";

export const fetchSubProjectsByProject = async (projectId) => {
  const response = await api.get(`${apiUrl}/ByProject/${projectId}`);
  return response.data;
};
