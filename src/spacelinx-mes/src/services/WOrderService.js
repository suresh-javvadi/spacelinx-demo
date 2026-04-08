import api from "./api";

const apiUrl = "WorkOrder";
export const fetchWorkOrderWithNoDependency = async () => {
  const response = await api.get(`${apiUrl}`);
  return response.data;
};
export const fetchWorkOrder = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchWorkOrderWithPackageId = async (id) => {
  const response = await api.get(`${apiUrl}/work-package/${id}`);
  return response.data;
};
export const updateWorkOrder = async (id, updateData) => {
  const response = await api.put(`${apiUrl}/${id}`, updateData);
  return response.data;
};
export const fetchWorkOrderStepStats = async (stepId, workOrderId) => {
  const response = await api.get(
    `WorkOrderGuides/WorkOrderStep/Stats/${stepId}/${workOrderId}`
  );
  return response.data;
};
export const fetchWorkOrderWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchWorkOrderDetailsById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};
export const fetchWorkOrderSteps = async (id) => {
  const response = await api.get(`/WorkOrderStep`);
  return response.data;
};
export const createWorkOrderStepResponse = async (id) => {
  const response = await api.post(`/WorkOrderStep/${id}`);
  return response.data;
};
export const createWorkOrderStepTaskResponseAndComplete = async (
  updatedTask
) => {
  const response = await api.post("/WorkOrderTask/complete", updatedTask);
  return response.data;
};
export const updateWorkOrderTask = async (id, updatedTask) => {
  const response = await api.put(`/WorkOrderTask/${id}`, updatedTask);
  return response.data;
};
export const fetchWorkOrderStepTasks = async () => {
  const response = await api.get(`WorkOrderTask`);
  return response.data;
};
export const workOrderStepTaskComplete = async (
  workOrderTaskId,
  workOrderId,
  taskComplete
) => {
  const response = await api.post(
    `WorkOrderGuides/Tasks/CompleteTask/${workOrderTaskId}/${workOrderId}`,
    taskComplete
  );
  return response.data;
};
export const createSubWorkOrder = async (SubWorkOrder) => {
  const response = await api.post(apiUrl, SubWorkOrder);
  return response.data;
};
export const updateConfirmTechnician = async (workOrderId, technicianId) => {
  const response = await api.put(
    `${apiUrl}/${workOrderId}/technician/${technicianId}`
  );
  return response.data;
};
export const updateStepTimeOnCompleteTask = async (stepId, capturedTime) => {
  const response = await api.put(
    `WorkOrderGuides/Steps/CapturedTime/${stepId}?seconds=${capturedTime}`
  );
  return response.data;
};
export const updateAssignKit = async (id, kitId) => {
  const response = await api.put(`${apiUrl}/AssignKit?id=${id}&kitId=${kitId}`);
  return response.data;
};
export const updateSubWorkOrder = async (id, SubWorkOrder) => {
  const response = await api.put(`${apiUrl}/${id}`, SubWorkOrder);
  return response.data;
};
export const startWorkOrder = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/start`);
  return response.data;
};
export const completeWorkOrder = async (id) => {
  const response = await api.put(`${apiUrl}/${id}/complete`);
  return response.data;
};
export const fetchWorkOrderStepWithWOIdAndGuideStepId = async (
  workOrderId,
  guideStepId
) => {
  const response = await api.get(
    `WorkOrderStep/workOrder/${workOrderId}/guideStep/${guideStepId}`
  );
  return response.data;
};
export const deleteSubWorkOrder = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const createWorkOrderStep = async (stepData) => {
  const response = await api.post(`WorkOrderStep`, stepData);
  return response.data;
};
export const workOrderStepComplete = async (workOrderStepId, comment) => {
  const response = await api.put(
    `WorkOrderStep/${workOrderStepId}/completestep?comment=${comment}`
  );
  return response.data;
};
export const workOrderStepCapturedTime = async (workOrderStepId, time) => {
  const response = await api.put(
    `WorkOrderStep/${workOrderStepId}/capturetime?capturedTimeInSeconds=${time}`
  );
  return response.data;
};
export const workOrderStepUpdate = async (workOrderStepId, stepData) => {
  const response = await api.put(`WorkOrderStep/${workOrderStepId}`, stepData);
  return response.data;
};
export const updatePictureTaskImage = async (taskId, imageFile) => {
  const response = await api.put(
    `WorkOrderTask/task-picture-update/${taskId}/complete`,
    imageFile
  );
  return response.data;
};
export const deletePictureTaskImage = async (taskId) => {
  const response = await api.delete(`WorkOrderTask/picture-task/${taskId}`);
  return response.data;
};
export const fetchWorkOrderStepsWithId = async (id) => {
  const response = await api.get(`${apiUrl}/work-order-guide-steps-view/${id}`);
  return response.data;
};
export const fetchWorkOrderWithPart = async (partId) => {
  const response = await api.get(`${apiUrl}/get-by-part/${partId}`);
  return response.data;
};
export const fetchWorkOrderByPartIdAndProductId = async (productId, partId) => {
  const response = await api.get(
    `${apiUrl}/product/${productId}/part/${partId}`
  );
  return response.data;
};
export const resetWorkorder = async (WorkOrderId) => {
  const response = await api.post(`${apiUrl}/Reset-Work-Order/${WorkOrderId}`);
  return response.data;
};
export const fetchWorkordersLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
