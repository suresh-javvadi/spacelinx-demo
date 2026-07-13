import React, { useState, useContext, useEffect, useRef } from "react";
import { TextField, Autocomplete, Box, Tab, Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  fetchPOLookUp,
  fetchPurchaseOrderwithId,
} from "../../../services/purchaseOrders";
import { createGoodReceiptNoteWithLineItems } from "../../../services/goodReceiptNoteService";
import dayjs from "dayjs";
import PODocuments from "../purchaseOrders/PODocuments";
import { fetchLocationsLookUp } from "../../../services/locationService";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../userContext/UserContext";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import Popover from "@mui/material/Popover";

const GRN_DRAFT_STORAGE_KEY = "new-good-receipt-note-draft";
const getInitialFormData = () => ({
  receivedDate: dayjs().format("YYYY-MM-DD"),
  description: "",
  locationId: "",
  reference: "",
  invoiceNumber: "",
  invoiceDate: dayjs().format("YYYY-MM-DD"),
  vendor: null,
});
const getInitialDraftState = () => {
  const defaultState = {
    editFlyOutTabsValue: "1",
    selectedPO: null,
    lineItems: [],
    selectedParts: [],
    formData: getInitialFormData(),
  };

  try {
    const savedDraft = sessionStorage.getItem(GRN_DRAFT_STORAGE_KEY);

    if (!savedDraft) {
      return defaultState;
    }

    const parsedDraft = JSON.parse(savedDraft);

    return {
      editFlyOutTabsValue: parsedDraft.editFlyOutTabsValue || "1",
      selectedPO: parsedDraft.selectedPO || null,
      lineItems: Array.isArray(parsedDraft.lineItems)
        ? parsedDraft.lineItems
        : [],
      selectedParts: Array.isArray(parsedDraft.selectedParts)
        ? parsedDraft.selectedParts
        : [],
      formData: {
        ...getInitialFormData(),
        ...(parsedDraft.formData || {}),
      },
    };
  } catch (error) {
    console.error("Failed to restore GRN draft:", error);
    sessionStorage.removeItem(GRN_DRAFT_STORAGE_KEY);
    return defaultState;
  }
};

const NewGoodReceiptNote = ({
  handleClose,
  handleRefresh,
  partsData,
  loadingPartsData,
  setLoadingPartsData,
  vendorsData,
  loadingVendorsData,
}) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const initialDraftStateRef = useRef(getInitialDraftState());
  const initialDraftState = initialDraftStateRef.current;
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState(
    initialDraftState.editFlyOutTabsValue,
  );
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(initialDraftState.selectedPO);
  const [lineItems, setLineItems] = useState(initialDraftState.lineItems);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [lineItemErrors, setLineItemErrors] = useState({});
  const [locationsData, setLocationsData] = useState([]);
  const [locationError, setLocationError] = useState(false);
  const [formData, setFormData] = useState(initialDraftState.formData);
  const [invoiceNumberError, setInvoiceNumberError] = useState(false);
  const [receivedDateError, setReceivedDateError] = useState(false);
  const [invoiceDateError, setInvoiceDateError] = useState(false);
  const [loadingPoData, setLoadingPoData] = useState(true);
  const [selectedParts, setSelectedParts] = useState(
    initialDraftState.selectedParts,
  );
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");
  const skipDraftSaveRef = useRef(false);

  const clearDraft = () => {
    sessionStorage.removeItem(GRN_DRAFT_STORAGE_KEY);
  };

  const resetForm = () => {
    skipDraftSaveRef.current = true;
    setEditFlyOutTabsValue("1");
    setSelectedPO(null);
    setLineItems([]);
    setDocumentFiles([]);
    setLineItemErrors({});
    setLocationError(false);
    setFormData(getInitialFormData());
    setInvoiceNumberError(false);
    setReceivedDateError(false);
    setInvoiceDateError(false);
    setSelectedParts([]);
    setValue(null);
    setInputValue("");
    setAnchorEl(null);
    setActiveRowId(null);
    setTempRemarks("");
  };

  const handleCancel = () => {
    clearDraft();
    resetForm();
    handleClose();
  };

  const trackingTypes = [
    { value: "serial", label: "Serial" },
    { value: "batch", label: "Batch" },
    { value: "none", label: "None" },
  ];

  const updateLineItemError = (uniqueId, field, error) => {
    setLineItemErrors((prev) => ({
      ...prev,
      [uniqueId]: {
        ...(prev[uniqueId] || {}),
        [field]: error,
      },
    }));
  };

  const handlePurchaseOrderChange = async (newValue) => {
    const hasParts = selectedParts.length > 0;
    if (!newValue) {
      if (hasParts) {
        const confirmClear = window.confirm(
          "You have selected parts. Clearing this PO will remove all parts. Continue?",
        );

        if (!confirmClear) {
          setSelectedPO(selectedPO);
          return;
        }
      }

      setSelectedPO(null);
      setLineItems([]);
      setSelectedParts([]);
      setLineItemErrors({});
      setFormData((prev) => ({ ...prev, vendor: null }));
      return;
    }
    if (hasParts) {
      const confirmClear = window.confirm(
        "You have selected parts. Changing the PO will remove all selected parts. Continue?",
      );

      if (!confirmClear) {
        setSelectedPO(selectedPO);
        return;
      }
    }

    setSelectedPO(newValue);
    setSelectedParts([]);
    setLineItems([]);
    setLineItemErrors({});

    const poLineItems = await loadPOLineItems(newValue.id);
    const autoPopulatedParts = poLineItems
      .map((item, index) => {
        const matchedPart = partsData.find((part) => part.id === item.partId);

        if (!matchedPart) {
          return null;
        }

        const isPart = !matchedPart.itemType || matchedPart.itemType === "Part";
        const isSerial = isPart && matchedPart.isSerialNumberRequired === true;
        const trackingTypeObj = isPart
          ? trackingTypes.find(
              (t) => t.value === (isSerial ? "serial" : "batch"),
            )
          : null;

        return {
          ...matchedPart,
          uniqueId: `${item.id || matchedPart.id}-${index}`,
          poLineItemId: item.id,
          pendingQuantity: item.pendingQuantity ?? 0,
          orderedQuantity: item.orderedQuantity ?? 0,
          receivedQuantity: isSerial ? 1 : "",
          trackingType: trackingTypeObj,
          trackingNumber: "",
          remarks: "",
          expectedDeliveryDate: item.expectedDeliveryDate ?? null,
          actualDeliveryDate: item.actualDeliveryDate ?? null,
          unitPrice: item.unitPrice ?? null,
          hsnCode: matchedPart.hsnCode || item.hsn || "",
        };
      })
      .filter(Boolean);

    setSelectedParts(autoPopulatedParts);

    const autoVendor = vendorsData.find((v) => v.id === newValue.companyId);

    setFormData((prev) => ({
      ...prev,
      vendor: autoVendor || null,
    }));
  };

  useEffect(() => {
    if (skipDraftSaveRef.current) {
      skipDraftSaveRef.current = false;
      return;
    }

    sessionStorage.setItem(
      GRN_DRAFT_STORAGE_KEY,
      JSON.stringify({
        editFlyOutTabsValue,
        selectedPO,
        lineItems,
        selectedParts,
        formData,
      }),
    );
  }, [editFlyOutTabsValue, selectedPO, lineItems, selectedParts, formData]);

  useEffect(() => {
    const defaultLocation = locationsData.find((loc) =>
      loc.name?.toLowerCase().includes("xdlinx"),
    );

    if (defaultLocation && !formData.locationId) {
      setFormData((prev) => ({
        ...prev,
        locationId: defaultLocation.id,
      }));
    }
  }, [locationsData, formData.locationId]);

  const handleSelectPart = (part) => {
    if (!part) return;

    const isPart = !part.itemType || part.itemType === "Part";
    const isSerial = isPart && part.isSerialNumberRequired === true;
    const trackingTypeObj = isPart
      ? trackingTypes.find((t) => t.value === (isSerial ? "serial" : "batch"))
      : null; // ✅ make it empty

    const newEntry = {
      ...part,
      uniqueId: `${part.poLineItemId || part.id}-${Date.now()}`,
      trackingType: trackingTypeObj,
      receivedQuantity: isSerial ? 1 : "",
      trackingNumber: "",
      remarks: "",
    };

    setSelectedParts((prev) => [...prev, newEntry]);
  };

  const filteredParts =
    lineItems.length === 0
      ? partsData.map((part) => ({
          ...part,
          pendingQuantity: null,
        }))
      : lineItems
          .map((item) => {
            const matchedPart = partsData.find(
              (part) => part.id === item.partId,
            );

            if (!matchedPart) {
              return null;
            }

            return {
              ...matchedPart,
              poLineItemId: item.id,
              pendingQuantity: item.pendingQuantity ?? 0,
              orderedQuantity: item.orderedQuantity ?? 0,
              receivedQuantity: item.receivedQuantity ?? 0,
              expectedDeliveryDate: item.expectedDeliveryDate ?? null,
              actualDeliveryDate: item.actualDeliveryDate ?? null,
              unitPrice: item.unitPrice ?? null,
            };
          })
          .filter(Boolean);

  const receivedQtyMap = selectedParts.reduce((acc, item) => {
    const key = item.poLineItemId || item.id;
    acc[key] = (acc[key] || 0) + Number(item.receivedQuantity || 0);
    return acc;
  }, {});

  const availableParts =
    lineItems.length === 0
      ? filteredParts
      : filteredParts.filter((part) => {
          const pending = Number(part.pendingQuantity || 0);
          const used = receivedQtyMap[part.poLineItemId || part.id] || 0;

          return used < pending;
        });

  const serialAvailableParts = selectedPO
    ? availableParts.filter((p) => p.isSerialNumberRequired === true)
    : [];

  const newFlyoutTabChange = (event, newValue) =>
    setEditFlyOutTabsValue(newValue);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoadingData(true);
    try {
      const data = await fetchLocationsLookUp();
      setLocationsData(data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      Alert("Failed to fetch locations", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const loadPOLookup = async () => {
      setLoadingPoData(true);
      try {
        const data = await fetchPOLookUp();
        const approvedPOs = Array.isArray(data)
          ? data.filter(
              (po) =>
                po.status === "Issued" ||
                po.status === "Partially Delivered" ||
                po.status == "Billed" ||
                po.status === "Partially Billed",
            )
          : [];
        const sortedData = approvedPOs.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
        );
        setPurchaseOrders(sortedData);
      } catch {
        Alert("Failed to fetch purchase orders", "error");
      } finally {
        setLoadingPoData(false);
      }
    };
    loadPOLookup();
  }, []);

  const loadPOLineItems = async (poId) => {
    setLoadingPartsData(true);
    try {
      const data = await fetchPurchaseOrderwithId(poId);
      const items = Array.isArray(data?.poLineItems) ? data.poLineItems : [];

      const filteredItems = items
        .filter((item) => Number(item.pendingQuantity) !== 0)
        .map((item) => ({
          ...item,
          receivedQuantity: 0,
          originalReceivedQuantity: 0,
        }));

      setLineItems(filteredItems);
      return filteredItems;
    } catch {
      Alert("Failed to fetch PO line items", "error");
      setLineItems([]);
      return [];
    } finally {
      setLoadingPartsData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "invoiceNumber") {
      setInvoiceNumberError("");
    }
    if (name === "receivedDate") {
      setReceivedDateError("");
    }
    if (name === "invoiceDate") {
      setInvoiceDateError("");
    }
  };

  const handleRemarksPopoverOpen = (row, event) => {
    setActiveRowId(row.uniqueId);
    setTempRemarks(row.remarks || "");
    setAnchorEl(event.currentTarget);
  };

  const handleRemarksChange = (id, value) => {
    setSelectedParts((prev) =>
      prev.map((item) =>
        item.uniqueId === id ? { ...item, remarks: value } : item,
      ),
    );
  };

  const handleTrackingNumberChange = (uniqueId, value) => {
    setSelectedParts((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, trackingNumber: value } : item,
      ),
    );
    const trackingType = selectedParts.find(
      (item) => item.uniqueId === uniqueId,
    )?.trackingType;
    console.log(trackingType);
    if (trackingType?.value === "none") {
      return "";
    }

    let error = "";

    // Rule A: Required
    if (!value?.trim()) {
      error = "Tracking ID is required";
    }
    // Rule B: Only letters/numbers/hyphens
    else if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      error = "Only letters, numbers and hyphens allowed";
    }
    // Rule C: Duplicate check
    else {
      const isDuplicate = selectedParts.some(
        (item) =>
          item.uniqueId !== uniqueId &&
          item.trackingNumber?.trim() === value.trim(),
      );

      if (isDuplicate) {
        error = "Tracking ID already used";
      }
    }

    updateLineItemError(uniqueId, "trackingNumber", error);
  };

  const handleHsnCodeChange = (uniqueId, value) => {
    setSelectedParts((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, hsnCode: value } : item,
      ),
    );
  };

  const handleTrackingTypeChange = (uniqueId, value) => {
    const isSerial = value.value === "serial";

    setSelectedParts((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId
          ? {
              ...item,
              trackingType: value,
              receivedQuantity: isSerial ? 1 : "",
            }
          : item,
      ),
    );
    if (value.value === "none") {
      updateLineItemError(uniqueId, "trackingNumber", "");
      return;
    }

    // TrackingType validation (optional)
    updateLineItemError(uniqueId, "trackingType", "");

    // Reset quantity errors when switching
    updateLineItemError(uniqueId, "receivedQuantity", "");
  };

  const handleReceivedQuantityChange = (uniqueId, value) => {
    const parsed = value === "" ? "" : Number(value);

    setSelectedParts((prevItems) =>
      prevItems.map((item) =>
        item.uniqueId === uniqueId
          ? { ...item, receivedQuantity: parsed }
          : item,
      ),
    );

    // VALIDATION
    let error = "";

    if (parsed === "") {
      error = "Quantity is required";
    } else if (parsed < 1) {
      error = "Quantity must be at least 1";
    } else if (
      selectedPO &&
      parsed >
        Number(
          selectedParts.find((x) => x.uniqueId === uniqueId)?.pendingQuantity,
        )
    ) {
      error = "Cannot exceed pending quantity";
    }

    updateLineItemError(uniqueId, "receivedQuantity", error);
  };

  const handleCreateGRN = async () => {
    // FORM VALIDATIONS
    setLocationError(!formData?.locationId);
    setInvoiceNumberError(!formData?.invoiceNumber);
    setInvoiceDateError(!formData?.invoiceDate);
    setReceivedDateError(!formData?.receivedDate);

    const newErrors = {};
    const validLineItems = [];
    const payloadLineItems = [];

    selectedParts.forEach((item) => {
      let rowErrors = {
        receivedQuantity: "",
        trackingNumber: "",
        trackingType: "",
      };

      // ✅ ADD THIS LINE
      const isPart = !item.itemType || item.itemType === "Part";

      // Quantity validation
      if (item.receivedQuantity === "" || item.receivedQuantity === null) {
        rowErrors.receivedQuantity = "Quantity is required";
      } else if (Number(item.receivedQuantity) < 1) {
        rowErrors.receivedQuantity = "Quantity must be at least 1";
      } else if (
        selectedPO &&
        Number(item.receivedQuantity) > Number(item.pendingQuantity)
      ) {
        rowErrors.receivedQuantity = "Cannot exceed pending quantity";
      }

      // Tracking number validation
      if (!item.trackingNumber?.trim()) {
        if (item.trackingType) {
          rowErrors.trackingNumber = "Tracking ID is required";
        }
      }

      // ✅ FIXED validation
      if (isPart && !item.trackingType) {
        rowErrors.trackingType = "Tracking Type is required";
      }

      if (
        rowErrors.receivedQuantity ||
        rowErrors.trackingNumber ||
        rowErrors.trackingType
      ) {
        newErrors[item.uniqueId] = rowErrors;
      } else {
        validLineItems.push(item);
      }
    });

    // Only include items that have a positive quantity
    validLineItems.forEach((item) => {
      if (Number(item.receivedQuantity) > 0) {
        payloadLineItems.push(item);
      }
    });

    // Set error object into UI errors
    setLineItemErrors(newErrors);

    // At least one row must have >0 qty
    const hasAtLeastOneReceived = validLineItems.some(
      (item) => Number(item.receivedQuantity) > 0,
    );

    // ----- TAB 1 VALIDATION -----
    if (
      !formData?.locationId ||
      !formData?.invoiceNumber ||
      !formData?.invoiceDate ||
      !formData?.receivedDate ||
      Object.keys(newErrors).length > 0
    ) {
      Alert("Please fill all the required fields in GRN Details", "error");
      setEditFlyOutTabsValue("1");
      return;
    }
    if (selectedParts.length === 0) {
      Alert("Please select at least one part to proceed", "warning");
      setEditFlyOutTabsValue("1");
      return;
    }
    // ----- TAB 2 VALIDATION -----
    if (documentFiles.length === 0) {
      Alert("Please attach at least one document", "error");
      setEditFlyOutTabsValue("2");
      return;
    }

    // ----------------------------
    // ⭐ CREATE FINAL FORM DATA
    // ----------------------------
    const formDataPayload = new FormData();

    if (selectedPO) {
      formDataPayload.append("PurchaseOrderId", selectedPO?.id || null);
    }

    formDataPayload.append("ReceivedDate", formData.receivedDate);
    formDataPayload.append("InvoiceDate", formData.invoiceDate);
    formDataPayload.append("Notes", formData.description || "");
    formDataPayload.append("locationId", formData.locationId);
    formDataPayload.append("ReferenceNumber", formData.reference);
    formDataPayload.append("InvoiceNumber", formData.invoiceNumber);
    formDataPayload.append("VendorId", formData.vendor?.id || "");

    payloadLineItems.forEach((item, index) => {
      formDataPayload.append(`LineItems[${index}].partId`, item.id);

      if (item.poLineItemId) {
        formDataPayload.append(
          `LineItems[${index}].poLineItemId`,
          item.poLineItemId,
        );
      }

      formDataPayload.append(
        `LineItems[${index}].receivedQuantity`,
        item.receivedQuantity,
      );

      const isPart = !item.itemType || item.itemType === "Part";

      // ✅ Only send tracking fields for Parts
      if (isPart) {
        formDataPayload.append(
          `LineItems[${index}].trackingMethod`,
          item.trackingType?.label || "",
        );

        formDataPayload.append(
          `LineItems[${index}].trackingId`,
          item.trackingNumber || "",
        );
      }

      formDataPayload.append(`LineItems[${index}].remark`, item.remarks || "");
      formDataPayload.append(`LineItems[${index}].hsnCode`, item.hsnCode || "");
    });

    documentFiles.forEach((doc, index) => {
      formDataPayload.append(
        `DocumentFiles[${index}].documentType`,
        doc.documentType || "",
      );

      if (doc.externalUrl) {
        formDataPayload.append(
          `DocumentFiles[${index}].externalUrl`,
          doc.externalUrl,
        );
        formDataPayload.append(
          `DocumentFiles[${index}].fileName`,
          doc.fileName || "",
        );
      } else {
        formDataPayload.append(
          `DocumentFiles[${index}].documentFile`,
          doc.documentFile,
        );
      }
    });

    try {
      setLoadingData(true);
      await createGoodReceiptNoteWithLineItems(formDataPayload);
      Alert("Goods Receipt Note created successfully", "success");
      clearDraft();
      handleRefresh();
      handleClose();
    } catch (error) {
      const message = error.response?.data?.message || "";
      const trackingMismatch = message.match(
        /Part ([a-f0-9-]+) already has Tracking Type as (\w+)/i,
      );

      if (trackingMismatch) {
        const partId = trackingMismatch[1];
        const correctType = trackingMismatch[2].toLowerCase();
        const correctTrackingTypeObj = trackingTypes.find(
          (t) => t.value === correctType,
        );

        setSelectedParts((prev) =>
          prev.map((p) =>
            p.id === partId && correctTrackingTypeObj
              ? { ...p, trackingType: correctTrackingTypeObj }
              : p,
          ),
        );

        const affectedPart = selectedParts.find((p) => p.id === partId);
        if (affectedPart) {
          updateLineItemError(
            affectedPart.uniqueId,
            "trackingType",
            `Tracking type corrected to "${correctTrackingTypeObj?.label || correctType}". Please resubmit.`,
          );
        }

        Alert(
          `Tracking type mismatch detected. The affected row has been highlighted — please review and resubmit.`,
          "warning",
        );
      } else {
        Alert(`Failed to create GRN: ${message}`, "error");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "serialNumber",
      headerName: "Item No.",
      minWidth: 50,
      renderCell: (params) =>
        (params.api.getRowIndexRelativeToVisibleRows(params.id) + 1) * 10,
    },
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Part Name",
      flex: 1,
    },
    {
      field: "hsnCode",
      headerName: "HSN Code",
      flex: 0.8,
      renderCell: ({ row }) => (
        <TextField
          size="small"
          fullWidth
          placeholder="HSN Code"
          value={row.hsnCode || ""}
          onChange={(e) => handleHsnCodeChange(row.uniqueId, e.target.value)}
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
      ),
    },
    {
      field: "trackingType",
      headerName: "Tracking Type",
      flex: 1,
      renderCell: ({ row }) => {
        const isPart = !row.itemType || row.itemType === "Part";
        if (!isPart) {
          return <span>---</span>; // ✅ empty block instead of dropdown
        }
        return (
          <div style={{ width: "100%" }}>
            <Autocomplete
              fullWidth
              options={trackingTypes}
              value={
                trackingTypes.find(
                  (t) => t.value === row.trackingType?.value,
                ) || null
              }
              disableClearable
              onChange={(_, newValue) =>
                handleTrackingTypeChange(row.uniqueId, newValue || "")
              }
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, value) =>
                option.value === value?.value
              }
              clearIcon
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Type"
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
                  required={isPart}
                  error={Boolean(lineItemErrors[row.uniqueId]?.trackingType)}
                  helperText={lineItemErrors[row.uniqueId]?.trackingType || ""}
                />
              )}
            />
          </div>
        );
      },
    },
    {
      field: "orderedQuantity",
      headerName: "Ordered Quantity",
      flex: 0.8,
      minWidth: 100,
      renderCell: ({ row }) => (
        <span>{row.orderedQuantity ?? row.OrderedQuantity ?? "-"}</span>
      ),
    },
    {
      field: "trackingNumber",
      headerName: "Tracking ID",
      flex: 1,
      renderCell: ({ row }) => {
        const errorMsg = lineItemErrors[row.uniqueId];
        const isPart = !row.itemType || row.itemType === "Part";
        const trackingType = row.trackingType;
        if (!isPart || !trackingType) {
          return <span>---</span>; // ✅ empty block
        }
        return (
          <TextField
            size="small"
            fullWidth
            placeholder="Tracking ID"
            value={row.trackingNumber || ""}
            onChange={(e) =>
              handleTrackingNumberChange(row.uniqueId, e.target.value)
            }
            error={Boolean(errorMsg?.trackingNumber)}
            helperText={errorMsg?.trackingNumber || ""}
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

    {
      field: "receivedQuantity",
      headerName: "Received Qty",
      flex: 0.8,
      minWidth: 100,
      renderCell: ({ row }) => {
        const isSerial = row.trackingType?.value === "serial";

        return (
          <TextField
            size="small"
            fullWidth
            type="number"
            InputProps={{ readOnly: isSerial }}
            inputProps={{
              min: isSerial ? 1 : 0,
              max: row.pendingQuantity,
            }}
            value={isSerial ? 1 : row.receivedQuantity}
            error={Boolean(lineItemErrors[row.uniqueId]?.receivedQuantity)}
            helperText={lineItemErrors[row.uniqueId]?.receivedQuantity || ""}
            onChange={(e) => {
              if (!isSerial) {
                handleReceivedQuantityChange(row.uniqueId, e.target.value);
              }
            }}
            sx={{
              "& .MuiInputBase-root": {
                height: 40,
                padding: "0 10px",
                borderRadius: "6px",
                marginTop: "4px",
              },
              "& input": {
                padding: "4px 6px !important",
                textAlign: "center",
                fontSize: "14px",
              },
              "& .MuiFormHelperText-root": {
                margin: 0,
                fontSize: "10px",
                whiteSpace: "normal",
              },
            }}
            required
          />
        );
      },
    },
    {
      field: "remarks",
      headerName: "Remarks",
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
      renderCell: ({ row }) => (
        <ion-icon
          name="trash-outline"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedParts((prev) =>
              prev.filter((item) => item.uniqueId !== row.uniqueId),
            );
          }}
        />
      ),
    },
  ];

  return (
    <div className="GrnNewFlyout">
      <div className="EditFlyoutHeader">
        <h3>Create Goods Receipt</h3>
        <div className="EditFlyoutHeaderIcons">
          <button onClick={handleClose}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      <TabContext value={editFlyOutTabsValue}>
        <div className="EditFlyoutTabsPanel">
          <TabList onChange={newFlyoutTabChange} centered variant="fullWidth">
            <Tab label="GRN Details" value="1" />
            <Tab label="Documents" value="2" />
          </TabList>
        </div>
        <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
          {loadingData && <Cliploader loading={loadingData} />}
          <TabPanel value="1" className="GrnNewFlyoutTabPanel">
            <div className="GrnNewFlyoutContent">
              <div className="GrnNewFlyoutContentTop">
                <Autocomplete
                  options={locationsData}
                  getOptionLabel={(option) => option.name || ""}
                  value={
                    locationsData.find(
                      (loc) => loc.id === formData.locationId,
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    const newLocationId = newValue?.id || "";

                    setFormData((prev) => ({
                      ...prev,
                      locationId: newLocationId,
                    }));

                    setLocationError(newLocationId === "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Location"
                      fullWidth
                      required
                      error={locationError}
                      helperText={
                        locationError ? "Please select a location" : ""
                      }
                    />
                  )}
                />

                <TextField
                  label="Received Date"
                  type="date"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  error={receivedDateError}
                  helperText={
                    receivedDateError ? "Received Date is required" : ""
                  }
                />
              </div>

              <div className="GrnNewFlyoutContentTop">
                <TextField
                  label="Invoice Number"
                  name="invoiceNumber"
                  className="AdminTextFeilds"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  required
                  error={invoiceNumberError}
                  helperText={
                    invoiceNumberError ? "Invoice number is required" : ""
                  }
                />
                <TextField
                  label="Invoice Date"
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  error={invoiceDateError}
                  helperText={
                    invoiceDateError ? "Received Date is required" : ""
                  }
                />
              </div>

              <div className="GrnNewFlyoutContentTop">
                <Autocomplete
                  options={purchaseOrders}
                  getOptionLabel={(option) => option.number || ""}
                  loading={loadingPoData}
                  loadingText="Loading POs..."
                  value={selectedPO}
                  onChange={(event, newValue) =>
                    handlePurchaseOrderChange(newValue)
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Purchase Order"
                      fullWidth
                    />
                  )}
                />

                <Autocomplete
                  value={formData.vendor || null}
                  onChange={(event, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      vendor: newValue || null,
                    }));
                  }}
                  options={vendorsData}
                  getOptionLabel={(option) =>
                    `${option.vendorCode} - ${option.name}` || ""
                  }
                  readOnly={Boolean(selectedPO)}
                  loading={loadingVendorsData}
                  loadingText="Loading Vendors..."
                  renderInput={(params) => (
                    <TextField {...params} label="Select Vendor" fullWidth />
                  )}
                />
              </div>

              <TextField
                label="Reference"
                name="reference"
                className="AdminTextFeilds"
                value={formData.reference}
                onChange={handleInputChange}
                fullWidth
              />

              {(!selectedPO || serialAvailableParts.length > 0) && (
                <Autocomplete
                  value={value}
                  onChange={(e, newValue) => {
                    handleSelectPart(newValue);
                    setValue(null);
                    setInputValue("");
                  }}
                  inputValue={inputValue}
                  onInputChange={(e, newInputValue) =>
                    setInputValue(newInputValue)
                  }
                  options={selectedPO ? serialAvailableParts : availableParts}
                  loading={loadingPartsData}
                  loadingText="Loading Parts..."
                  getOptionLabel={(option) =>
                    option
                      ? `${option.partNumber} - ${option.name} - ${option.manufacturingPartNumber}${option.poLineItemId ? ` - PO Qty ${option.orderedQuantity || 0} - Pending ${option.pendingQuantity || 0}` : ""}`
                      : ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    (option.poLineItemId || option.id) ===
                    (value?.poLineItemId || value?.id)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Part" fullWidth />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.poLineItemId || option.id}>
                      <div>
                        <strong>{option.name}</strong>
                        <div style={{ fontSize: "0.85rem" }}>
                          Part No: {option.partNumber}
                        </div>
                        <div style={{ fontSize: "0.85rem" }}>
                          Manf. Part No: {option.manufacturingPartNumber}
                        </div>
                        {option.poLineItemId ? (
                          <div style={{ fontSize: "0.85rem" }}>
                            Ordered: {option.orderedQuantity || 0} | Pending:{" "}
                            {option.pendingQuantity || 0}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  )}
                />
              )}

              <div className="GrnDataGridDiv">
                <StyledDataGrid
                  rows={selectedParts}
                  columns={columns}
                  getRowId={(row) => row.uniqueId}
                  disableRowSelectionOnClick
                  getRowHeight={(params) => {
                    const errorMsg = lineItemErrors[params.id];
                    return errorMsg ? "auto" : null;
                  }}
                  getRowClassName={(params) =>
                    lineItemErrors[params.id]?.trackingType
                      ? "row-tracking-error"
                      : ""
                  }
                  sx={{
                    "& .row-tracking-error": {
                      backgroundColor: "rgba(211, 47, 47, 0.08)",
                      "&:hover": {
                        backgroundColor: "rgba(211, 47, 47, 0.14)",
                      },
                    },
                  }}
                />
              </div>

              <TextField
                label="Remarks(Excess/Shortage/Damage)"
                name="description"
                className="AdminTextFeilds full-width"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
              />
            </div>

            <div className="GrnCreateFlyoutFooter">
              <Button onClick={handleCancel} className="CancelButton">
                Cancel
              </Button>
              <Button onClick={handleCreateGRN} disabled={loadingData}>
                Create
              </Button>
            </div>
          </TabPanel>
          <div
            className="GrnNewFlyoutTabPanelDocuments"
            style={{
              display: editFlyOutTabsValue === "2" ? "flex" : "none",
              flexDirection: "column",
            }}
          >
            <PODocuments
              onDocumentsChange={setDocumentFiles}
              showExistingDocuments={false}
              canView={hasPermission(PERMISSIONS.GOODSRECEIPTS.DOCUMENTS.VIEW)}
              canUpload={hasPermission(
                PERMISSIONS.GOODSRECEIPTS.DOCUMENTS.MODIFY,
              )}
              canDelete={
                hasPermission(PERMISSIONS.GOODSRECEIPTS.DOCUMENTS.DELETE) &&
                hasPermission(PERMISSIONS.GOODSRECEIPTS.DOCUMENTS.MODIFY)
              }
            />
            <div className="GrnCreateFlyoutFooter">
              <Button onClick={handleCancel} className="CancelButton">
                Cancel
              </Button>
              <Button onClick={handleCreateGRN} disabled={loadingData}>
                Create
              </Button>
            </div>
          </div>
        </div>
      </TabContext>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div className="EcoDataGridDesPopOver">
          <TextField
            label="Add Remarks"
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

export default NewGoodReceiptNote;
