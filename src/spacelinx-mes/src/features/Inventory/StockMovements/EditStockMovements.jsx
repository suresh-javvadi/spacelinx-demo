import React, { useContext, useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Divider,
  FormHelperText,
  TextField,
} from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { fetchLocationsLookUp } from "../../../services/locationService";
import {
  fetchStockMovementById,
  createSMWithLineItems,
  submitSMWithLineItems,
  approveStockMovement,
  rejectStockMovement,
} from "../../../services/stockMovementService";
import { fetchInventoryStockByLocation } from "../../../services/inventoryStockService";
import {
  fetchInventoryPartPurchaseHistory,
  fetchInventoryPartWithPrice,
} from "../../../services/inventoryPartService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchUserLookup } from "../../../services/userService";
import Popover from "@mui/material/Popover";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { fetchVendors } from "../../../services/companyService";
import { fetchProjectsLookup } from "../../../services/projectService";
import { fetchSubProjectsByProject } from "../../../services/subProjectService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import dayjs from "dayjs";

const EditStockMovements = ({
  selectedMovement,
  handleClose,
  handleRefresh,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [locationsData, setLocationsData] = useState([]);
  const movementTypes = [
    { id: 2, name: "Reserved" },
    { id: 3, name: "Issued" },
    { id: 4, name: "Consumed" },
    { id: 5, name: "Adjustment" },
  ];
  const [formData, setFormData] = useState({
    movementType: null,
    fromLocation: null,
    bin: null,
    responsiblePerson: null,
    movementDate: "",
    expectedReturnDate: "",
    description: "",
    reason: "",
    department: "",
    project: null,
    subProject: null,
    issuePurpose: null,
    company: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [userData, setUserData] = useState([]);
  const [loadingStaffData, setLoadingStaffData] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [loadingStockData, setLoadingStockData] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedStockItems, setSelectedStockItems] = useState([]);
  const [lineItemErrors, setLineItemErrors] = useState({});
  const [purchaseHistoryCache, setPurchaseHistoryCache] = useState({});
  // In-flight request map to avoid redundant concurrent fetches for the same partId
  const purchaseHistoryInFlight = React.useRef({});

  const getPurchaseHistoryForPart = async (partId) => {
    if (purchaseHistoryCache[partId]) return purchaseHistoryCache[partId];
    // Deduplicate concurrent requests for the same partId
    if (purchaseHistoryInFlight.current[partId]) {
      return purchaseHistoryInFlight.current[partId];
    }
    const request = fetchInventoryPartPurchaseHistory(partId)
      .then((history) => {
        setPurchaseHistoryCache((prev) => ({ ...prev, [partId]: history }));
        delete purchaseHistoryInFlight.current[partId];
        return history;
      })
      .catch((err) => {
        console.error("Failed to fetch purchase history:", err);
        delete purchaseHistoryInFlight.current[partId];
        return [];
      });
    purchaseHistoryInFlight.current[partId] = request;
    return request;
  };
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [subProjects, setSubProjects] = useState([]);
  const [loadingSubProjects, setLoadingSubProjects] = useState(false);
  const [issuePurposes, setIssuePurposes] = useState([]);
  const [loadingIssuePurposes, setLoadingIssuePurposes] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const trackingTypes = [
    { value: "serial", label: "Serial" },
    { value: "batch", label: "Batch" },
    { value: "none", label: "None" },
  ];

  const adjustmentTypes = ["Increase", "Decrease"];

  const isDraft = selectedMovement?.status === "Draft";
  const isPendingApproval = selectedMovement?.status === "PendingApproval";

  // Fetch lookup data on mount
  useEffect(() => {
    fetchLocations();
    fetchStaffData();
    fetchDepartments();
    fetchProjectsData();
    fetchIssuePurposes();
    fetchCompanies();
  }, []);

  // Fetch movement details when selectedMovement changes
  useEffect(() => {
    if (selectedMovement?.stockMovementId) {
      fetchMovementDetails();
    }
  }, [selectedMovement]);

  const fetchMovementDetails = async () => {
    setLoadingData(true);
    try {
      const data = await fetchStockMovementById(
        selectedMovement.stockMovementId,
      );

      const matchedMovementType =
        movementTypes.find((t) => t.name === data.movementType) || null;

      setFormData({
        movementType: matchedMovementType,
        fromLocation: data.fromLocationId
          ? {
              id: data.fromLocationId,
              name: data.fromLocationName || selectedMovement.fromLocationName,
            }
          : null,
        bin: data.fromBinId
          ? { binId: data.fromBinId, binCode: data.fromBinCode || "" }
          : null,
        responsiblePerson: data.assignedUserId
          ? { id: data.assignedUserId, firstName: "", lastName: "" }
          : null,
        movementDate: data.movementDate
          ? dayjs(data.movementDate).format("YYYY-MM-DD")
          : "",
        expectedReturnDate: data.expectedReturnDate
          ? dayjs(data.expectedReturnDate).format("YYYY-MM-DD")
          : "",
        description: data.notes || "",
        reason: data.movementReason || "",
        department: data.department ? { name: data.department } : "",
        project:
          data.project || (data.projectId ? { id: data.projectId } : null),
        subProject:
          data.subProject ||
          (data.subProjectId ? { id: data.subProjectId } : null),
        issuePurpose: data.issuePurpose ? { name: data.issuePurpose } : null,
        company: data.companyId
          ? { id: data.companyId, name: data.company?.name || "" }
          : null,
      });

      // Load stock data for the location
      if (data.fromLocationId) {
        fetchStockLocations(data.fromLocationId);
      }

      // Map line items
      const lineItems = (data.stockMovementLineItems || []).map(
        (item, index) => ({
          ...item,
          uniqueId: `${item.partId}-${index}-${Date.now()}`,
          issueQuantity: item.quantity || 0,
          trackingType:
            trackingTypes.find((t) => t.label === item.trackingType) || "",
          trackingNumber: item.trackingId || "",
          remarks: item.reason || "",
          partNumber: item.part?.partNumber || item.partNumber || "",
          partName: item.part?.name || item.partName || "",
          quantity: item.availableQuantity || item.quantity || 0,
          adjustmentType: item.adjustmentType || "",
        }),
      );

      setSelectedStockItems(lineItems);

      // Resolve PO/GRN for all loaded line items
      const uniquePartIds = [
        ...new Set((data.stockMovementLineItems || []).map((x) => x.partId)),
      ];
      await Promise.all(
        uniquePartIds.map(async (partId) => {
          const history = await getPurchaseHistoryForPart(partId);
          setSelectedStockItems((prev) =>
            prev.map((item) => {
              if (item.partId !== partId) return item;

              let match = null;
              if (item.trackingNumber) {
                match = history.find(
                  (x) => x.trackingId === item.trackingNumber,
                );
              }

              if (match) {
                return {
                  ...item,
                  poNumber: match.poNumber || "---",
                  poQty: match.receivedQuantity ?? null,
                  grnNumber: match.grnNumber || "---",
                };
              } else {
                return {
                  ...item,
                  poNumber: "---",
                  poQty: null,
                  grnNumber: "---",
                };
              }
            }),
          );
        }),
      );
    } catch (error) {
      Alert("Failed to load stock movement details", "error");
      console.error("Error fetching stock movement:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await fetchLocationsLookUp();
      setLocationsData(data || []);
    } catch {
      Alert("Failed to fetch locations", "error");
    }
  };

  const fetchStaffData = async () => {
    setLoadingStaffData(true);
    try {
      const data = await fetchUserLookup();
      setUserData(data || []);
    } catch (error) {
      Alert("Failed to fetch user", "error");
    } finally {
      setLoadingStaffData(false);
    }
  };

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await fetchOptionSetByName("departments");
      const parsed = response ? JSON.parse(response.values) : [];
      setDepartments(parsed);
    } catch {
      Alert("Failed to load departments", "error");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchProjectsData = async () => {
    setLoadingProjects(true);
    try {
      const data = await fetchProjectsLookup();
      setProjects(data);
    } catch {
      Alert("Failed to fetch projects data", "error");
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchIssuePurposes = async () => {
    setLoadingIssuePurposes(true);
    try {
      const response = await fetchOptionSetByName("issue_purpose");
      const parsed = response ? JSON.parse(response.values) : [];
      setIssuePurposes(parsed);
    } catch {
      Alert("Failed to load issue purposes", "error");
    } finally {
      setLoadingIssuePurposes(false);
    }
  };

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const data = await fetchVendors();
      setCompanies(data || []);
    } catch {
      Alert("Failed to load companies", "error");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchSubProjectsData = async (projectId) => {
    if (!projectId) {
      setSubProjects([]);
      return;
    }
    setLoadingSubProjects(true);
    try {
      const data = await fetchSubProjectsByProject(projectId);
      setSubProjects(data || []);
    } catch {
      Alert("Failed to fetch sub-projects", "error");
    } finally {
      setLoadingSubProjects(false);
    }
  };

  const fetchStockLocations = async (id) => {
    if (!id) return;
    setLoadingStockData(true);
    try {
      const data = await fetchInventoryStockByLocation(id);
      const stock = data || [];
      setStockData(stock);
    } catch {
      Alert("Failed to fetch stock data", "error");
    } finally {
      setLoadingStockData(false);
    }
  };

  // Resolve responsible person name once userData is loaded
  useEffect(() => {
    if (userData.length > 0 && formData.responsiblePerson?.id) {
      const match = userData.find(
        (s) => s.id === formData.responsiblePerson.id,
      );
      if (match && formData.responsiblePerson !== match) {
        setFormData((prev) => ({ ...prev, responsiblePerson: match }));
      }
    }
  }, [userData, formData.responsiblePerson?.id]);

  // Resolve project once projects are loaded
  useEffect(() => {
    if (projects.length > 0 && formData.project?.id) {
      const match = projects.find((p) => p.id === formData.project.id);
      if (match && formData.project !== match) {
        setFormData((prev) => ({ ...prev, project: match }));
      }
    }
  }, [projects, formData.project?.id]);

  // Fetch sub-projects when project changes
  useEffect(() => {
    fetchSubProjectsData(formData.project?.id || null);
  }, [formData.project?.id]);

  // Resolve subProject once subProjects are loaded
  useEffect(() => {
    if (subProjects.length > 0 && formData.subProject?.id) {
      const match = subProjects.find((s) => s.id === formData.subProject.id);
      if (match && formData.subProject !== match) {
        setFormData((prev) => ({ ...prev, subProject: match }));
      }
    }
  }, [subProjects, formData.subProject?.id]);

  // Resolve department once departments are loaded
  useEffect(() => {
    if (departments.length > 0 && formData.department?.name) {
      const match = departments.find(
        (d) => d.name === formData.department.name,
      );
      if (match && formData.department !== match) {
        setFormData((prev) => ({ ...prev, department: match }));
      }
    }
  }, [departments, formData.department?.name]);

  // Resolve location once locations are loaded
  useEffect(() => {
    if (locationsData.length > 0 && formData.fromLocation?.id) {
      const match = locationsData.find(
        (l) => l.id === formData.fromLocation.id,
      );
      if (match && formData.fromLocation !== match) {
        setFormData((prev) => ({ ...prev, fromLocation: match }));
      }
    }
  }, [locationsData, formData.fromLocation?.id]);

  // Resolve issue purpose once issuePurposes are loaded
  useEffect(() => {
    if (issuePurposes.length > 0 && formData.issuePurpose?.name) {
      const match = issuePurposes.find(
        (p) => p.name === formData.issuePurpose.name,
      );
      if (match && formData.issuePurpose !== match) {
        setFormData((prev) => ({ ...prev, issuePurpose: match }));
      }
    }
  }, [issuePurposes, formData.issuePurpose?.name]);

  // Resolve company once companies are loaded
  useEffect(() => {
    if (companies.length > 0 && formData.company?.id) {
      const match = companies.find((c) => c.id === formData.company.id);
      if (match && formData.company !== match) {
        setFormData((prev) => ({ ...prev, company: match }));
      }
    }
  }, [companies, formData.company?.id]);

  useEffect(() => {
    const fetchParts = async () => {
      setLoadingStockData(true);
      try {
        const data = await fetchInventoryPartWithPrice();
        setItems(extractParts(data || []));
      } catch (err) {
        console.error("Failed to load parts inventory:", err);
      } finally {
        setLoadingStockData(false);
      }
    };
    fetchParts();
  }, []);

  const extractParts = (stockData = []) => {
    const map = new Map();
    stockData.forEach((item) => {
      map.set(item.partId, {
        ...item,
        id: item.partId,
        partId: item.partId,
        partNumber: item.partNumber,
        partName: item.partName,
        name: item.partName,
        manufacturingPartNumber: item.manufacturingPartNumber || "",
        quantity: item.qtyOnhand || item.quantity || 0,
        binId: item.binId,
        binCode: item.binCode,
        trackingType: item.trackingType || item.part?.trackingType,
        isSerialNumberRequired:
          item.isSerialNumberRequired ?? item.part?.isSerialNumberRequired,
        trackingMethod: item.trackingMethod || item.part?.trackingMethod,
        qtyAvailable: item.qtyAvailable || item.qtyOnhand || 0,
      });
    });
    return Array.from(map.values());
  };

  const getTotalIssuedQuantityForPart = (partId, excludeUniqueId = null) => {
    return selectedStockItems.reduce((sum, item) => {
      if (item.partId === partId && item.uniqueId !== excludeUniqueId) {
        return sum + (Number(item.issueQuantity) || 0);
      }
      return sum;
    }, 0);
  };

  const handleUpdateField = (key, value) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [key]: value };

      setFormErrors((errors) => {
        const REQUIRED_FIELDS = {
          movementType: "Movement Type is required",
          fromLocation: "From Location is required",
          movementDate: "Movement Date is required",
          reason: "Reason is required",
        };

        if (REQUIRED_FIELDS[key]) {
          if (value) {
            delete errors[key];
          } else {
            errors[key] = REQUIRED_FIELDS[key];
          }
        }

        if (key === "responsiblePerson" || key === "department") {
          if (!updatedData.responsiblePerson && !updatedData.department) {
            errors.responsiblePerson =
              "Either Responsible Person or Department is required";
            errors.department =
              "Either Responsible Person or Department is required";
          } else {
            delete errors.responsiblePerson;
            delete errors.department;
          }
        }

        return errors;
      });

      if (key === "fromLocation") {
        if (value?.id) {
          fetchStockLocations(value.id);
        } else {
          setStockData([]);
        }
        updatedData.bin = null;
      }

      return updatedData;
    });
  };

  const handleSelectItem = async (part) => {
    if (!part) return;

    // Fetch purchase history for parent part
    const parentHistory = await getPurchaseHistoryForPart(part.partId);

    const usedTrackingIds = new Set(
      selectedStockItems
        .filter((i) => i.partId === part.partId)
        .map((i) => i.trackingNumber)
        .filter(Boolean),
    );
    const partStockRows = stockData.filter(
      (item) => item.partId === part.partId,
    );
    const stockMatch =
      partStockRows.find(
        (s) => s.trackingId && !usedTrackingIds.has(s.trackingId),
      ) || partStockRows[0];

    const trackingNo =
      stockMatch?.trackingId || part.trackingNumber || part.trackingId || "";
    const parentMatch =
      (trackingNo
        ? (parentHistory.find((x) => x.trackingId === trackingNo) ?? null)
        : null) ||
      (parentHistory && parentHistory.length > 0 ? parentHistory[0] : null);

    let trackingTypeStr = "None";
    const rawTrackingType =
      part.trackingType || part.part?.trackingType || stockMatch?.trackingType;
    if (rawTrackingType) {
      trackingTypeStr =
        typeof rawTrackingType === "object"
          ? rawTrackingType.label || rawTrackingType.value || "None"
          : rawTrackingType;
    } else if (
      part.isSerialNumberRequired ||
      part.part?.isSerialNumberRequired ||
      stockMatch?.isSerialNumberRequired
    ) {
      trackingTypeStr = "Serial";
    } else if (
      part.trackingMethod ||
      part.part?.trackingMethod ||
      stockMatch?.trackingMethod
    ) {
      trackingTypeStr =
        part.trackingMethod ||
        part.part?.trackingMethod ||
        stockMatch?.trackingMethod;
    }

    if (trackingTypeStr.toLowerCase() === "serial") {
      trackingTypeStr = "Serial";
    } else if (trackingTypeStr.toLowerCase() === "batch") {
      trackingTypeStr = "Batch";
    } else {
      trackingTypeStr = "None";
    }

    const trackingTypeObj = trackingTypes.find(
      (t) => t.value === trackingTypeStr.toLowerCase(),
    ) || { value: "none", label: "None" };

    const isSerial = trackingTypeStr === "Serial";
    const parentQtyAvailable = stockData
      .filter((s) => s.partId === part.partId)
      .reduce((sum, s) => sum + (s.qtyAvailable ?? s.qtyOnhand ?? 0), 0);

    const newEntry = {
      ...part,
      uniqueId: `${part.partId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      trackingType: trackingTypeObj,
      issueQuantity: isSerial && parentQtyAvailable > 0 ? 1 : "",
      trackingNumber: usedTrackingIds.has(parentMatch?.trackingId || trackingNo)
        ? ""
        : parentMatch?.trackingId || trackingNo || "",
      poNumber: parentMatch?.poNumber || "---",
      poQty: parentMatch?.receivedQuantity ?? null,
      grnNumber: parentMatch?.grnNumber || "---",
      remarks: "",
      qtyAvailable: parentQtyAvailable,
      quantity: stockMatch ? (stockMatch.qtyOnhand ?? 0) : 0,
      binId: stockMatch ? stockMatch.binId : formData?.bin?.binId || null,
      binCode: stockMatch ? stockMatch.binCode : formData?.bin?.binCode || "",
    };

    setSelectedStockItems((prev) => [...prev, newEntry]);
  };

  const handleIssueQuantityChange = (uniqueId, value) => {
    const parsed = value === "" ? "" : Number(value);
    setSelectedStockItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, issueQuantity: parsed } : item,
      ),
    );
    const item = selectedStockItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;
    const error = validateIssueQuantity({ ...item, issueQuantity: parsed });
    updateLineItemError(uniqueId, "issueQuantity", error);
  };

  const handleTrackingNumberChange = async (uniqueId, value) => {
    setSelectedStockItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, trackingNumber: value } : item,
      ),
    );
    const item = selectedStockItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;

    // Resolve PO/GRN for the new tracking number
    const history = await getPurchaseHistoryForPart(item.partId);
    const match = history.find((x) => x.trackingId === value);
    setSelectedStockItems((prev) =>
      prev.map((i) =>
        i.uniqueId === uniqueId
          ? {
              ...i,
              poNumber: match?.poNumber || "---",
              poQty: match?.receivedQuantity ?? null,
              grnNumber: match?.grnNumber || "---",
            }
          : i,
      ),
    );

    const error = validateTrackingNumber(
      { ...item, trackingNumber: value },
      selectedStockItems,
    );
    updateLineItemError(uniqueId, "trackingNumber", error);
  };

  const handleRemarksPopoverOpen = (row, event) => {
    setActiveRowId(row.uniqueId);
    setTempRemarks(row.remarks || "");
    setAnchorEl(event.currentTarget);
  };

  const handleRemarksChange = (id, value) => {
    setSelectedStockItems((prev) =>
      prev.map((item) =>
        item.uniqueId === id ? { ...item, remarks: value } : item,
      ),
    );
  };

  const updateLineItemError = (uniqueId, field, errorMsg) => {
    setLineItemErrors((prev) => {
      const updated = { ...prev };
      if (!updated[uniqueId]) updated[uniqueId] = {};
      if (errorMsg) {
        updated[uniqueId][field] = errorMsg;
      } else {
        delete updated[uniqueId][field];
        if (Object.keys(updated[uniqueId]).length === 0)
          delete updated[uniqueId];
      }
      return updated;
    });
  };

  const validateIssueQuantity = (item) => {
    // If available quantity is 0, allow 0 or empty issue quantity
    if (item.quantity === 0) {
      if (item.issueQuantity === "" || Number(item.issueQuantity) === 0) {
        return "";
      }
    }

    if (item.issueQuantity === "") return "Issue Quantity is required";
    if (item.issueQuantity <= 0)
      return "Issue Quantity must be greater than zero";
    const otherItemsQuantity = getTotalIssuedQuantityForPart(
      item.partId,
      item.uniqueId,
    );
    const totalQuantity = Number(item.issueQuantity) + otherItemsQuantity;
    if (totalQuantity > item.quantity)
      return "Issue Quantity cannot exceed available quantity";
    return "";
  };

  const validateTrackingNumber = (item, allItems) => {
    const value = item.trackingNumber;
    const trackingType =
      item.trackingType?.value ||
      (typeof item.trackingType === "string"
        ? item.trackingType.toLowerCase()
        : "");

    // If no quantity is being issued, tracking number is not required
    if (item.issueQuantity === "" || Number(item.issueQuantity) === 0) {
      return "";
    }

    if (trackingType === "none") return "";
    if (!value?.trim()) return "Tracking ID is required";
    if (!/^[a-zA-Z0-9-]+$/.test(value))
      return "Only letters, numbers and hyphens allowed";
    const isDuplicate = allItems.some(
      (i) =>
        i.uniqueId !== item.uniqueId &&
        i.partId === item.partId &&
        i.trackingNumber?.trim() === value.trim(),
    );
    if (isDuplicate) return "Tracking ID already used";
    return "";
  };

  const validateTrackingType = (item) => {
    if (!item.trackingType || !item.trackingType.value)
      return "Tracking Type is required";
    return "";
  };

  const validateAdjustmentType = (item) => {
    if (!item.adjustmentType) return "Adjustment Type is required";
    return "";
  };

  const validateExpectedReturnDate = (movementDate, expectedReturnDate) => {
    if (!expectedReturnDate) return "";
    if (!movementDate) return "Movement Date must be selected first";
    const movement = new Date(movementDate);
    const expected = new Date(expectedReturnDate);
    if (expected < movement)
      return "Expected Return Date cannot be before Movement Date";
    return "";
  };

  const validate = () => {
    const errors = {};
    if (!formData.movementType)
      errors.movementType = "Movement Type is required";
    if (!formData.fromLocation) errors.fromLocation = "Location is required";
    if (!formData.movementDate)
      errors.movementDate = "Movement Date is required";
    if (!formData.reason) errors.reason = "Reason is required";
    if (!formData.responsiblePerson && !formData.department) {
      errors.responsiblePerson =
        "Either Responsible Person or Department is required";
      errors.department = "Either Responsible Person or Department is required";
    }
    if (formData.movementType?.name === "Adjustment") {
      const missingAdjustmentType = selectedStockItems.some(
        (item) => !item.adjustmentType,
      );
      if (missingAdjustmentType) {
        Alert("Adjustment Type is required for all items", "error");
        return "Adjustment Type missing";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length
      ? "Please fill all required fields"
      : null;
  };

  const buildPayload = () => {
    return {
      id: selectedMovement.stockMovementId,
      movementType: formData.movementType?.name,
      movementDate: formData.movementDate,
      fromLocationId: formData.fromLocation?.id,
      fromBinId: formData.bin?.binId,
      assignedUserId: formData.responsiblePerson?.id,
      expectedReturnDate: formData.expectedReturnDate || null,
      movementReason: formData.reason || "",
      notes: formData.description || "",
      department: formData?.department?.name,
      projectId: formData?.project?.id,
      subProjectId: formData?.subProject?.id,
      issuePurpose:
        formData?.movementType?.name === "Issued"
          ? formData?.issuePurpose?.name || null
          : null,
      companyId:
        formData?.movementType?.name === "Issued"
          ? formData?.company?.id || null
          : null,
      lineItems: selectedStockItems
        .filter((item) => {
          const qty = Number(item.issueQuantity);
          return !isNaN(qty) && qty > 0;
        })
        .map((item) => ({
          partId: item.partId,
          quantity: Number(item.issueQuantity),
          trackingType: item.trackingType?.label || item.trackingType || "",
          trackingId: item.trackingNumber,
          reason: item.remarks || "",
          adjustmentType:
            formData.movementType?.name === "Adjustment"
              ? item.adjustmentType || ""
              : null,
        })),
    };
  };

  const handleSaveDraft = async () => {
    const payload = buildPayload();
    if (!payload.lineItems || payload.lineItems.length === 0) {
      Alert(
        "At least one item must have a quantity greater than 0 to save draft",
        "error",
      );
      return;
    }

    setLoadingData(true);
    try {
      await createSMWithLineItems(payload);
      Alert("Draft saved successfully", "success");
      handleRefresh();
    } catch {
      Alert("Failed to save draft", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert(error, "error");
      return;
    }

    const expectedDateError = validateExpectedReturnDate(
      formData.movementDate,
      formData.expectedReturnDate,
    );
    if (expectedDateError) {
      setFormErrors((prev) => ({
        ...prev,
        expectedReturnDate: expectedDateError,
      }));
      Alert(expectedDateError, "error");
      return;
    }

    if (selectedStockItems.length === 0) {
      Alert("Please select at least one stock item", "error");
      return;
    }

    const hasPositiveQty = selectedStockItems.some(
      (item) => Number(item.issueQuantity) > 0,
    );
    if (!hasPositiveQty) {
      Alert(
        "At least one item must have a quantity greater than 0 to submit",
        "error",
      );
      return;
    }

    let hasLineItemErrors = false;
    selectedStockItems.forEach((item) => {
      const issueQtyError = validateIssueQuantity(item);
      const trackingError = validateTrackingNumber(item, selectedStockItems);
      const trackingTypeError = validateTrackingType(item);
      const adjustmentTypeError =
        formData.movementType?.name === "Adjustment"
          ? validateAdjustmentType(item)
          : "";

      updateLineItemError(item.uniqueId, "issueQuantity", issueQtyError);
      updateLineItemError(item.uniqueId, "trackingNumber", trackingError);
      updateLineItemError(item.uniqueId, "trackingType", trackingTypeError);
      updateLineItemError(item.uniqueId, "adjustmentType", adjustmentTypeError);

      if (
        issueQtyError ||
        trackingError ||
        trackingTypeError ||
        adjustmentTypeError
      ) {
        hasLineItemErrors = true;
      }
    });

    if (hasLineItemErrors) {
      Alert("Please fix line item errors before submitting", "error");
      return;
    }

    const payload = buildPayload();

    setLoadingData(true);
    try {
      await submitSMWithLineItems(payload);
      Alert("Stock movement submitted successfully", "success");
      handleClose();
      handleRefresh();
    } catch {
      Alert("Failed to submit stock movement", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async () => {
    setLoadingData(true);
    try {
      await approveStockMovement(selectedMovement.stockMovementId);
      Alert("Stock movement approved successfully", "success");
      handleClose();
      handleRefresh();
    } catch {
      Alert("Failed to approve stock movement", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReject = async () => {
    setLoadingData(true);
    try {
      await rejectStockMovement(selectedMovement.stockMovementId);
      Alert("Stock movement rejected successfully", "success");
      handleClose();
      handleRefresh();
    } catch {
      Alert("Failed to reject stock movement", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleExpectedReturnDateChange = (value) => {
    setFormData((prev) => ({ ...prev, expectedReturnDate: value }));
    const error = validateExpectedReturnDate(formData.movementDate, value);
    setFormErrors((prev) => {
      if (error) return { ...prev, expectedReturnDate: error };
      const rest = { ...prev };
      delete rest.expectedReturnDate;
      return rest;
    });
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
      valueGetter: (_, row) => row.part?.partNumber || row.partNumber || "",
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
      valueGetter: (_, row) => row.part?.name || row.partName || "",
    },
    {
      field: "poNumber",
      headerName: "PO Number",
      flex: 1,
      valueGetter: (_, row) => row.poNumber || "---",
    },
    {
      field: "poQty",
      headerName: "PO Qty",
      flex: 0.5,
      type: "number",
      valueGetter: (_, row) =>
        row.poQty !== undefined && row.poQty !== null ? row.poQty : null,
    },
    {
      field: "grnNumber",
      headerName: "GRN Number",
      flex: 1,
      valueGetter: (_, row) => row.grnNumber || "---",
    },
    // {
    //   field: "quantity",
    //   headerName: "Available Quantity",
    //   flex: 1,
    // },
    {
      field: "trackingType",
      headerName: "Tracking Type",
      flex: 1,
      valueGetter: (_, row) =>
        row.trackingType?.label || row.trackingType || "",
    },
    {
      field: "trackingNumber",
      headerName: "Tracking ID",
      flex: 1,
      renderCell: ({ row }) => {
        if (readOnlyMode) return row.trackingNumber || "-";
        const trackingType = row.trackingType?.value;
        if (trackingType === "none") return <div>---</div>;
        return (
          <TextField
            size="small"
            fullWidth
            value={row.trackingNumber || ""}
            onChange={(e) =>
              handleTrackingNumberChange(row.uniqueId, e.target.value)
            }
            error={Boolean(lineItemErrors[row.uniqueId]?.trackingNumber)}
            helperText={lineItemErrors[row.uniqueId]?.trackingNumber || ""}
            sx={{
              "& .MuiInputBase-root": {
                height: 40,
                padding: "0 10px",
                borderRadius: "6px",
                marginTop: "4px",
              },
              "& input": {
                padding: "4px 6px !important",
                fontSize: "14px",
              },
            }}
          />
        );
      },
    },
    {
      field: "issueQuantity",
      headerName: `${formData.movementType?.name || "Issue"} Qty`,
      flex: 1,
      type: "number",
      renderCell: ({ row }) => {
        if (readOnlyMode) return row.issueQuantity;
        return (
          <TextField
            size="small"
            type="number"
            fullWidth
            value={row.issueQuantity}
            onChange={(e) =>
              handleIssueQuantityChange(row.uniqueId, e.target.value)
            }
            InputProps={{
              readOnly: readOnlyMode || row.trackingType?.value === "serial",
            }}
            error={Boolean(lineItemErrors[row.uniqueId]?.issueQuantity)}
            helperText={lineItemErrors[row.uniqueId]?.issueQuantity || ""}
            sx={{
              "& .MuiInputBase-root": {
                height: 40,
                padding: "0 10px",
                borderRadius: "6px",
                marginTop: "4px",
              },
              "& input": {
                padding: "4px 6px !important",
                fontSize: "14px",
              },
            }}
          />
        );
      },
    },
    ...(formData.movementType?.name === "Adjustment"
      ? [
          {
            field: "adjustmentType",
            headerName: "Adjustment Type",
            flex: 1,
            type: "singleSelect",
            valueOptions: ["Increase", "Decrease"],
            renderCell: ({ row }) => {
              if (readOnlyMode) return row.adjustmentType || "-";
              return (
                <Autocomplete
                  fullWidth
                  options={adjustmentTypes}
                  value={row.adjustmentType || null}
                  onChange={(_, newValue) => {
                    setSelectedStockItems((prev) =>
                      prev.map((item) =>
                        item.uniqueId === row.uniqueId
                          ? { ...item, adjustmentType: newValue }
                          : item,
                      ),
                    );
                    updateLineItemError(
                      row.uniqueId,
                      "adjustmentType",
                      newValue ? "" : "Adjustment Type is required",
                    );
                  }}
                  disableClearable
                  getOptionLabel={(option) => option}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select"
                      required
                      error={Boolean(
                        lineItemErrors[row.uniqueId]?.adjustmentType,
                      )}
                      helperText={
                        lineItemErrors[row.uniqueId]?.adjustmentType || ""
                      }
                      sx={{
                        "& .MuiInputBase-root": {
                          height: 40,
                          padding: "0 10px",
                          borderRadius: "6px",
                          marginTop: "4px",
                        },
                        "& input": {
                          padding: "4px 6px !important",
                          fontSize: "14px",
                        },
                      }}
                    />
                  )}
                />
              );
            },
          },
        ]
      : []),
    {
      field: "remarks",
      headerName: "Reason",
      flex: 1,
      renderCell: ({ row, value }) => (
        <div
          onClick={(e) => {
            if (readOnlyMode) return;
            handleRemarksPopoverOpen(row, e);
          }}
        >
          <div>{value || (readOnlyMode ? "-" : "Click to edit")}</div>
        </div>
      ),
    },
    ...(!readOnlyMode
      ? [
          {
            field: "actions",
            headerName: "",
            flex: 1,
            maxWidth: 50,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => (
              <ion-icon
                name="trash-outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStockItems((prev) =>
                    prev.filter((item) => item.uniqueId !== row.uniqueId),
                  );
                }}
              />
            ),
          },
        ]
      : []),
  ];

  const stockMovementDetailsFields = [
    {
      label: "Movement Type",
      value: formData.movementType?.name,
    },
    {
      label: "Location",
      value: formData.fromLocation?.name || selectedMovement?.fromLocationName,
    },
    {
      label: "Bin",
      value: formData.bin?.binCode,
    },
    {
      label: "Transaction Date",
      value: formData.movementDate
        ? dayjs(formData.movementDate).format("DD-MM-YYYY")
        : null,
    },
    {
      label: "Expected Return Date",
      value: formData.expectedReturnDate
        ? dayjs(formData.expectedReturnDate).format("DD-MM-YYYY")
        : null,
    },
    {
      label: "Project",
      value: formData.project
        ? `${formData.project.projectCode || ""} - ${formData.project.name || ""}`
        : null,
    },
    {
      label: "Sub Project",
      value: formData.subProject?.name || null,
    },
    {
      label: "Responsible Person",
      value: formData.responsiblePerson?.firstName
        ? `${formData.responsiblePerson.firstName} ${formData.responsiblePerson.lastName}`
        : selectedMovement?.performedByFullName,
    },
    {
      label: "Department",
      value: formData.department?.name,
    },
    ...(formData.movementType?.name === "Issued"
      ? [
          {
            label: "Issue Purpose",
            value: formData.issuePurpose?.name,
          },
          {
            label: "Company",
            value: formData.company?.name,
          },
        ]
      : []),
    {
      label: "Reason",
      value: formData.reason,
    },
    {
      label: "Notes",
      value: formData.description,
    },
  ];

  return (
    <div className="GrnNewFlyout">
      <div className="EditFlyoutHeader">
        <h3>{`${selectedMovement?.movementNumber || "Stock Movement"} Details`}</h3>
        <div className="EditFlyoutHeaderIcons">
          <p>
            <span>Status:</span> <span>{selectedMovement?.status}</span>
          </p>
          {(isDraft || selectedMovement?.status === "Draft") && (
            <>
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <button
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.STOCKMOVEMENTS.MODIFY)) {
                    Alert(
                      "You do not have permission to edit stock movements",
                      "warning",
                    );
                    return;
                  }
                  setReadOnlyMode(false);
                }}
              >
                <ion-icon name="create-outline"></ion-icon>
              </button>
            </>
          )}
          <button onClick={handleClose}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading />
        </div>
      ) : !isDraft ? (
        <div className="GrnNewFlyoutTabPanel">
          <div className="GrnNewFlyoutContent StockMovementContainer">
            {/* MOVEMENT DETAILS CARD */}
            <div className="grnDetailsCard">
              <h4 className="cardTitle">Stock Movement Details</h4>

              <div className="grnDetailsGrid">
                {stockMovementDetailsFields.map((item, index) => (
                  <div className="detailItem" key={index}>
                    <p className="detailLabel">{item.label}</p>
                    <p className={`detailValue ${item.className || ""}`}>
                      {item.value || "---"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="GrnEditDataGridDiv">
              <StyledDataGrid
                rows={selectedStockItems}
                columns={columns}
                getRowId={(row) => row.uniqueId}
                disableRowSelectionOnClick
                pageSize={5}
                rowsPerPageOptions={[5]}
              />
            </div>
          </div>

          {isPendingApproval && (
            <div className="CreateFlyoutFooter">
              <Button
                className="CancelButton"
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.STOCKMOVEMENTS.MODIFY)) {
                    Alert(
                      "You do not have permission to reject stock movements",
                      "warning",
                    );
                    return;
                  }
                  handleReject();
                }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.STOCKMOVEMENTS.MODIFY)) {
                    Alert(
                      "You do not have permission to approve stock movements",
                      "warning",
                    );
                    return;
                  }
                  handleApprove();
                }}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Edit Details</h3>

            <div className="editSMDetailsGrid">
              <div className="detailItem">
                <p className="detailLabel">Movement Type</p>
                <p className="detailValue">
                  {formData.movementType?.name || "---"}
                </p>
              </div>
              <div className="detailItem">
                <p className="detailLabel">Location</p>
                <p className="detailValue">
                  {formData.fromLocation?.name ||
                    selectedMovement?.fromLocationName ||
                    "---"}
                </p>
              </div>
              <div className="detailItem">
                <p className="detailLabel">Bin</p>
                <p className="detailValue">{formData.bin?.binCode || "---"}</p>
              </div>
              <div className="detailItem">
                <p className="detailLabel">Project</p>
                <p className="detailValue">
                  {formData.project?.name
                    ? `${formData.project.projectCode ? formData.project.projectCode + " - " : ""}${formData.project.name}`
                    : "---"}
                </p>
              </div>
              <div className="detailItem">
                <p className="detailLabel">Sub Project</p>
                <p className="detailValue">
                  {formData.subProject?.name || "---"}
                </p>
              </div>
            </div>

            {/* <div className="stock-form-grid"> */}

            <div className="GrnNewFlyoutContentTop">
              <TextField
                type="date"
                label="Transaction Date"
                value={formData?.movementDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: readOnlyMode }}
                fullWidth
                onChange={(e) =>
                  handleUpdateField("movementDate", e.target.value)
                }
                required
                error={!!formErrors.movementDate}
                helperText={formErrors.movementDate}
              />

              <TextField
                type="date"
                label="Expected Return Date"
                value={formData?.expectedReturnDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: readOnlyMode }}
                fullWidth
                onChange={(e) => handleExpectedReturnDateChange(e.target.value)}
                error={!!formErrors.expectedReturnDate}
                helperText={formErrors.expectedReturnDate}
              />
            </div>
            <div className="GrnNewFlyoutContentTop">
              <TextField
                label="Reason"
                value={formData?.reason}
                fullWidth
                multiline
                rows={3}
                InputProps={{ readOnly: readOnlyMode }}
                onChange={(e) => handleUpdateField("reason", e.target.value)}
                required
                error={!!formErrors.reason}
                helperText={formErrors.reason}
              />

              <TextField
                label="Notes"
                value={formData?.description}
                multiline
                rows={3}
                InputProps={{ readOnly: readOnlyMode }}
                fullWidth
                onChange={(e) =>
                  handleUpdateField("description", e.target.value)
                }
              />
            </div>
            <div className="stock-or-required-group">
              <label
                className={`stock-or-required-label ${
                  formErrors.responsiblePerson || formErrors.department
                    ? "error"
                    : ""
                }`}
              >
                Responsible Person / Department{" "}
                <span className="required">*</span>
              </label>

              <div className="GrnNewFlyoutContentTop">
                <Autocomplete
                  options={userData}
                  value={formData?.responsiblePerson}
                  loading={loadingStaffData}
                  getOptionLabel={(o) =>
                    o ? `${o.firstName} ${o.lastName}` : ""
                  }
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  onChange={(_, v) => handleUpdateField("responsiblePerson", v)}
                  readOnly={readOnlyMode}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      {`${option.firstName} ${option.lastName}`}
                    </li>
                  )}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Responsible Person"
                      error={!!formErrors.responsiblePerson}
                    />
                  )}
                />

                <Autocomplete
                  options={departments}
                  value={formData?.department}
                  loading={loadingDepartments}
                  getOptionLabel={(o) => o.name || ""}
                  readOnly={readOnlyMode}
                  onChange={(_, v) => handleUpdateField("department", v)}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Department"
                      error={!!formErrors.department}
                    />
                  )}
                />
              </div>

              {(formErrors.responsiblePerson || formErrors.department) && (
                <FormHelperText error>
                  Either Responsible Person or Department is required
                </FormHelperText>
              )}
            </div>

            {formData.movementType?.name === "Issued" && (
              <div className="GrnNewFlyoutContentTop">
                <Autocomplete
                  options={issuePurposes}
                  value={formData?.issuePurpose}
                  loading={loadingIssuePurposes}
                  getOptionLabel={(o) => o.name || ""}
                  isOptionEqualToValue={(o, v) => o.name === v?.name}
                  readOnly={readOnlyMode}
                  onChange={(_, v) => handleUpdateField("issuePurpose", v)}
                  renderInput={(p) => (
                    <TextField {...p} label="Issue Purpose" fullWidth />
                  )}
                />
                <Autocomplete
                  options={companies}
                  value={formData?.company}
                  loading={loadingCompanies}
                  getOptionLabel={(o) => o.name || ""}
                  isOptionEqualToValue={(o, v) => o.id === v?.id}
                  readOnly={readOnlyMode}
                  onChange={(_, v) => handleUpdateField("company", v)}
                  renderInput={(p) => (
                    <TextField {...p} label="Company" fullWidth />
                  )}
                />
              </div>
            )}

            <div className="LineItemsContainer">
              <Autocomplete
                value={value}
                onChange={(e, newValue) => {
                  handleSelectItem(newValue);
                  setValue(null);
                  setInputValue("");
                }}
                sx={{ width: "50%" }}
                inputValue={inputValue}
                onInputChange={(e, newInputValue) =>
                  setInputValue(newInputValue)
                }
                readOnly={readOnlyMode || items.length === 0}
                options={items}
                loading={loadingStockData}
                loadingText="Loading Stock..."
                getOptionLabel={(option) =>
                  option
                    ? `${option.partNumber} - ${option.name} - ${option.manufacturingPartNumber}`
                    : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Part" fullWidth />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <div>
                      <strong>{option.name}</strong>
                      <div style={{ fontSize: "0.85rem" }}>
                        Part No: {option.partNumber}
                      </div>
                      <div style={{ fontSize: "0.85rem" }}>
                        Manf. Part No: {option.manufacturingPartNumber}
                      </div>
                    </div>
                  </li>
                )}
              />

              <div className="GrnDataGridDiv">
                <StyledDataGrid
                  rows={selectedStockItems}
                  columns={columns}
                  getRowId={(row) => row.uniqueId}
                  disableRowSelectionOnClick
                  getRowHeight={(params) => {
                    const errorMsg = lineItemErrors[params.id];
                    return errorMsg ? "auto" : null;
                  }}
                />
              </div>
            </div>
          </div>

          {!readOnlyMode && (
            <div className="CreateFlyoutFooter">
              <Button className="CancelButton" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="CancelButton" onClick={handleSaveDraft}>
                Save as Draft
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          )}
        </>
      )}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div className="stock-grid-des-pop-over">
          <TextField
            label="Reason"
            multiline
            rows={4}
            fullWidth
            InputProps={{ readOnly: readOnlyMode }}
            value={tempRemarks}
            onChange={(e) => setTempRemarks(e.target.value)}
          />
          <Button
            onClick={() => {
              handleRemarksChange(activeRowId, tempRemarks);
              setAnchorEl(null);
            }}
          >
            Save
          </Button>
        </div>
      </Popover>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditStockMovements;
