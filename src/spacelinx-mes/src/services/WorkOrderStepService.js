import api from "./api";

const apiUrl = "WorkOrderStep";
export const fetchWorkOrderStepsWithId = async (workOrderId) => {
  const response = await api.get(`${apiUrl}/workorder/${workOrderId}`);
  return response.data;
};
export const updateWorkOrderTask = async (id) => {
  const response = await api.get(`workorderTask/${id}`);
  return response.data;
};
export const completeWorkOrderTask = async (workOrderTaskId, taskResponse) => {
  const response = await api.put(
    `/WorkOrderTask/complete?workOrderTaskId=${workOrderTaskId}&taskResponse=${taskResponse}`
  );
  return response.data;
};
export const resetWorkorderStep = async (WorkOrderStepId) => {
  const response = await api.put(
    `${apiUrl}/reset-work-order-step/${WorkOrderStepId}`
  );
  return response.data;
};
export const fetchWorkOrderTaskByStepId = async (stepId) => {
  const response = await api.get(`WorkOrderTask/workOrderStep/${stepId}`);
  return response.data;
};
