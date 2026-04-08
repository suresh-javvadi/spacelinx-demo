import api from "./api";

const apiUrl = "/contact";
export const fetchContact = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchContactLookup = async () => {
  const response = await api.get(`${apiUrl}/Lookup`);
  return response.data;
};
export const createCompanyContact = async (contactData) => {
  const response = await api.post(
    `${apiUrl}/company-contact?companyId=${contactData.id}`,
    contactData
  );
  return response.data;
};
export const UpdateCompanyContact = async (id, contactData) => {
  const response = await api.put(
    `${apiUrl}/company-contact/${id}`,
    contactData
  );
  return response.data;
};
