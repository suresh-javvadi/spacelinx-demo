import api from "./api";

const apiUrl = "Guide";
export const fetchGuide = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchUniqueGuides = async () => {
  const response = await api.get(`${apiUrl}/unique-guides`);
  return response.data;
};
export const fetchGuideWithPartId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/part`);
  return response.data;
};
export const fetchPartsHavingGuide = async () => {
  const response = await api.get(`${apiUrl}/partshavingguide`);
  return response.data;
};
export const fetchGuidesWithNumber = async (number) => {
  const response = await api.get(`${apiUrl}/${number}/version`);
  return response.data;
};
export const fetchGuideVersionsWithPartId = async (id) => {
  const response = await api.get(`${apiUrl}/versions/part/${id}`);
  return response.data;
};
export const fetchGuideDetailswithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}/details`);
  return response.data;
};
export const fetchGuideWithId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};
export const createGuide = async (Guide) => {
  const response = await api.post(apiUrl, Guide);
  return response.data;
};
export const createDraftGuide = async (id) => {
  const response = await api.post(`${apiUrl}/draftguide/${id}`);
  return response.data;
};
export const cloneGuide = async (guideId, newPartId) => {
  const response = await api.post(`${apiUrl}/clone/${guideId}/${newPartId}`);
  return response.data;
};
export const updateGuide = async (id, Guide) => {
  const response = await api.put(`${apiUrl}/${id}`, Guide);
  return response.data;
};

export const deleteGuide = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const guidePublish = async (id) => {
  const response = await api.put(`${apiUrl}/publish/${id}`);
  return response.data;
};
export const fetchGuideMBom = async (guideId) => {
  const response = await api.get(`${apiUrl}/mbom/${guideId}`);
  return response.data;
};
export const fetchGuideMBomWithGuideId = async (guideId) => {
  const response = await api.get(`${apiUrl}/${guideId}/mbom`);
  return response.data;
};
export const PartsHavingPublishedGuide = async () => {
  const response = await api.get(`${apiUrl}/partshavingpublishedguide`);
  return response.data;
};
export const PublishedGuideVersionsWithPartId = async (id) => {
  const response = await api.get(`${apiUrl}/publishedversions/part/${id}`);
  return response.data;
};
export const guideCheckOut = async (guideId) => {
  const response = await api.put(`${apiUrl}/${guideId}/check-out`);
  return response.data;
};
export const guideForceCheckOut = async (guideId) => {
  const response = await api.put(`${apiUrl}/${guideId}/force-check-out`);
  return response.data;
};
export const guideCheckIn = async (guideId) => {
  const response = await api.put(`${apiUrl}/${guideId}/check-in`);
  return response.data;
};
export const guideWeight = async (guideId) => {
  const response = await api.get(`${apiUrl}/${guideId}/weight`);
  return response.data;
};

export const fetchGuidesLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const guidePublishWithValidations = async (id) => {
  const response = await api.put(`${apiUrl}/guidepublish/${id}`);
  return response.data;
};
