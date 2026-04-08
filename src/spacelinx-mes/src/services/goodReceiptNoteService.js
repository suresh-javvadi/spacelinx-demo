import api from "./api";

const apiUrl = "GoodsReceiptNote";

export const fetchGoodReceiptNotes = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchGoodReceiptNoteswithUser = async () => {
  const response = await api.get(`${apiUrl}/grn-with-user`);
  return response.data;
};

export const fetchGoodReceiptNoteById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchGoodReceiptNoteLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};

export const createGoodReceiptNote = async (goodReceiptNote) => {
  const response = await api.post(apiUrl, goodReceiptNote);
  return response.data;
};

export const createGoodReceiptNoteWithLineItems = async (payload) => {
  const response = await api.post(`${apiUrl}/grn-with-line-items`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateGoodReceiptNote = async (id, goodReceiptNote) => {
  const response = await api.put(
    `${apiUrl}/grn-details-update/${id}`,
    goodReceiptNote,
  );
  return response.data;
};

export const deleteGoodReceiptNote = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchGRNDetailsById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};

export const fetchGRNsByPOId = async (id) => {
  const response = await api.get(`${apiUrl}/by-purchase-order/${id}`);
  return response.data;
};
export const qualityCheckGRN = async (id) => {
  const response = await api.put(`${apiUrl}/quality-checked/${id}`);
  return response.data;
};
export const rejectGRN = async (id) => {
  const response = await api.put(`${apiUrl}/reject/${id}`);
  return response.data;
};
export const qualityCheckGRNItems = async (data) => {
  const response = await api.put(`${apiUrl}/grn-line-item-qc`, data);
  return response.data;
};

export const acceptLineItems = async (data) => {
  const response = await api.put(`${apiUrl}/accept-line-items`, data);
  return response.data;
};
