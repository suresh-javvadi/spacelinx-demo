import React, { useEffect, useState, useContext } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Box,
  IconButton,
  Tooltip,
  Grid,
  Popover,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";

import {
  approveVendorReturnRequest,
  fetchVendorReturnRequestById,
  rejectVendorReturnRequest,
  submitVendorReturn,
  updateVendorReturnRequestById,
} from "../../../services/vendorReturnRequestService";

import { fetchPurchaseOrderwithId } from "../../../services/purchaseOrders";
import { fetchGRNDetailsById } from "../../../services/goodReceiptNoteService";

import DeleteIcon from "@mui/icons-material/Delete";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../userContext/UserContext";
import { fetchPartsLookUp } from "../../../services/partService";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

export default function EditVendorReturn({
  returnData,
  handleCloseClick,
  handleRefresh,
  sharedData,
}) {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [loadingData, setLoadingData] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form-level
  const [returnDate, setReturnDate] = useState(null);
  const [reason, setReason] = useState("");
  const [vendor, setVendor] = useState(null);
  const [po, setPo] = useState(null);
  const [grn, setGrn] = useState(null);
  const [location, setLocation] = useState(null);

  // Use shared data from parent
  const vendorList = sharedData.vendors || [];
  const locationList = sharedData.locations || [];
  const [raisedById, setRaisedById] = useState(null);

  // parts available for selection depending on mode (GRN/PO/Vendor)
  const [availableParts, setAvailableParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);

  // Grid (existing + newly added)
  const [lineItems, setLineItems] = useState([]);
  const [vendorReturnId, setVendorReturnId] = useState(null);
  const [status, setStatus] = useState(null); // DRAFT | IN_PROCESS
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [tempReason, setTempReason] = useState("");

  useEffect(() => {
    if (returnData) loadInitial();
  }, [returnData]);

  const loadInitial = async () => {
    setLoadingData(true);
    try {
      // 1) fetch return details
      const details = await fetchVendorReturnRequestById(returnData.id);
      setVendorReturnId(details.id);
      setStatus(details.status);
      setReadOnlyMode(details.status !== "DRAFT");

      // 2) Use shared vendor and location lists
      const vendorObj =
        vendorList.find((v) => v.id === details.vendorId) || null;
      const locObj =
        locationList.find((l) => l.id === details.locationId) || null;

      // 3) fetch po/grn if present
      let poObj = null;
      if (details.poId) {
        try {
          poObj = await fetchPurchaseOrderwithId(details.poId);
        } catch {
          poObj = null;
        }
      }

      let grnObj = null;
      if (details.grnId) {
        try {
          grnObj = await fetchGRNDetailsById(details.grnId);
        } catch {
          grnObj = null;
        }
      }

      setVendor(vendorObj);
      setPo(poObj);
      setGrn(grnObj);
      setLocation(locObj);

      setReturnDate(details.returnDate ? dayjs(details.returnDate) : null);
      setReason(details.reason || "");
      setRaisedById(details.raisedById || details.createdById || null);

      let partsSource = [];
      if (grnObj) {
        partsSource =
          (grnObj.grnLineItems || []).map((li) => ({
            id: li.id,
            partId: li.partId,
            partNumber: li.part?.partNumber || "",
            partName: li.part?.name || "",
            trackingType: li.part?.isSerialNumberRequired ? "Serial" : "None",
            availableQty: li.receivedQuantity ?? 0,
            grnLineItemId: li.id,
          })) || [];
      } else if (poObj) {
        partsSource =
          (poObj.poLineItems || []).map((li) => ({
            id: li.id,
            partId: li.partId,
            partNumber: li.part?.partNumber || "",
            partName: li.part?.name || "",
            trackingType: li.part?.isSerialNumberRequired ? "Serial" : "None",
            availableQty: li.orderedQuantity ?? 0,
            grnLineItemId: "",
          })) || [];
      } else if (details.vendorId) {
        // vendor mode
        try {
          const parts = await fetchPartsLookUp();
          partsSource =
            (parts || []).map((p) => ({
              id: p.id,
              partId: p.id,
              partNumber: p.partNumber || "",
              partName: p.name || "",
              trackingType: p.isSerialNumberRequired ? "Serial" : "None",
              availableQty: 999999,
              grnLineItemId: "",
            })) || [];
        } catch (err) {
          partsSource = [];
        }
      }

      setAvailableParts(partsSource);

      const mappedLineItems = (details.vendorReturnLineItems || []).map(
        (li) => {
          const foundInParts = partsSource.find((p) => p.partId === li.partId);

          return {
            id: li.id,
            partId: li.partId,
            partNumber: li.part?.partNumber || foundInParts?.partNumber || "",
            partName: li.part?.name || foundInParts?.partName || "",

            trackingType:
              li.trackingType || foundInParts?.trackingType || "None",

            trackingId: li.trackingId || "",
            availableQty: foundInParts?.availableQty ?? 0,
            grnLineItemId: li.grnLineItemId || "",
            returnQty: li.returnQuantity ?? "",
            lineItemReason: li.reason || "",
            isNew: false,
            originalId: li.id,
          };
        },
      );

      setLineItems(mappedLineItems);
    } catch (err) {
      console.error("Load initial failed:", err);
      Alert("Failed to load vendor return details", "error");
    } finally {
      setLoadingData(false);
    }
  };

  // ------------ Add part (from select) - Same as NewVendorReturn ------------
  const handleAddPart = () => {
    if (!selectedPart) {
      Alert("Select a part to add", "warning");
      return;
    }

    // Check if part is already added
    if (lineItems.find((r) => r.partId === selectedPart.partId)) {
      Alert("Part already added", "warning");
      return;
    }

    const newRow = {
      id: `new-${selectedPart.partId}-${Date.now()}`,
      partId: selectedPart.partId,
      partNumber: selectedPart.partNumber,
      partName: selectedPart.partName,
      trackingType: selectedPart.trackingType || "none",
      availableQty: selectedPart.availableQty,
      grnLineItemId: selectedPart.grnLineItemId || "",
      returnQty: selectedPart.trackingType === "serial" ? 1 : "",
      lineItemReason: "",
      isNew: true,
    };

    setLineItems((prev) => [...prev, newRow]);
    setSelectedPart(null);
  };

  // ------------ Remove part ------------
  const handleRemoveRow = (id) => {
    setLineItems((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdate = async () => {
    // basic validations
    if (!lineItems || lineItems.length === 0) {
      Alert("Add at least one part", "warning");
      return;
    }
    for (const r of lineItems) {
      if (
        r.returnQty === "" ||
        r.returnQty === null ||
        Number.isNaN(Number(r.returnQty)) ||
        Number(r.returnQty) <= 0
      ) {
        Alert("All parts must have a valid return quantity", "warning");
        return;
      }
      if (Number(r.returnQty) > (r.availableQty ?? 0)) {
        Alert(
          `Return qty for ${r.partNumber || r.partId} exceeds available`,
          "warning",
        );
        return;
      }
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("VendorId", vendor?.id || "");
      fd.append("PoId", po?.id || "");
      fd.append("GrnId", grn?.id || "");
      fd.append(
        "ReturnDate",
        returnDate ? dayjs(returnDate).format("YYYY-MM-DD") : "",
      );
      fd.append("Reason", reason || "");
      fd.append("LocationId", location?.id || "");
      fd.append("RaisedById", raisedById);

      lineItems.forEach((item, idx) => {
        if (item.originalId) {
          fd.append(`VendorReturnLineItems[${idx}].id`, item.originalId);
        }

        fd.append(`VendorReturnLineItems[${idx}].partId`, item.partId);
        fd.append(
          `VendorReturnLineItems[${idx}].grnLineItemId`,
          item.grnLineItemId || "",
        );
        fd.append(
          `VendorReturnLineItems[${idx}].trackingType`,
          item.trackingType,
        );
        fd.append(
          `VendorReturnLineItems[${idx}].trackingId`,
          item.trackingId || "",
        );
        fd.append(
          `VendorReturnLineItems[${idx}].returnQuantity`,
          Number(item.returnQty),
        );
        fd.append(
          `VendorReturnLineItems[${idx}].reason`,
          item.lineItemReason || "",
        );
      });

      await updateVendorReturnRequestById(returnData.id, fd);
      Alert("Vendor Return updated successfully!", "success");
      handleRefresh();
      handleCloseClick();
    } catch (err) {
      console.error("Update failed:", err);
      Alert("Update failed", "error");
    } finally {
      setSaving(false);
    }
  };
  const handleSubmit = async () => {
    // ✅ validations — unchanged
    if (!lineItems || lineItems.length === 0) {
      Alert("Add at least one part", "warning");
      return;
    }

    for (const r of lineItems) {
      if (
        r.returnQty === "" ||
        r.returnQty === null ||
        Number.isNaN(Number(r.returnQty)) ||
        Number(r.returnQty) <= 0
      ) {
        Alert("All parts must have a valid return quantity", "warning");
        return;
      }

      if (Number(r.returnQty) > (r.availableQty ?? 0)) {
        Alert(
          `Return qty for ${r.partNumber || r.partId} exceeds available`,
          "warning",
        );
        return;
      }
    }

    setSaving(true);

    try {
      // ✅ STEP 1: SAVE latest changes (UPDATE)
      const fd = new FormData();
      fd.append("VendorId", vendor?.id || "");
      fd.append("PoId", po?.id || "");
      fd.append("GrnId", grn?.id || "");
      fd.append(
        "ReturnDate",
        returnDate ? dayjs(returnDate).format("YYYY-MM-DD") : "",
      );
      fd.append("Reason", reason || "");
      fd.append("LocationId", location?.id || "");
      fd.append("RaisedById", raisedById);

      lineItems.forEach((item, idx) => {
        if (item.originalId) {
          fd.append(`VendorReturnLineItems[${idx}].id`, item.originalId);
        }

        fd.append(`VendorReturnLineItems[${idx}].partId`, item.partId);
        fd.append(
          `VendorReturnLineItems[${idx}].grnLineItemId`,
          item.grnLineItemId || "",
        );
        fd.append(
          `VendorReturnLineItems[${idx}].trackingType`,
          item.trackingType,
        );
        fd.append(
          `VendorReturnLineItems[${idx}].trackingId`,
          item.trackingId || "",
        );
        fd.append(
          `VendorReturnLineItems[${idx}].returnQuantity`,
          Number(item.returnQty),
        );
        fd.append(
          `VendorReturnLineItems[${idx}].reason`,
          item.lineItemReason || "",
        );
      });

      await updateVendorReturnRequestById(returnData.id, fd);

      // ✅ STEP 2: SUBMIT (STATUS TRANSITION)
      await submitVendorReturn(returnData.id);

      Alert("Vendor Return submitted successfully!", "success");
      handleRefresh();
      handleCloseClick();
    } catch (err) {
      console.error("Submit failed:", err);
      Alert("Submit failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    const confirmed = await showConfirmation(
      "Approve Vendor Return?",
      "Are you sure you want to approve this Vendor Return?",
      "Yes, approve it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      await approveVendorReturnRequest(vendorReturnId);
      showAlert("success", "Approved", "Vendor Return approved successfully!");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error(error);
      showAlert("error", "Error", "Failed to approve Vendor Return.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReject = async () => {
    const confirmed = await showConfirmation(
      "Reject Vendor Return?",
      "Are you sure you want to reject this Vendor Return?",
      "Yes, reject it!",
    );

    if (!confirmed) return;

    setSaving(true);
    try {
      await rejectVendorReturnRequest(vendorReturnId);
      showAlert("warning", "Rejected", "Vendor Return rejected successfully!");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error(error);
      showAlert("error", "Error", "Failed to reject Vendor Return.");
    } finally {
      setSaving(false);
    }
  };
  const handleOpenReasonPopover = (event, params) => {
    setAnchorEl(event.currentTarget);
    setCurrentRowId(params.row.id);
    setTempReason(params.value || "");
  };

  const handleCloseReasonPopover = () => {
    setAnchorEl(null);
    setCurrentRowId(null);
    setTempReason("");
  };

  const handleSaveReason = () => {
    setLineItems((prev) =>
      prev.map((row) =>
        row.id === currentRowId
          ? { ...row, lineItemReason: tempReason.trim() }
          : row,
      ),
    );
    handleCloseReasonPopover();
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
    {
      field: "trackingType",
      headerName: "Tracking Type",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Serial", "Batch", "None"],
    },
    {
      field: "trackingId",
      headerName: "Tracking ID",
      flex: 1,
      renderCell: ({ row }) => {
        // READ-ONLY MODE
        if (readOnlyMode) {
          return row.trackingId || "---";
        }

        // Editable for both Serial AND Batch tracked parts
        if (row.trackingType === "none" || row.trackingType === "None") {
          return "---";
        }

        return (
          <TextField
            size="small"
            fullWidth
            value={row.trackingId || ""}
            placeholder={
              row.trackingType === "Serial"
                ? "Enter Serial Number"
                : "Enter Batch Number"
            }
            onChange={(e) => {
              const value = e.target.value;
              setLineItems((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, trackingId: value } : r,
                ),
              );
            }}
          />
        );
      },
    },

    {
      field: "returnQty",
      headerName: "Return Qty",
      flex: 1,
      renderCell: ({ row }) =>
        readOnlyMode ? (
          row.returnQty
        ) : (
          <TextField
            size="small"
            type="number"
            value={row.returnQty ?? ""}
            onChange={(e) => {
              const value = Number(e.target.value);

              if (value < 0) {
                Alert("Quantity cannot be negative", "warning");
                return;
              }
              if (value > row.availableQty) {
                Alert("Cannot exceed available quantity", "warning");
                return;
              }

              setLineItems((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, returnQty: value } : r,
                ),
              );
            }}
          />
        ),
    },
    {
      field: "lineItemReason",
      headerName: "Remarks",
      flex: 1,
      sortable: false,
      renderCell: ({ row, value }) => {
        if (readOnlyMode) {
          return value || "---";
        }

        return (
          <div
            onClick={(event) => handleOpenReasonPopover(event, { row, value })}
            style={{ cursor: "pointer", width: "100%" }}
          >
            {value || "Click to edit"}
          </div>
        );
      },
    },
  ];

  // Get parts that haven't been added yet
  const partsToSelect = availableParts.filter(
    (part) => !lineItems.find((r) => r.partId === part.partId),
  );

  if (loadingData || sharedData.loading) {
    return (
      <div className="loader-container">
        <Cliploader loading />
      </div>
    );
  }

  return (
    <div className="EditFlyout">
      {/* HEADER */}
      <div className="EditFlyoutHeader">
        <h3>{returnData?.returnNumber}</h3>

        <div className="icons-container">
          Status:{" "}
          <span
            className={
              status === "Submitted"
                ? "status-submitted"
                : status === "Approved"
                  ? "status-released"
                  : ""
            }
          >
            {status === "Draft" ? "" : status}
          </span>
          {status === "Draft" &&
            hasPermission(PERMISSIONS.VENDORRETURNS.MODIFY) && (
              <button onClick={() => setReadOnlyMode(false)}>
                <ion-icon name="create-outline"></ion-icon>
              </button>
            )}
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      <div className="CreateFlyoutBody">
        <Grid container spacing={2}>
          {/* Vendor */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Vendor"
              fullWidth
              value={vendor?.name || ""}
              inputProps={{ readOnly: true }}
            />
          </Grid>

          {/* PO */}
          {po && (
            <Grid item xs={12} md={6}>
              <TextField
                label="PO Number"
                fullWidth
                value={po?.number || ""}
                inputProps={{ readOnly: true }}
              />
            </Grid>
          )}

          {/* GRN */}
          {grn && (
            <Grid item xs={12} md={6}>
              <TextField
                label="GRN Number"
                fullWidth
                value={grn?.grnNumber || ""}
                inputProps={{ readOnly: true }}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            {readOnlyMode ? (
              <TextField
                label="Location"
                fullWidth
                value={location?.name || ""}
                inputProps={{ readOnly: true }}
              />
            ) : (
              <Autocomplete
                options={locationList}
                getOptionLabel={(l) => l.name ?? ""}
                value={location}
                onChange={(e, v) => setLocation(v)}
                renderInput={(params) => (
                  <TextField {...params} label="Location" />
                )}
              />
            )}
          </Grid>

          {/* Return Date */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Return Date"
                value={returnDate}
                onChange={(v) => setReturnDate(v)}
                disabled={readOnlyMode}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    inputProps: { readOnly: readOnlyMode },
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
        <TextField
          label="Reason for Return"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          inputProps={{ readOnly: readOnlyMode }}
        />

        {/* PART SELECT — FULL WIDTH */}
        <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 2 }}>
          <Autocomplete
            fullWidth
            options={partsToSelect}
            getOptionLabel={(p) =>
              `${p.partNumber || ""} - ${p.partName || ""}`
            }
            value={selectedPart}
            onChange={(e, v) => setSelectedPart(v)}
            disabled={readOnlyMode}
            renderInput={(params) => (
              <TextField {...params} label="Select Part" />
            )}
          />
          <Button
            variant="outlined"
            onClick={handleAddPart}
            disabled={readOnlyMode}
            sx={{ minWidth: 120 }}
          >
            + Add Part
          </Button>
        </Box>

        {/* GRID */}
        {lineItems.length > 0 && (
          <Box sx={{ height: 350, mb: 2 }}>
            <StyledDataGrid
              rows={lineItems}
              columns={columns}
              getRowId={(r) => r.id}
            />
          </Box>
        )}
      </div>

      {/* FOOTER */}
      {/* FOOTER */}
      {!readOnlyMode && (
        <div className="CreateFlyoutFooter">
          <Button
            className="CancelButton"
            onClick={() => {
              loadInitial();
              setReadOnlyMode(true);
            }}
            disabled={saving}
          >
            Cancel
          </Button>

          <>
            <Button variant="outlined" onClick={handleUpdate} disabled={saving}>
              {saving ? "Updating..." : "Update"}
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Submitting..." : "Submit"}
            </Button>
          </>
        </div>
      )}
      {status === "Submitted" &&
        hasPermission(PERMISSIONS.VENDORRETURNS.APPROVE) && (
          <div className="CreateFlyoutFooter">
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button onClick={handleReject}>Reject</Button>

              <Button onClick={handleApprove}>Approve</Button>
            </Box>
          </div>
        )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseReasonPopover}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div className="EcoDataGridDesPopOver">
          <TextField
            label="Add Remarks"
            multiline
            rows={4}
            fullWidth
            value={tempReason}
            onChange={(e) => setTempReason(e.target.value)}
            autoFocus
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Button onClick={handleSaveReason}>Save</Button>
          </Box>
        </div>
      </Popover>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
}
