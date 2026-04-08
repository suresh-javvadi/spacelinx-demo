import api from "./api";

const apiUrl = "ManufacturingOrderType";
export const fetchWorkOrderType = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createWorkOrderType = async (WorkOrderType) => {
  const response = await api.post(apiUrl, WorkOrderType);
  return response.data;
};

export const updateWorkOrderType = async (id, WorkOrderType) => {
  const response = await api.put(`${apiUrl}/${id}`, WorkOrderType);
  return response.data;
};

export const deleteWorkOrderType = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
