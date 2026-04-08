import api from "./api";

const apiUrl = "Guidetype";
export const fetchGuideType = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createGuideType = async (GuideType) => {
  const response = await api.post(apiUrl, GuideType);
  return response.data;
};

export const updateGuideType = async (id, GuideType) => {
  const response = await api.put(`${apiUrl}/${id}`, GuideType);
  return response.data;
};

export const deleteGuideType = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
