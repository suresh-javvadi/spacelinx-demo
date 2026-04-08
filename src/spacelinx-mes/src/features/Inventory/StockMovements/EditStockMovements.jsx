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
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchUserLookup } from "../../../services/userService";
import Popover from "@mui/material/Popover";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { fetchProjectsLookup } from "../../../services/projectService";
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
  const [loadingLocationData, setLoadingLocationData] = useState(false);
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
  });
  const [formErrors, setFormErrors] = useState({});
  const [binsData, setBinsData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loadingStaffData, setLoadingStaffData] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [loadingStockData, setLoadingStockData] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedStockItems, setSelectedStockItems] = useState([]);
  const [lineItemErrors, setLineItemErrors] = useState({});
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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
        project: data.project ? { id: data.project } : null,
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
    } catch (error) {
      Alert("Failed to load stock movement details", "error");
      console.error("Error fetching stock movement:", error);
    } finally {
      setLoadingData(false);
    }
  };

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

  const fetchStockLocations = async (id) => {
    if (!id) return;
    setLoadingStockData(true);
    try {
      const data = await fetchInventoryStockByLocation(id);
      const stock = data || [];
      setStockData(stock);
      setBinsData(extractBins(stock));
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
      if (match) {
        setFormData((prev) => ({ ...prev, responsiblePerson: match }));
      }
    }
  }, [userData]);

  // Resolve project once projects are loaded
  useEffect(() => {
    if (projects.length > 0 && formData.project?.id) {
      const match = projects.find((p) => p.id === formData.project.id);
      if (match) {
        setFormData((prev) => ({ ...prev, project: match }));
      }
    }
  }, [projects]);

  // Resolve department once departments are loaded
  useEffect(() => {
    if (departments.length > 0 && formData.department?.name) {
      const match = departments.find(
        (d) => d.name === formData.department.name,
      );
      if (match) {
        setFormData((prev) => ({ ...prev, department: match }));
      }
    }
  }, [departments]);

  // Resolve location once locations are loaded
  useEffect(() => {
    if (locationsData.length > 0 && formData.fromLocation?.id) {
      const match = locationsData.find(
        (l) => l.id === formData.fromLocation.id,
      );
      if (match) {
        setFormData((prev) => ({ ...prev, fromLocation: match }));
      }
    }
  }, [locationsData]);

  // Filter parts based on bin and stock
  useEffect(() => {
    if (!stockData.length) {
      setItems([]);
      return;
    }
    let filteredStock = stockData;
    if (formData?.bin?.binId) {
      filteredStock = filteredStock.filter(
        (item) => item.binId === formData.bin.binId,
      );
    }
    filteredStock = filteredStock.filter((item) => item.qtyOnhand > 0);
    setItems(extractParts(filteredStock));
  }, [formData.bin, stockData]);

  const extractBins = (stockData = []) => {
    const map = new Map();
    stockData.forEach((item) => {
      if (item.binId && item.binCode) {
        map.set(item.binId, { binId: item.binId, binCode: item.binCode });
      }
    });
    return Array.from(map.values());
  };

  const extractParts = (stockData = []) => {
    const map = new Map();
    stockData.forEach((item) => {
      map.set(item.partId, {
        id: item.partId,
        partId: item.partId,
        partNumber: item.partNumber,
        partName: item.partName,
        name: item.partName,
        manufacturingPartNumber: item.manufacturingPartNumber || "",
        quantity: item.qtyOnhand,
        binId: item.binId,
        binCode: item.binCode,
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
          setBinsData([]);
        }
        updatedData.bin = null;
      }

      return updatedData;
    });
  };

  const handleSelectItem = (part) => {
    if (!part) return;
    const newEntry = {
      ...part,
      uniqueId: `${part.partId}-${Date.now()}`,
      trackingType: "",
      issueQuantity: "",
      trackingNumber: "",
      remarks: "",
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

  const handleTrackingNumberChange = (uniqueId, value) => {
    setSelectedStockItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId ? { ...item, trackingNumber: value } : item,
      ),
    );
    const item = selectedStockItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;
    const error = validateTrackingNumber(
      { ...item, trackingNumber: value },
      selectedStockItems,
    );
    updateLineItemError(uniqueId, "trackingNumber", error);
  };

  const handleTrackingTypeChange = (uniqueId, value) => {
    const isSerial = value?.value === "serial";
    setSelectedStockItems((prev) =>
      prev.map((item) =>
        item.uniqueId === uniqueId
          ? {
              ...item,
              trackingType: value,
              issueQuantity: isSerial ? 1 : item.issueQuantity,
            }
          : item,
      ),
    );
    const item = selectedStockItems.find((i) => i.uniqueId === uniqueId);
    if (!item) return;
    const trackingTypeError = validateTrackingType({
      ...item,
      trackingType: value,
    });
    updateLineItemError(uniqueId, "trackingType", trackingTypeError);
    if (isSerial) {
      const qtyError = validateIssueQuantity({ ...item, issueQuantity: 1 });
      updateLineItemError(uniqueId, "issueQuantity", qtyError);
    }
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
    const trackingType = item.trackingType?.value;
    if (trackingType === "none") return "";
    if (!value?.trim()) return "Tracking ID is required";
    if (!/^[a-zA-Z0-9-]+$/.test(value))
      return "Only letters, numbers and hyphens allowed";
    const isDuplicate = allItems.some(
      (i) =>
        i.uniqueId !== item.uniqueId &&
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
      lineItems: selectedStockItems.map((item) => ({
        partId: item.partId,
        quantity: Number(item.issueQuantity) || 0,
        trackingType: item.trackingType?.label || "",
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
      const { expectedReturnDate, ...rest } = prev;
      return rest;
    });
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
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
      type: "singleSelect",
      valueOptions: ["Serial", "Batch", "None"],
      renderCell: ({ row }) => {
        if (readOnlyMode) {
          return row.trackingType?.label || row.trackingType || "";
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
                  required
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
      label: "Responsible Person",
      value: formData.responsiblePerson?.firstName
        ? `${formData.responsiblePerson.firstName} ${formData.responsiblePerson.lastName}`
        : selectedMovement?.performedByFullName,
    },
    {
      label: "Department",
      value: formData.department?.name,
    },
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
            <div className="GrnNewFlyoutContentTop">
              <Autocomplete
                options={projects}
                value={formData?.project}
                loading={loadingProjects}
                loadingText="Loading Projects..."
                getOptionLabel={(o) =>
                  o ? `${o.projectCode} - ${o.name}` : ""
                }
                readOnly={readOnlyMode}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                onChange={(_, v) => handleUpdateField("project", v)}
                renderInput={(p) => (
                  <TextField {...p} label="Project" fullWidth />
                )}
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
                options={items.filter((item) => {
                  const totalIssued = getTotalIssuedQuantityForPart(
                    item.partId,
                  );
                  return totalIssued < item.quantity;
                })}
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
