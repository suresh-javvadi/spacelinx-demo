import api from "./api";

const apiUrl = "EBom";
export const fetchChildParts = async (id) => {
  const response = await api.get(`${apiUrl}/part/${id}`);
  return response.data;
};
export const createNewEBom = async (ChildPart) => {
  const response = await api.post(apiUrl, ChildPart);
  return response;
};
export const updateEBom = async (id, updatedChild) => {
  const response = await api.put(`${apiUrl}/${id}`, updatedChild);
  return response;
};
export const deleteEBom = async (eBomId) => {
  const response = await api.delete(`${apiUrl}/${eBomId}`);
  return response;
};
export const createBom = async (partId, parts) => {
  const response = await api.post(
    `${apiUrl}/create-bom?PartId=${partId}`,
    parts
  );
  return response;
};
export const cloneBOM = async (partId, newPartId) => {
  const response = await api.post(`${apiUrl}/clone/${partId}/${newPartId}`);
  return response;
};
export const fetchFullBOMConsolidated = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/bom/full/consolidated`);
  return response.data;
};

export const fetchLocationViewBOM = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/bom/full/list`);
  return response.data;
};
export const fetchSubsystemViewBOM = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/bom/full/by-subsystem`);
  return response.data;
};
export const fetchLocationView = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/bom/full/by-location`);
  return response.data;
};
