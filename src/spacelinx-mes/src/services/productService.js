import api from "./api";

const apiUrl = "Product";
export const fetchProduct = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const createProduct = async (product) => {
  const response = await api.post(apiUrl, product);
  return response.data;
};

export const createProductWithImage = async (product) => {
  const response = await api.post(`${apiUrl}/image`, product);
  return response.data;
};

export const fetchPlatformLookUp = async () => {
  const response = await api.get(`Platform/Lookup`);
  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`${apiUrl}/${id}`, product);
  return response.data;
};
export const updateProductImage = async (id, imageFile) => {
  const response = await api.put(`${apiUrl}/picture-upload/${id}`, imageFile);
  return response.data;
};
export const editProductImage = async (id, imageFile) => {
  const response = await api.put(`${apiUrl}/picture-upload/${id}`, imageFile);
  return response.data;
};
export const deleteProduct = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};
export const fetchProductsLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
