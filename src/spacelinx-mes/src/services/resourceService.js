import api from "./api";

const apiUrl = "Resource";

// Standard CRUD operations
export const fetchResourceAllocations = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchResourceAllocationById = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createResourceAllocation = async (data) => {
  const response = await api.post(apiUrl, data);
  return response.data;
};

export const updateResourceAllocation = async (id, data) => {
  const response = await api.put(`${apiUrl}/${id}`, data);
  return response.data;
};

export const deleteResourceAllocation = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

// Custom endpoints

/**
 * Get allocations for a specific staff member
 */
export const fetchAllocationsByStaff = async (staffId) => {
  const response = await api.get(`${apiUrl}/staff/${staffId}`);
  return response.data;
};

/**
 * Get allocations for a specific project
 */
export const fetchAllocationsByProject = async (projectId) => {
  const response = await api.get(`${apiUrl}/project/${projectId}`);
  return response.data;
};

/**
 * Get workload view for all staff
 */
export const fetchWorkload = async (startDate = null, endDate = null) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = queryString ? `${apiUrl}/workload?${queryString}` : `${apiUrl}/workload`;
  const response = await api.get(url);
  return response.data;
};

/**
 * Get capacity planning data
 */
export const fetchCapacity = async (startDate, endDate, projectId = null) => {
  const params = new URLSearchParams();
  params.append("startDate", startDate);
  params.append("endDate", endDate);
  if (projectId) params.append("projectId", projectId);

  const response = await api.get(`${apiUrl}/capacity?${params}`);
  return response.data;
};

/**
 * Check staff availability
 */
export const fetchStaffAvailability = async (staffId, startDate, endDate) => {
  const params = new URLSearchParams();
  params.append("startDate", startDate);
  params.append("endDate", endDate);

  const response = await api.get(`${apiUrl}/availability/${staffId}?${params}`);
  return response.data;
};
