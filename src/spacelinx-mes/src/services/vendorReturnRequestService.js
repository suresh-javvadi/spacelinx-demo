import api from "./api";

const apiUrl = "VendorReturnRequest";

export const fetchVendorReturnRequest = async () => {
  const response = await api.get(`${apiUrl}`);
  return response.data;
};
export const fetchVendorReturnRequestWithUser = async () => {
  const response = await api.get(`${apiUrl}/vendor-return-with-user`);
  return response.data;
};
export const fetchVendorReturnRequestById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};
export const createVendorReturnRequest = async (VendorData) => {
  const response = await api.post(
    `${apiUrl}/vendor-return-details`,
    VendorData,
  );
  return response.data;
};
export const updateVendorReturnRequestById = async (id, data) => {
  const response = await api.put(`${apiUrl}/vendor-return-update/${id}`, data);
  return response.data;
};
export const submitVendorReturn = async (id) => {
  const response = await api.put(`${apiUrl}/submit/${id}`);
  return response.data;
};

export const approveVendorReturnRequest = async (id) => {
  const response = await api.put(`${apiUrl}/approval/${id}`);
  return response.data;
};
export const rejectVendorReturnRequest = async (id) => {
  const response = await api.put(`${apiUrl}/reject/${id}`);
  return response.data;
};
