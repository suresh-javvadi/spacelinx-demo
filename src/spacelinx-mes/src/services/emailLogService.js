import api from "./api";

/**
 * Fetch all email logs
 */
export const fetchEmailLogs = async () => {
  const response = await api.get("/EmailLog/email-logs");
  return response.data;
};
