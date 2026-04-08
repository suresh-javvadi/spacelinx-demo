import api from "./api";

const apiUrl = "PaymentTerm";

export const fetchPaymentTerms = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchPaymentTermById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchPaymentTermLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};

export const createPaymentTerm = async (paymentTerm) => {
  const response = await api.post(apiUrl, paymentTerm);
  return response.data;
};

export const updatePaymentTerm = async (id, paymentTerm) => {
  const response = await api.put(`${apiUrl}/${id}`, paymentTerm);
  return response.data;
};

export const deletePaymentTerm = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
