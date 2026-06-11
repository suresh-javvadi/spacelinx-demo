import api from "./api";

const apiUrl = "GuideStep";
export const fetchGuideSteps = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createGuideStep = async (step) => {
  const response = await api.post(apiUrl, step);
  return response.data;
};
export const createGuideStepBetweenSteps = async (id, sequence) => {
  const response = await api.post(
    `${apiUrl}/new-step/${id}?newSequence=${sequence}`
  );
  return response.data;
};
export const copyGuideStep = async (id) => {
  const response = await api.post(`${apiUrl}/copy-step/${id}`);

  return response.data;
};
export const updateGuideStep = async (id, step) => {
  const response = await api.put(`${apiUrl}/${id}`, step);
  return response.data;
};

export const updateGuideStepImage = async (id, imageFile) => {
  const response = await api.put(`${apiUrl}/picture-upload/${id}`, imageFile);
  return response.data;
};
export const deleteReorderSteps = async (guideStepId) => {
  const response = await api.post(
    `${apiUrl}/delete-reorder-steps/${guideStepId}`
  );
  return response.data;
};
export const editGuideStepImage = async (id, imageFile) => {
  const response = await api.put(`${apiUrl}/picture-upload/${id}`, imageFile);
  return response.data;
};

export const deleteGuideStep = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const deleteGuideSteps = async (ids) => {
  const response = await api.post(`${apiUrl}/bulk-delete-reorder`, ids);
  return response.data;
};
export const guideStepReOrder = async (id, sequence) => {
  const response = await api.post(
    `${apiUrl}/reorder-step?guideStepId=${id}&newSequence=${sequence}`
  );
  return response.data;
};

export const fetchGuideStepWithGuideId = async (id) => {
  const response = await api.get(`${apiUrl}/guide/${id}`);
  return response.data;
};
export const updateGuideStepVideo = async (id, videoFile) => {
  const response = await api.put(`${apiUrl}/video-upload/${id}`, videoFile);
  return response.data;
};
export const editGuideStepVideo = async (id, videoFile) => {
  const response = await api.put(`${apiUrl}/video-upload/${id}`, videoFile);
  return response.data;
};
