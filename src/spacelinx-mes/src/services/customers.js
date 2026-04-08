import api from "./api";

const apiUrl = "customer";

export const fetchCustomers = async () => {
  const response = await api.get("company/customers");
  return response.data;
};
