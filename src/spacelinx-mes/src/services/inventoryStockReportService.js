import api from "./api";

const apiUrl = "InventoryStockReport";

export const fetchInventoryStockReport = async ({ from, to, partId }) => {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  if (partId) params.append("partId", partId);

  const response = await api.get(`${apiUrl}/stock-report?${params.toString()}`);
  return response.data;
};
