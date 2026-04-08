import api from "./api";
import { saveAs } from "file-saver";
const apiUrl = "BulkUpload";
export const downloadTemplate = async (templateName) => {
  try {
    const response = await api.get(`${apiUrl}/template/${templateName}`, {
      responseType: "blob",
    });
    saveAs(new Blob([response.data]), `${templateName}.xlsx`);
  } catch (error) {
    console.error("Error downloading the template:", error);
  }
};
export const fetchBulkUpload = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};
export const fetchBulkUploadLookup = async () => {
  const response = await api.get(`${apiUrl}/lookup`);
  return response.data;
};

export const uploadData = async (templateName, formData) => {
  try {
    const response = await api.post(
      `${apiUrl}/Import/${templateName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading data:", error);
    throw error;
  }
};
