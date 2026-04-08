import api from "./api";

const apiUrl = "/Kit";

export const fetchKits = async () => {
  try {
    const response = await api.get(`${apiUrl}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchKitWithId = async (id) => {
  try {
    const response = await api.get(`${apiUrl}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchSerialNumberWithkitId = async (kitId) => {
  try {
    const response = await api.get(`KitSerial/Kit/${kitId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchSerialNumberWithkitIdAndPartId = async (kitId, partid) => {
  try {
    const response = await api.get(`KitSerial/Kit/${kitId}/part/${partid}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchKitBomComments = async () => {
  try {
    const response = await api.get(`KitBomComments`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updatePartSerialNumbers = async (kitId, partid, serialNumbers) => {
  try {
    const response = await api.put(
      `KitSerial/Kit/${kitId}/part/${partid}`,
      serialNumbers
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateSerialNumbersStatusToComsumed = async (ids) => {
  try {
    const response = await api.put(`KitSerial/status/consumed`, ids);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchGuideBomWithKitId = async (kitId) => {
  try {
    const response = await api.get(`Guide/${kitId}/kit-mbom`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateConfirmKit = async (kitId) => {
  try {
    const response = await api.put(`${apiUrl}/${kitId}/confirm-kit`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateKitLocation = async (kitId, locationId) => {
  try {
    const response = await api.put(`${apiUrl}/location/${kitId}/${locationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateChildKitGenealogyLotSerialNumberStatus = async (
  childKitId,
  lotId
) => {
  try {
    const response = await api.put(
      `${apiUrl}/lotStatusUpdate/${childKitId}/${lotId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateChildKitsLocation = async (childKitId, newLocation) => {
  try {
    const response = await api.put(
      `${apiUrl}/AssignLocation?id=${childKitId}`,
      newLocation
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateChildKitGenealogy = async (
  childKitId,
  partId,
  updatedData
) => {
  try {
    const response = await api.put(
      `${apiUrl}/kitDetail/${childKitId}/${partId}`,
      updatedData
    );
  } catch (error) {
    console.error(error);
  }
};
export const assignWorkOrder = async (workOrderId, KitId) => {
  const response = await api.put(
    `WorkOrder/${workOrderId}/assign-kit/${KitId}`
  );
  return response.data;
};
export const unAssignWorkOrder = async (workOrderId) => {
  const response = await api.put(`WorkOrder/unassign-kit/${workOrderId}`);
  return response.data;
};
export const fetchChildofChildKits = async (id) => {
  try {
    const response = await api.get(`${apiUrl}/child/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchChildkitofParts = async (id) => {
  try {
    const response = await api.get(`${apiUrl}/part/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteChildKitsWorkOrder = async (id) => {
  try {
    const response = await api.delete(`${apiUrl}/${id}`);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};
