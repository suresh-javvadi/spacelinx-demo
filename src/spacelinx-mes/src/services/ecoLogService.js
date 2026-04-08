import api from "./api";

const apiUrl = "EcoLog/ECO";

export const fetchEcoLOGByECOId = async (ECOId) => {
  const response = await api.get(`${apiUrl}/${ECOId}`);
  return response.data;
};
