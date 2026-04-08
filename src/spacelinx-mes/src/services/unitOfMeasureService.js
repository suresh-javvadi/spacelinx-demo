import api from "./api";

const apiUrl = "UnitOfMeasure";
export const fetchUnitOfMeasure = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchUnitOfMeasureLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createUnitOfMeasure = async (uom) => {
  const response = await api.post(apiUrl, uom);
  return response.data;
};

export const updateUnitOfMeasure = async (id, uom) => {
  const response = await api.put(`${apiUrl}/${id}`, uom);
  return response.data;
};

export const deleteUnitOfMeasure = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
