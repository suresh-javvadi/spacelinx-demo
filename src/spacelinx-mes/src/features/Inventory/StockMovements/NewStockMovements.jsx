import React, { useContext, useEffect, useState } from "react";
import { Autocomplete, Button, FormHelperText, TextField } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { fetchLocationsLookUp } from "../../../services/locationService";
import {
  createSMWithLineItems,
  submitSMWithLineItems,
} from "../../../services/stockMovementService";
import {
  fetchInPartsTrackingIdsById,
  fetchInventoryPartPurchaseHistory,
  fetchInventoryPartWithPrice,
} from "../../../services/inventoryPartService";
import { fetchInventoryStockByLocation } from "../../../services/inventoryStockService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchUserLookup } from "../../../services/userService";
import Popover from "@mui/material/Popover";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { fetchProjectsLookup } from "../../../services/projectService";
import { fetchSubProjectsByProject } from "../../../services/subProjectService";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { fetchFullBOMConsolidated } from "../../../services/childPartService";

const NewStockMovements = ({ handleCloseClick, handleRefresh, initialParts = [] }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingLocationData, setLoadingLocationData] = useState(false);
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
    responsiblePerson: null,
    movementDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    description: "",
    reason: "",
    department: "",
    project: null,
    subProject: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [staffData, setStaffData] = useState([]);
  const [loadingStaffData, setLoadingStaffData] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [loadingStockData, setLoadingStockData] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedStockItems, setSelectedStockItems] = useState([]);
  const [lineItemErrors, setLineItemErrors] = useState({});
  const [purchaseHistoryCache, setPurchaseHistoryCache] = useState({});
  // In-flight request map to avoid redundant concurrent fetches for the same partId
  const purchaseHistoryInFlight = React.useRef({});
  const prePopulatedRef = React.useRef(false);

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
  const [draftId, setDraftId] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [subProjects, setSubProjects] = useState([]);
  const [loadingSubProjects, setLoadingSubProjects] = useState(false);
  const [trackingOptionsMap, setTrackingOptionsMap] = useState({});

  const adjustmentTypes = ["Increase", "Decrease"];

  useEffect(() => {
    if (!Array.isArray(locationsData) || locationsData.length === 0) {
      console.error("locationsData is empty or invalid");
      return;
    }

    const xdlinxLocation = locationsData.find((loc) =>
      loc.name?.toLowerCase().includes("xdlinx"),
    );

    if (!xdlinxLocation) {
      console.error("No location matched 'xdlinx'");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      fromLocation: xdlinxLocation,
    }));
  }, [locationsData]);

  const getTotalIssuedQuantityForPart = (partId, excludeUniqueId = null) => {
    return selectedStockItems.reduce((sum, item) => {
      if (item.partId === partId && item.uniqueId !== excludeUniqueId) {
        return sum + (Number(item.issueQuantity) || 0);
      }
      return sum;
    }, 0);
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const fetchProjectsData = async () => {
    setLoadingProjects(true);
    try {
      const data = await fetchProjectsLookup();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects data:", error);
      Alert("Failed to fetch projects data. Please try again...!", "error");
    } finally {
      setLoadingProjects(false);
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
    } catch (error) {
      console.error("Failed to fetch sub-projects:", error);
      Alert("Failed to fetch sub-projects. Please try again...!", "error");
    } finally {
      setLoadingSubProjects(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await fetchOptionSetByName("departments");
      const parsed = response ? JSON.parse(response.values) : [];
      setDepartments(parsed);
    } catch (err) {
      Alert("Failed to load document types. File upload is disabled.", "error");
      console.error("Error fetching part_doc_types:", err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const validateIssueQuantity = (item) => {
    // If available quantity is 0, allow 0 or empty issue quantity
    if (item.qtyAvailable === 0) {
      if (item.issueQuantity === "" || Number(item.issueQuantity) === 0) {
        return "";
      }
    }

    if (item.issueQuantity === "") {
      return "Required";
    }

    if (item.issueQuantity <= 0) {
      return "Must be > 0";
    }

    const otherItemsQuantity = getTotalIssuedQuantityForPart(
      item.partId,
      item.uniqueId,
    );
    const totalQuantity = Number(item.issueQuantity) + otherItemsQuantity;

    if (totalQuantity > item.qtyAvailable) {
      return "Exceeds available";
    }

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

    if (trackingType === "none") {
      return "";
    }

    if (!value?.trim()) {
      return "Tracking ID is required";
    }

    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return "Only letters, numbers and hyphens allowed";
    }

    const isDuplicate = allItems.some(
      (i) =>
        i.uniqueId !== item.uniqueId &&
        i.partId === item.partId &&
        i.trackingNumber?.trim() === value.trim(),
    );

    if (isDuplicate) {
      return "Tracking ID already used";
    }

    return "";
  };

  const validateAdjustmentType = (item) => {
    if (!item.adjustmentType) {
      return "Adjustment Type is required";
    }
    return "";
  };

  const validateExpectedReturnDate = (movementDate, expectedReturnDate) => {
    if (!expectedReturnDate) {
      return "";
    }

    if (!movementDate) {
      return "Movement Date must be selected first";
    }

    const movement = new Date(movementDate);
    const expected = new Date(expectedReturnDate);

    if (expected < movement) {
      return "Expected Return Date cannot be before Movement Date";
    }

    return "";
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

    const error = validateIssueQuantity({
      ...item,
      issueQuantity: parsed,
    });

    updateLineItemError(uniqueId, "issueQuantity", error);
  };

  const updateLineItemError = (uniqueId, field, error) => {
    setLineItemErrors((prev) => ({
      ...prev,
      [uniqueId]: {
        ...(prev[uniqueId] || {}),
        [field]: error,
      },
    }));
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

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoadingStaffData(true);
    try {
      const data = await fetchUserLookup();
      setStaffData(data || []);
    } catch (error) {
      Alert("Failed to fetch staff", "error");
    } finally {
      setLoadingStaffData(false);
    }
  };

  const handleSelectItem = async (part) => {
    if (!part) return;

    // Look up the part in the selected location/bin stockData
    const stockMatch = stockData.find((item) => item.partId === part.partId);

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

    const isSerial = trackingTypeStr === "Serial";
    const uniqueId = `${part.partId}-${Date.now()}`;

    // Local lookup map of partId -> purchase history to resolve PO/GRN during auto-selection
    const localHistoryMap = {};

    // Fetch purchase history for parent part
    const parentHistory = await getPurchaseHistoryForPart(part.partId);
    localHistoryMap[part.partId] = parentHistory;

    // Resolve PO/GRN for parent part — check trackingNumber, trackingId, or stockMatch.trackingId (fallback to first history record)
    const trackingNo =
      part.trackingNumber || part.trackingId || stockMatch?.trackingId || "";
    const parentMatch =
      (trackingNo
        ? (parentHistory.find((x) => x.trackingId === trackingNo) ?? null)
        : null) ||
      (parentHistory && parentHistory.length > 0 ? parentHistory[0] : null);

    const parentQtyAvailable = stockMatch
      ? (stockMatch.qtyAvailable ?? stockMatch.qtyOnhand ?? 0)
      : 0;

    const newEntry = {
      ...part,
      uniqueId: uniqueId,
      issueQuantity: isSerial && parentQtyAvailable > 0 ? 1 : "",
      trackingType: trackingTypeStr,
      trackingNumber: parentMatch?.trackingId || trackingNo || "",
      poNumber: parentMatch?.poNumber || "---",
      poQty: parentMatch?.receivedQuantity ?? null,
      grnNumber: parentMatch?.grnNumber || "---",
      remarks: "",
      qtyAvailable: parentQtyAvailable,
      quantity: stockMatch ? (stockMatch.qtyOnhand ?? 0) : 0,
      binId: stockMatch ? stockMatch.binId : formData?.bin?.binId || null,
      binCode: stockMatch ? stockMatch.binCode : formData?.bin?.binCode || "",
    };

    let allNewItems = [newEntry];

    // Fetch and append BOM parts if any
    try {
      const bomData = await fetchFullBOMConsolidated(part.partId);
      if (bomData && bomData.length > 0) {
        // Filter out parent part if it is returned in the consolidated list
        const filteredBomData = bomData.filter(
          (item) => item.id !== part.partId,
        );

        // Fetch histories for all child parts in parallel
        const childHistories = await Promise.all(
          filteredBomData.map((childPart) =>
            getPurchaseHistoryForPart(childPart.id),
          ),
        );

        const childEntries = filteredBomData.map((childPart, idx) => {
          const childHistory = childHistories[idx] || [];
          localHistoryMap[childPart.id] = childHistory;

          const stockMatch = stockData.find(
            (item) => item.partId === childPart.id,
          );

          // Only match by actual tracking ID — fallback to first history item if not found or empty
          const childMatch =
            (stockMatch?.trackingId
              ? childHistory.find((x) => x.trackingId === stockMatch.trackingId)
              : null) ||
            (childHistory && childHistory.length > 0 ? childHistory[0] : null);

          const trackingTypeStr =
            childPart.isSerialNumberRequired ||
            childPart.part?.isSerialNumberRequired
              ? "Serial"
              : "None";

          if (stockMatch) {
            const childQtyAvailable =
              stockMatch.qtyAvailable ?? stockMatch.qtyOnhand ?? 0;
            const isChildSerial =
              stockMatch.trackingType?.toLowerCase() === "serial";
            let childTrackingTypeStr = "None";
            if (stockMatch.trackingType) {
              childTrackingTypeStr =
                typeof stockMatch.trackingType === "object"
                  ? stockMatch.trackingType.label || "None"
                  : stockMatch.trackingType;
            }
            if (childTrackingTypeStr.toLowerCase() === "serial") {
              childTrackingTypeStr = "Serial";
            } else if (childTrackingTypeStr.toLowerCase() === "batch") {
              childTrackingTypeStr = "Batch";
            } else {
              childTrackingTypeStr = "None";
            }

            return {
              ...stockMatch,
              partNumber:
                stockMatch.part?.partNumber || childPart.partNumber || "",
              partName: stockMatch.part?.name || childPart.name || "",
              uniqueId: `${stockMatch.partId}-${Date.now()}-${Math.random()}`,
              issueQuantity: isChildSerial && childQtyAvailable > 0 ? 1 : "",
              trackingType: childTrackingTypeStr,
              trackingNumber:
                childMatch?.trackingId || stockMatch.trackingId || "",
              poNumber: childMatch?.poNumber || "---",
              poQty: childMatch?.receivedQuantity ?? null,
              grnNumber: childMatch?.grnNumber || "---",
              remarks: `BOM item of ${part.part?.name || part.name || ""}`,
            };
          } else {
            return {
              partId: childPart.id,
              partNumber: childPart.partNumber || "",
              partName: childPart.name || "",
              part: {
                partNumber: childPart.partNumber || "",
                name: childPart.name || "",
              },
              qtyAvailable: 0,
              quantity: 0,
              trackingType: trackingTypeStr,
              uniqueId: `${childPart.id}-${Date.now()}-${Math.random()}`,
              issueQuantity: "",
              trackingNumber: childMatch?.trackingId || "",
              poNumber: childMatch?.poNumber || "---",
              poQty: childMatch?.receivedQuantity ?? null,
              grnNumber: childMatch?.grnNumber || "---",
              remarks: `BOM item of ${part.part?.name || part.name || ""} (Out of Stock)`,
            };
          }
        });

        allNewItems = [...allNewItems, ...childEntries];
      }
    } catch (error) {
      console.error("Failed to fetch BOM parts:", error);
    }

    // Deduplicate: skip parts whose partId is already in selectedStockItems
    const existingPartIds = new Set(selectedStockItems.map((i) => i.partId));
    const dedupedNewItems = allNewItems.filter(
      (i) => !existingPartIds.has(i.partId),
    );

    setSelectedStockItems((prev) => [...prev, ...dedupedNewItems]);

    // Fetch tracking options for all items (parent + children) that require tracking and were actually added, in parallel
    const itemsToFetch = dedupedNewItems.filter(
      (item) =>
        item.trackingType?.toLowerCase() !== "none" &&
        item.trackingType !== "None",
    );

    if (itemsToFetch.length > 0) {
      try {
        const results = await Promise.all(
          itemsToFetch.map(async (item) => {
            try {
              const res = await fetchInPartsTrackingIdsById(
                item.partId,
                formData.movementType?.name || "",
              );
              const rawIds = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res)
                  ? res
                  : [];
              const stockTrackingId = item.trackingNumber || item.trackingId;
              if (stockTrackingId && !rawIds.includes(stockTrackingId)) {
                rawIds.push(stockTrackingId);
              }
              const options = rawIds.map((id) => ({
                label: id,
                value: id,
              }));
              return { uniqueId: item.uniqueId, options };
            } catch (err) {
              console.error(
                `Failed to fetch tracking IDs for part ${item.partId}:`,
                err,
              );
              const stockTrackingId = item.trackingNumber || item.trackingId;
              const options = stockTrackingId
                ? [{ label: stockTrackingId, value: stockTrackingId }]
                : [];
              return { uniqueId: item.uniqueId, options };
            }
          }),
        );

        // Update trackingOptionsMap state for all fetched items
        setTrackingOptionsMap((prev) => {
          const updated = { ...prev };
          results.forEach((res) => {
            if (res) {
              updated[res.uniqueId] = res.options;
            }
          });
          return updated;
        });

        // Auto-select tracking number if there are options available and no trackingNumber is set yet
        // And resolve PO/GRN details from the resolved purchase history
        setSelectedStockItems((prev) =>
          prev.map((item) => {
            const match = results.find((r) => r.uniqueId === item.uniqueId);
            if (match && match.options.length > 0 && !item.trackingNumber) {
              const selectedValue = match.options[0].value;
              const history = localHistoryMap[item.partId] || [];
              const histMatch = history.find(
                (x) => x.trackingId === selectedValue,
              );
              return {
                ...item,
                trackingNumber: selectedValue,
                poNumber: histMatch?.poNumber || "---",
                poQty: histMatch?.receivedQuantity ?? null,
                grnNumber: histMatch?.grnNumber || "---",
              };
            }
            return item;
          }),
        );
      } catch (err) {
        console.error("Error fetching tracking IDs for selection:", err);
      }
    }
  };

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

  useEffect(() => {
    fetchStockLocations(formData?.fromLocation?.id);
  }, [formData.fromLocation]);

  const fetchStockLocations = async (id) => {
    if (!id) return;

    setLoadingStockData(true);
    try {
      const data = await fetchInventoryStockByLocation(id);

      const stock = data || [];
      setStockData(stock);
    } catch (err) {
      Alert("Failed to fetch locations", "error");
    } finally {
      setLoadingStockData(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Pre-populate line items when initialParts are passed (e.g. from Parts Inventory page).
  // Waits until movement type is selected, location stock data is ready, then calls handleSelectItem for each part.
  useEffect(() => {
    if (
      initialParts.length > 0 &&
      formData.movementType !== null &&
      !loadingStockData &&
      formData.fromLocation !== null &&
      !prePopulatedRef.current
    ) {
      prePopulatedRef.current = true;
      const populate = async () => {
        for (const part of initialParts) {
          await handleSelectItem(part);
        }
      };
      populate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParts, formData.movementType, loadingStockData, formData.fromLocation]);

  const fetchLocations = async () => {
    setLoadingLocationData(true);
    try {
      const data = await fetchLocationsLookUp();
      setLocationsData(data || []);
    } catch {
      Alert("Failed to fetch locations", "error");
    } finally {
      setLoadingLocationData(false);
    }
  };

  const handleExpectedReturnDateChange = (value) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        expectedReturnDate: value,
      };

      const error = validateExpectedReturnDate(
        updated.movementDate,
        updated.expectedReturnDate,
      );

      setFormErrors((prevErrors) => ({
        ...prevErrors,
        expectedReturnDate: error,
      }));

      return updated;
    });
  };

  const handleUpdateField = async (key, value) => {
    const RESTRICTED_KEYS = {
      movementType: "Movement Type",
      fromLocation: "Location",
      bin: "Bin",
    };

    const hasLineItems = selectedStockItems.length > 0;
    const isRestrictedKey = Object.prototype.hasOwnProperty.call(
      RESTRICTED_KEYS,
      key,
    );

    if (hasLineItems && isRestrictedKey) {
      // If parts were auto-populated from inventory and user is just changing movement type,
      // skip confirmation — the parts will re-populate automatically with the new type.
      const skipConfirmation = key === "movementType" && initialParts.length > 0 && prePopulatedRef.current;

      if (!skipConfirmation) {
        const fieldLabel = RESTRICTED_KEYS[key];
        const confirmed = await showConfirmation(
          `Change ${fieldLabel}?`,
          "This will clear all selected stock items.",
          "Yes, Clear & Continue",
        );
        if (!confirmed) return;
      }

      setSelectedStockItems([]);
      setTrackingOptionsMap({});
      if (key === "movementType" && initialParts.length > 0) {
        prePopulatedRef.current = false;
        Alert("Parts cleared. Select a new Movement Type to re-populate them.", "info");
      }
    }

    const REQUIRED_FIELDS = {
      movementType: "Movement Type is required",
      fromLocation: "From Location is required",
      movementDate: "Movement Date is required",
      reason: "Reason is required",
    };

    if (key === "project") {
      setFormData((prev) => ({ ...prev, subProject: null }));
      fetchSubProjectsData(value?.id || null);
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [key]: value,
      };

      setFormErrors((prevErrors) => {
        const errors = { ...prevErrors };

        if (REQUIRED_FIELDS[key]) {
          if (!value) {
            errors[key] = REQUIRED_FIELDS[key];
          } else {
            delete errors[key];
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

      return updatedData;
    });
  };

  const validate = () => {
    const errors = {};

    if (!formData.movementType) {
      errors.movementType = "Movement Type is required";
    }
    if (!formData.fromLocation) {
      errors.fromLocation = "Location is required";
    }
    if (!formData.movementDate) {
      errors.movementDate = "Movement Date is required";
    }
    if (!formData.reason) {
      errors.reason = "Reason is required";
    }
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

  const runAllValidations = () => {
    const error = validate();
    if (error) return error;

    const expectedDateError = validateExpectedReturnDate(
      formData.movementDate,
      formData.expectedReturnDate,
    );
    if (expectedDateError) return expectedDateError;

    if (selectedStockItems.length === 0) {
      return "Select at least one item";
    }

    const hasPositiveQty = selectedStockItems.some(
      (item) => Number(item.issueQuantity) > 0,
    );
    if (!hasPositiveQty) {
      return "At least one item must have a quantity greater than 0";
    }

    let hasLineItemErrors = false;

    selectedStockItems.forEach((item) => {
      const issueQtyError = validateIssueQuantity(item);
      const trackingError = validateTrackingNumber(item, selectedStockItems);
      const adjustmentTypeError =
        formData.movementType?.name === "Adjustment"
          ? validateAdjustmentType(item)
          : "";

      updateLineItemError(item.uniqueId, "issueQuantity", issueQtyError);
      updateLineItemError(item.uniqueId, "trackingNumber", trackingError);
      updateLineItemError(item.uniqueId, "adjustmentType", adjustmentTypeError);

      if (issueQtyError || trackingError || adjustmentTypeError) {
        hasLineItemErrors = true;
      }
    });

    if (hasLineItemErrors) {
      return "Fix line item errors";
    }

    return null;
  };

  const buildPayload = () => ({
    id: draftId || undefined,
    movementType: formData.movementType?.name,
    movementDate: formData.movementDate,
    fromLocationId: formData.fromLocation?.id,
    assignedUserId: formData.responsiblePerson?.id,
    expectedReturnDate: formData.expectedReturnDate || null,
    movementReason: formData.reason || "",
    notes: formData.description || "",
    department: formData?.department?.name,
    projectId: formData?.project?.id,
    subProjectId: formData?.subProject?.id,
    lineItems: selectedStockItems
      .filter((item) => {
        const qty = Number(item.issueQuantity);
        return !isNaN(qty) && qty > 0;
      })
      .map((item) => ({
        partId: item.partId,
        quantity: Number(item.issueQuantity),
        trackingId: item.trackingNumber,
        trackingType: item.trackingType,
        reason: item.remarks || "",
        adjustmentType:
          formData.movementType?.name === "Adjustment"
            ? item.adjustmentType || ""
            : null,
      })),
  });

  const handleSubmit = async () => {
    const validationError = runAllValidations();
    if (validationError) {
      Alert(validationError, "error");
      return;
    }

    setLoadingData(true);
    try {
      await submitSMWithLineItems(buildPayload());
      Alert("Stock movement created successfully", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      Alert("Failed to create stock movement", "error");
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveDraft = async () => {
    const validationError = runAllValidations();
    if (validationError) {
      Alert(validationError, "error");
      return;
    }

    setLoadingData(true);
    try {
      const res = await createSMWithLineItems(buildPayload());
      if (res?.id) setDraftId(res.id);
      Alert("Draft saved successfully", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      Alert("Failed to save draft", "error");
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
      valueGetter: (_, row) => row?.part?.partNumber || row?.partNumber || "",
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
      valueGetter: (_, row) => row?.part?.name || row?.partName || "",
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
    {
      field: "qtyAvailable",
      headerName: "Available Qty",
      flex: 0.3,
      type: "number",
    },
    {
      field: "trackingType",
      headerName: "Tracking Type",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Serial", "Batch", "None"],
    },
    {
      field: "trackingNumber",
      headerName: "Tracking ID",
      flex: 1,
      renderCell: ({ row }) => {
        const errorMsg = lineItemErrors[row.uniqueId];
        const trackingType =
          row.trackingType?.value || row.trackingType?.toLowerCase();

        if (trackingType === "none") {
          return <div>---</div>;
        }

        const allOptions = trackingOptionsMap[row.uniqueId] || [];

        const finalOptions = [...allOptions];
        if (
          row.trackingNumber &&
          !finalOptions.some((opt) => opt.value === row.trackingNumber)
        ) {
          finalOptions.push({
            label: row.trackingNumber,
            value: row.trackingNumber,
          });
        }

        const selectedForPart = selectedStockItems
          .filter(
            (item) =>
              item.partId === row.partId && item.uniqueId !== row.uniqueId,
          )
          .map((item) => item.trackingNumber)
          .filter(Boolean);

        const filteredOptions = finalOptions.filter((opt) => {
          if (opt.value === row.trackingNumber) return true;

          return !selectedForPart.includes(opt.value);
        });

        const selectedOption =
          filteredOptions.find((opt) => opt.value === row.trackingNumber) ||
          null;

        return (
          <div style={{ width: "100%" }}>
            <Autocomplete
              fullWidth
              options={filteredOptions}
              value={selectedOption}
              onChange={(_, newValue) =>
                handleTrackingNumberChange(row.uniqueId, newValue?.value || "")
              }
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, value) =>
                option.value === value?.value
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Tracking ID"
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
                  fullWidth
                  required
                  error={Boolean(errorMsg?.trackingNumber)}
                  helperText={errorMsg?.trackingNumber || ""}
                />
              )}
            />
          </div>
        );
      },
    },

    {
      field: "issueQuantity",
      headerName: `${formData.movementType?.name || "Issue"} Qty`,
      flex: 0.3,
      type: "number",
      renderCell: ({ row }) => {
        const errorMsg = lineItemErrors[row.uniqueId];
        const isSerial = row?.trackingType?.toLowerCase() === "serial";

        return (
          <TextField
            size="small"
            fullWidth
            placeholder={`${formData.movementType?.name || "Issue"} Qty`}
            value={row.issueQuantity || ""}
            type="number"
            InputProps={{ readOnly: isSerial }}
            inputProps={{
              min: isSerial ? 1 : 0,
              max: row.quantity || 0,
            }}
            onChange={(e) =>
              handleIssueQuantityChange(row.uniqueId, e.target.value)
            }
            error={Boolean(errorMsg?.issueQuantity)}
            helperText={errorMsg?.issueQuantity || ""}
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
            required
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
            renderCell: ({ row }) => (
              <Autocomplete
                fullWidth
                options={adjustmentTypes}
                value={row.adjustmentType || null}
                onChange={(_, newValue) => {
                  setSelectedStockItems((prev) =>
                    prev.map((item) =>
                      item.uniqueId === row.uniqueId
                        ? { ...item, adjustmentType: newValue || "" }
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
            ),
          },
        ]
      : []),
    {
      field: "remarks",
      headerName: "Reason",
      flex: 1,
      renderCell: ({ row, value }) => (
        <div onClick={(e) => handleRemarksPopoverOpen(row, e)}>
          <div>{value || "Click to edit"}</div>
        </div>
      ),
    },
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
  ];

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Stock Movement</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline" />
        </button>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>

            {initialParts.length > 0 && formData.movementType === null && (
              <div className="sm-preselect-callout">
                <ion-icon name="layers-outline" class="sm-preselect-icon" />
                <div className="sm-preselect-text">
                  <span className="sm-preselect-count">
                    {initialParts.length} part
                    {initialParts.length > 1 ? "s" : ""}
                  </span>
                  <span className="sm-preselect-hint">
                    {" "}
                    from inventory ready to add. Select a{" "}
                    <strong>Movement Type</strong> to continue.
                  </span>
                </div>
              </div>
            )}

            {/* <div className="stock-form-grid"> */}
            <div className="GrnNewFlyoutContentTop">
              <Autocomplete
                options={movementTypes}
                value={formData?.movementType}
                getOptionLabel={(o) => o.name || ""}
                onChange={(_, v) => handleUpdateField("movementType", v)}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    label="Movement Type"
                    fullWidth
                    required
                    error={!!formErrors.movementType}
                    helperText={formErrors.movementType}
                  />
                )}
              />
              <Autocomplete
                options={locationsData}
                value={formData?.fromLocation}
                loading={loadingLocationData}
                loadingText="Loading Locations..."
                getOptionLabel={(o) => o.name || ""}
                onChange={(_, v) => handleUpdateField("fromLocation", v)}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    label="Location"
                    fullWidth
                    required
                    error={!!formErrors.fromLocation}
                    helperText={formErrors.fromLocation}
                  />
                )}
              />
            </div>
            <div className="GrnNewFlyoutContentTop">
              <Autocomplete
                options={projects}
                value={formData?.project}
                loading={loadingProjects}
                loadingText="Loading Projects..."
                getOptionLabel={(o) => `${o.projectCode} - ${o.name}` || ""}
                onChange={(_, v) => handleUpdateField("project", v)}
                renderInput={(p) => (
                  <TextField {...p} label="Project" fullWidth />
                )}
              />
              <Autocomplete
                options={subProjects}
                value={formData?.subProject}
                loading={loadingSubProjects}
                loadingText="Loading Sub-Projects..."
                disabled={!formData?.project}
                getOptionLabel={(o) => o.name || ""}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                onChange={(_, v) => handleUpdateField("subProject", v)}
                renderInput={(p) => (
                  <TextField {...p} label="Sub Project" fullWidth />
                )}
              />
            </div>
            <div className="GrnNewFlyoutContentTop">
              <TextField
                type="date"
                label="Transaction Date"
                value={formData?.movementDate}
                InputLabelProps={{ shrink: true }}
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
                  options={staffData}
                  value={formData?.responsiblePerson}
                  loading={loadingStaffData}
                  getOptionLabel={(o) => `${o.firstName} ${o.lastName}` || ""}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  onChange={(_, v) => handleUpdateField("responsiblePerson", v)}
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
                readOnly={items.length === 0 || !formData?.movementType}
                options={items.filter((item) => {
                  const isSelected = selectedStockItems.some(
                    (i) => i.partId === item.partId,
                  );
                  return !isSelected;
                })}
                loading={loadingStockData}
                loadingText="Loading Inventory Parts..."
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

          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button className="CancelButton" onClick={handleSaveDraft}>
              Save as Draft
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </div>
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

export default NewStockMovements;
