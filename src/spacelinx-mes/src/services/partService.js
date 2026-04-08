import api from "./api";

const apiUrl = "Part";

export const fetchParts = async () => {
  const response = await api.get(apiUrl);
  return response.data;
};

export const fetchPartsLookUp = async () => {
  const response = await api.get(`${apiUrl}/LookUp`);
  return response.data;
};

export const fetchHasBomPartsLookUp = async () => {
  const response = await api.get(`${apiUrl}/LookUp-hasBom`);
  return response.data;
};

export const fetchAllParentParts = async () => {
  const response = await api.get(`${apiUrl}/Parent-Parts`);
  return response.data;
};

export const fetchParentPartsWithoutGuide = async () => {
  const response = await api.get(`${apiUrl}/parent-parts-without-guides`);
  return response.data;
};

export const fetchPartWithPartId = async (id) => {
  const response = await api.get(`${apiUrl}/${id}`);
  return response.data;
};

export const createPart = async (part) => {
  const response = await api.post(apiUrl, part);
  return response.data;
};

export const createPartItem = async (part) => {
  const response = await api.post(`${apiUrl}/Item`, part);
  return response.data;
};

export const updatePart = async (id, part) => {
  const response = await api.put(`${apiUrl}/${id}`, part);
  return response.data;
};

export const updatePartwithImage = async (id, part) => {
  const response = await api.put(`${apiUrl}/image-upload/${id}`, part);
  return response.data;
};

export const updateChildPartQuantity = async (
  parentPartId,
  childPartId,
  quantity
) => {
  const response = await api.put(
    `${apiUrl}/${parentPartId}/${childPartId}?quantity=${quantity}`
  );
  return response.data;
};

export const deletePart = async (id) => {
  const response = await api.delete(`${apiUrl}/${id}`);
  return response.data;
};

export const fetchEbom = async () => {
  const response = await api.get(`Ebom`);
  return response.data;
};
export const fetchEbomWithPartId = async (partId) => {
  const response = await api.get(`Ebom/part/${partId}`);
  return response.data;
};

export const fetchGetGuide = async (partId) => {
  const response = await api.get(`Guide/${partId}/part`);
  return response.data;
};

export const fetchGetChildGuides = async (guideId) => {
  const response = await api.get(`${apiUrl}/GetChildGuides?id=${guideId}`);
  return response.data;
};

export const fetchPartsWithoutGuide = async () => {
  const response = await api.get(`${apiUrl}/parts-without-guides`);
  return response.data;
};

export const fetchPartNumberSequence = async (number) => {
  const response = await api.get(
    `${apiUrl}/part-number-sequence?sequence=${number}`
  );
  return response.data;
};

export const fetchPartWithStatus = async (status) => {
  const response = await api.get(`${apiUrl}/Status?status=${status}`);
  return response.data;
};
export const fetchReleaseAndDraftsParts = async () => {
  const response = await api.get(`${apiUrl}/DraftOrRelease`);
  return response.data;
};
export const fetchUniqueParts = async () => {
  const response = await api.get(`${apiUrl}/unique-parts`);
  return response.data;
};
export const fetchPartVersions = async (number) => {
  const response = await api.get(`${apiUrl}/versions?suffix=${number}`);
  return response.data;
};
export const fetchMakePartsWithEBOM = async () => {
  const response = await api.get(`${apiUrl}/make/with-ebom`);
  return response.data;
};
export const fetchMakePartsWithOutEBOM = async () => {
  const response = await api.get(`${apiUrl}/make/without-ebom`);
  return response.data;
};
export const fetchDraftMakePartsWithOutEBOM = async () => {
  const response = await api.get(`${apiUrl}/draft/make/without-ebom`);
  return response.data;
};
export const fetchParentPartWithPartId = async (partNumber) => {
  const response = await api.get(`${apiUrl}/ebom/parents/${partNumber}`);
  return response.data;
};
export const fetchUniquePartsWithOutobsolete = async () => {
  const response = await api.get(
    `${apiUrl}/unique-parts/without-obsolete-parts`
  );
  return response.data;
};
export const fetchPartsWithGoodsAndServices = async () => {
  const response = await api.get(`${apiUrl}/parts-with-goods-and-services`);
  return response.data;
};
export const fetchUniqueReleaseParts = async () => {
  const response = await api.get(`${apiUrl}/unique-parts-Release`);
  return response.data;
};
export const revisePartById = async (id) => {
  const response = await api.post(`${apiUrl}/part-revise/${id}`);
  return response.data;
};
export const fetchDraftPartsWithOutParent = async () => {
  const response = await api.get(`${apiUrl}/draft-parts-without-parent`);
  return response.data;
};
export const fetchParentPartsInDraftOrRelease = async () => {
  const response = await api.get(`${apiUrl}/DraftOrRelease-Parent-Parts`);
  return response.data;
};
export const createInventoryItem = async (itemData) => {
  const response = await api.post(`${apiUrl}/Item`, itemData);
  return response.data;
};
export const fetchAllBuyParts = async () => {
  const response = await api.get(`${apiUrl}/buy-parts`);
  return response.data;
};
export const fetchPartHierarchy = async (partId, maxBomLevel) => {
  const response = await api.get(`Ebom/bom-hierarchy/${partId}/${maxBomLevel}`);
  return response.data;
};
export const fetchEntirePartHierarchy = async (partId) => {
  const response = await api.get(`Ebom/${partId}/bom/full`);
  return response.data;
};
export const exportAsExcel = async (partId) => {
  const response = await api.get(`Ebom/${partId}/bom/full/excel`, {
    responseType: "blob",
  });
  return response;
};
export const exportAsCSV = async (partId) => {
  const response = await api.get(`Ebom/${partId}/bom/full/csv`, {
    responseType: "blob",
  });
  return response;
};
export const ebomParentsHierarchyWithMaxLevel = async (partId, maxLevel) => {
  const response = await api.get(`Ebom/${partId}/parents/level/${maxLevel}`, {
    responseType: "json", // ensure axios parses JSON
  });
  return response.data;
};

export const ebomParentsEntireHierarchy = async (partId) => {
  const response = await api.get(`Ebom/${partId}/parents/full`, {
    responseType: "json", // ensure axios parses JSON
  });
  return response.data;
};

export const fetchManufacturers = async () => {
  const response = await api.get(`${apiUrl}/manufacturers`);
  return response.data;
};

export const deletePartById = async (partId) => {
  const response = await api.delete(`${apiUrl}/delete-part/${partId}`);
  return response.data;
};
