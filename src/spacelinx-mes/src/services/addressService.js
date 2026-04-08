import api from "./api";

const apiUrl = "/Address";
export const fetchAddress = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchAddressLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
