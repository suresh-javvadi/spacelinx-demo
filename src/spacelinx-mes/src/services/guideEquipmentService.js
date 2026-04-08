import api from "./api";

const apiUrl = "GuideStepEquipment";
export const fetchGuideEquipment = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchGuideEquipmentWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchGuideEquipmentWithStepId = async (id) => {
  const response = await api.get(`${apiUrl}/step/${id}`);
  return response.data;
};

export const fetchGuideEquipmentWithGuideId = async (id) => {
  const response = await api.get(`${apiUrl}/guide/${id}`);
  return response.data;
};
export const createGuideEquipment = async (equipment) => {
  const response = await api.post(apiUrl, equipment);
  return response.data;
};

export const updateGuideEquipment = async (id, equipment) => {
  const response = await api.put(`${apiUrl}/${id}`, equipment);
  return response.data;
};

export const deleteGuideEquipment = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
