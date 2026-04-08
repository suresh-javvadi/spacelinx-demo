import api from "./api";

const apiUrl = "Document";

export const fetchDocuments = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchDocumentsByEntityId = async (id) => {
  const response = await api.get(`${apiUrl}/entity/${id}`);
  return response.data;
};
export const fetchDocumentsByEntityIdWithUsers = async (id) => {
  const response = await api.get(`${apiUrl}/documents-with-users/${id}`);
  return response.data;
};

export const createDocumentWithEntity = async (documentData) => {
  const response = await api.post(`${apiUrl}/upload-documents`, documentData);
  return response.data;
};

export const updateDocument = async (id, updatedData) => {
  const response = await api.put(`${apiUrl}/${id}`, updatedData);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchDocumentById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchDocumentsLookUp = async (query) => {
  const response = await api.get(`${apiUrl}/lookup`, { params: query });
  return response.data;
};

export const fetchActiveDocuments = async () => {
  const response = await api.get(`${apiUrl}/active`);
  return response.data;
};

export const activateDocument = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/activate`);
  return response.data;
};

export const deactivateDocument = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/deactivate`);
  return response.data;
};
export const fetchECOPartsDocuments = async (id) => {
  const response = await api.get(`${apiUrl}/eco/${id}/parts-documents`);
  return response.data;
};
export const fetchRequisitionPartsDocuments = async (id) => {
  const response = await api.get(`${apiUrl}/requisition/${id}/parts-documents`);
  return response.data;
};
export const fetchPOPartsDocuments = async (id) => {
  const response = await api.get(
    `${apiUrl}/purchase-order/${id}/parts-documents`
  );
  return response.data;
};
export const DownloadDocsAsZip = async (ids) => {
  const response = await api.post(`${apiUrl}/download-zip`, ids, {
    responseType: "blob",
  });
  return response.data;
};
