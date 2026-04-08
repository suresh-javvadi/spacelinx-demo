import React, { useContext, useEffect, useState } from "react";
import { Autocomplete, Button, FormHelperText, TextField } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { fetchLocationsLookUp } from "../../../services/locationService";
import {
  createSMWithLineItems,
  createStockMovement,
  submitSMWithLineItems,
} from "../../../services/stockMovementService";
import {
  fetchInPartsTrackingIdsById,
  fetchInventoryPartsByLocation,
} from "../../../services/inventoryPartService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchUserLookup } from "../../../services/userService";
import Popover from "@mui/material/Popover";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { fetchProjectsLookup } from "../../../services/projectService";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";

const NewStockMovements = ({ handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingLocationData, setLoadingLocationData] = useState(false);
  const [locationsData, setLocationsData] = useState([]);
  const [movementTypes, setMovementTypes] = useState([
    { id: 2, name: "Reserved" },
    { id: 3, name: "Issued" },
    { id: 4, name: "Consumed" },
    { id: 5, name: "Adjustment" },
  ]);
  const [formData, setFormData] = useState({
    movementType: null,
    fromLocation: null,
    bin: null,
    responsiblePerson: null,
    movementDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    description: "",
    reason: "",
    department: "",
    project: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [binsData, setBinsData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [loadingStaffData, setLoadingStaffData] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [loadingStockData, setLoadingStockData] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedStockItems, setSelectedStockItems] = useState([]);
  const [lineItemErrors, setLineItemErrors] = useState({});
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
  const [trackingOptionsMap, setTrackingOptionsMap] = useState({});
  const selectedTrackingNumbers = React.useMemo(() => {
    return selectedStockItems
      .map((item) => item.trackingNumber)
      .filter(Boolean);
  }, [selectedStockItems]);

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
    const trackingType = item.trackingType?.value;

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
        i.trackingNumber?.trim() === value.trim(),
    );

    if (isDuplicate) {
      return "Tracking ID already used";
    }

    return "";
  };

  const validateTrackingType = (item) => {
    if (!item.trackingType || !item.trackingType.value) {
      return "Tracking Type is required";
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
              issueQuantity: isSerial ? 1 : "",
              trackingNumber: isSerial ? item.trackingNumber : "",
            }
          : item,
      ),
    );

    const item = selectedStockItems.find((i) => i.uniqueId === uniqueId);

    if (!item) return;

    // ✅ REQUIRED validation
    const trackingTypeError = validateTrackingType({
      ...item,
      trackingType: value,
    });
    updateLineItemError(uniqueId, "trackingType", trackingTypeError);

    if (isSerial) {
      const qtyError = validateIssueQuantity({
        ...item,
        issueQuantity: 1,
      });
      updateLineItemError(uniqueId, "issueQuantity", qtyError);
    } else {
      updateLineItemError(uniqueId, "issueQuantity", "");
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

    const isSerial = part.trackingType?.toLowerCase() === "serial";
    const uniqueId = `${part.partId}-${Date.now()}`;

    const newEntry = {
      ...part,
      uniqueId: `${part.partId}-${Date.now()}`,
      issueQuantity: isSerial ? 1 : "",
      trackingNumber: "",
      remarks: "",
    };

    setSelectedStockItems((prev) => [...prev, newEntry]);

    if (part.trackingType?.toLowerCase() === "none") return;

    try {
      const res = await fetchInPartsTrackingIdsById(
        part.partId,
        formData.movementType?.name || "",
      );

      const rawIds = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      const options = rawIds.map((id) => ({
        label: id,
        value: id,
      }));

      setTrackingOptionsMap((prev) => ({
        ...prev,
        [uniqueId]: options,
      }));

      if (options.length === 1) {
        setSelectedStockItems((prev) =>
          prev.map((item) =>
            item.uniqueId === uniqueId
              ? { ...item, trackingNumber: options[0].value }
              : item,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to fetch tracking IDs", err);
      setTrackingOptionsMap((prev) => ({
        ...prev,
        [uniqueId]: [],
      }));
    }
  };

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

    setItems(filteredStock);
  }, [formData.bin, stockData]);

  const extractBins = (stockData = []) => {
    const map = new Map();

    stockData.forEach((item) => {
      if (item.binId && item.binCode) {
        map.set(item.binId, {
          binId: item.binId,
          binCode: item.binCode,
        });
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

  useEffect(() => {
    fetchStockLocations(formData?.fromLocation?.id);
  }, [formData.fromLocation]);

  const fetchStockLocations = async (id) => {
    if (!id) return;

    setLoadingStockData(true);
    try {
      const data = await fetchInventoryPartsByLocation(id);

      const stock = data || [];
      setStockData(stock);

      setBinsData(extractBins(stock));
    } catch (err) {
      Alert("Failed to fetch locations", "error");
    } finally {
      setLoadingStockData(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

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
      const fieldLabel = RESTRICTED_KEYS[key];

      const confirmed = await showConfirmation(
        `Change ${fieldLabel}?`,
        "This will clear all selected stock items.",
        "Yes, Clear & Continue",
      );

      if (!confirmed) return;

      setSelectedStockItems([]);
      setTrackingOptionsMap({});
    }

    const REQUIRED_FIELDS = {
      movementType: "Movement Type is required",
      fromLocation: "From Location is required",
      movementDate: "Movement Date is required",
      reason: "Reason is required",
    };

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
    fromBinId: formData.bin?.binId,
    assignedUserId: formData.responsiblePerson?.id,
    expectedReturnDate: formData.expectedReturnDate || null,
    movementReason: formData.reason || "",
    notes: formData.description || "",
    department: formData?.department?.name,
    projectId: formData?.project?.id,
    lineItems: selectedStockItems.map((item) => ({
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
      valueGetter: (_, row) => row?.part?.partNumber || "",
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
      valueGetter: (_, row) => row?.part?.name || "",
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
        const trackingType = row.trackingType?.value;

        if (trackingType === "none") {
          return <div>---</div>;
        }

        const allOptions = trackingOptionsMap[row.uniqueId] || [];

        const filteredOptions = allOptions.filter((opt) => {
          if (opt.value === row.trackingNumber) return true;

          return !selectedTrackingNumbers.includes(opt.value);
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
                options={binsData}
                value={formData?.bin}
                getOptionLabel={(o) => o.binCode || ""}
                onChange={(_, v) => handleUpdateField("bin", v)}
                readOnly={binsData.length === 0}
                renderInput={(p) => <TextField {...p} label="Bin" fullWidth />}
              />
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
                  const totalIssued = getTotalIssuedQuantityForPart(
                    item.partId,
                  );
                  return totalIssued < item.qtyAvailable;
                })}
                loading={loadingStockData}
                loadingText="Loading Inventory Parts..."
                getOptionLabel={(option) =>
                  option
                    ? `${option?.part?.partNumber} - ${option?.part?.name} - ${option?.part?.manufacturingPartNumber}`
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
                      <div style={{ fontSize: "0.85rem" }}>
                        Part No: {option?.part?.partNumber}
                      </div>
                      <div style={{ fontSize: "0.85rem" }}>
                        Part Name: {option?.part?.name}
                      </div>
                      <div style={{ fontSize: "0.85rem" }}>
                        Manf. Part No: {option?.part?.manufacturingPartNumber}
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
