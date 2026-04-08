import api from "./api";

const apiUrl = "Customer";

export const fetchCustomerLookUp = async () => {
  const response = await api.get(`${apiUrl}/LookUp`);
  return response.data;
};
