import api from "./api";

// Read-only platform audit trail (audit.change_log) — gated by AUDIT.VIEW.
const apiUrl = "Audit";

const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""));

// General search with optional filters + paging.
export const searchAudit = async ({
  entityType,
  actor,
  operation,
  from,
  to,
  skip = 0,
  take = 100,
} = {}) => {
  const params = clean({ entityType, actor, operation, from, to, skip, take });
  const response = await api.get(`${apiUrl}/search`, { params });
  return response.data;
};

// History of a single record ("who changed this row").
export const fetchRecordHistory = async (entityType, entityId, take = 100) => {
  const response = await api.get(`${apiUrl}/record`, {
    params: clean({ entityType, entityId, take }),
  });
  return response.data;
};

// Everything a user did in a window.
export const fetchActorActivity = async (actor, from, to, take = 100) => {
  const response = await api.get(`${apiUrl}/activity`, {
    params: clean({ actor, from, to, take }),
  });
  return response.data;
};

// All changes under one request correlation id.
export const fetchByCorrelation = async (correlationId, take = 100) => {
  const response = await api.get(
    `${apiUrl}/correlation/${encodeURIComponent(correlationId)}`,
    { params: { take } },
  );
  return response.data;
};
