import api from "./api";

const apiUrl = "currency";
export const fetchCurrencies = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchCurrencyLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
