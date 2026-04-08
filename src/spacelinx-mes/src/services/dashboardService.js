import api from "./api";

const apiUrl = "Dashboard";

export const fetchMasterDataCount = async () => {
  const response = await api.get(`${apiUrl}/MasterData-count`);
  return response.data;
};
