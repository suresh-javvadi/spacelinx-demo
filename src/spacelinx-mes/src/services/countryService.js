import api from "./api";

const apiUrl = "/country";
export const fetchCountry = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchCountryLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
