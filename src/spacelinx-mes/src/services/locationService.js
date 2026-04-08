import api from "./api";

const apiUrl = "location";
export const fetchLocations = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchLocationsLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createLocation = async (location) => {
  const response = await api.post(apiUrl, location);
  return response.data;
};

export const updateLocation = async (id, location) => {
  const response = await api.put(`${apiUrl}/${id}`, location);
  return response.data;
};

export const deleteLocation = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
