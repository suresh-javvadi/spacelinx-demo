import api from "./api";

const apiUrl = "Item";
export const fetchItems = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchItemsLookUp = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};

export const createItem = async (Item) => {
  const response = await api.post(apiUrl, Item);
  return response.data;
};

export const updateItem = async (id, Item) => {
  const response = await api.put(`${apiUrl}/${id}`, Item);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
