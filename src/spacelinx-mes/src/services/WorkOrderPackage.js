import api from "./api";

const apiUrl = "WorkPackage";
export const fetchWorkPackage = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchWorkPackageWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchMWorkOrderWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const createWorkPackage = async (WorkOrder) => {
  const response = await api.post(apiUrl, WorkOrder);
  return response.data;
};

export const updateWorkPackage = async (id, workPackage) => {
  const response = await api.put(`${apiUrl}/${id}`, workPackage);
  return response.data;
};
export const unAssignKit = async (id) => {
  const response = await api.put(`WorkOrder/unassign-kit/${id}`);
  return response.data;
};
export const assignKit = async (workOrderId, KitId) => {
  const response = await api.put(
    `WorkOrder/${workOrderId}/assign-kit/${KitId}`
  );
  return response.data;
};
export const deleteWorkPackage = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchGetBuildWorkOrders = async (buildId) => {
  const response = await api.get(
    `${apiUrl}/GetBuildManufacturingOrders?buildId=${buildId}`
  );
  return response.data;
};
