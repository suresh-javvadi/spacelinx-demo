import {
  Button,
  TextField,
  Autocomplete,
  Box,
  Popover,
  Grid,
} from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { fetchPurchaseOrderwithId } from "../../../services/purchaseOrders";
import { fetchGRNDetailsById } from "../../../services/goodReceiptNoteService";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  createVendorReturnRequest,
  updateVendorReturnRequestById,
} from "../../../services/vendorReturnRequestService";
import { fetchPartsLookUp } from "../../../services/partService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import Cliploader from "../../../Components/Loaders/Cliploader";

export default function NewVendorReturn({
  handleCloseClick,
  handleRefresh,
  sharedData,
}) {
  const { Alert } = useContext(AlertsContext);

  const [mode, setMode] = useState(null);

  const [selectedGRN, setSelectedGRN] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Use shared data from parent
  const vendorList = sharedData.vendors || [];
  const locationList = sharedData.locations || [];
  const poList = sharedData.purchaseOrders || [];
  const grnList = sharedData.goodReceiptNotes || [];

  const [availableParts, setAvailableParts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [tempReason, setTempReason] = useState("");

  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    vendor: "",
  });
  const [vendorReturnId, setVendorReturnId] = useState(null);
  const [status, setStatus] = useState("Draft"); // backend truth

  // =============================================================
  // MODE 1: GRN selected → load GRN line items
  // =============================================================
  const handleSelectGRN = async (grn) => {
    if (!grn) {
      setSelectedGRN(null);
      setAvailableParts([]);
      setSelectedRows([]);
      return;
    }

    setMode("GRN");
    setSelectedGRN(grn);
    setSelectedPO(null);
    setSelectedPart(null);
    setSelectedRows([]);

    try {
      const details = await fetchGRNDetailsById(grn.id);

      const mapped = details.grnLineItems.map((item) => ({
        id: item.id,
        partId: item.partId,
        partNumber: item.part?.partNumber,
        partName: item.part?.name,
        trackingType: item.trackingMethod || "None",
        availableQty: item.receivedQuantity,
        grnLineItemId: item.id,
        trackingId: item.trackingId || "",
        returnQty: item.trackingMethod === "Serial" ? 1 : "",
        lineItemReason: "",
      }));

      setAvailableParts(mapped);

      // auto-fill location
      const loc = locationList.find((l) => l.id === details.locationId);
      if (loc) setSelectedLocation(loc);

      // fetch PO
      const poDetails = await fetchPurchaseOrderwithId(details.purchaseOrderId);
      setSelectedPO(poDetails);
      const vendorObj = vendorList.find((v) => v.id === poDetails.companyId);
      setSelectedVendor(vendorObj || null);
    } catch (e) {
      console.error(e);
    }
  };

  // =============================================================
  // MODE 2: PO selected → load PO line items
  // =============================================================
  const handleSelectPO = async (po) => {
    if (!po) {
      setSelectedPO(null);
      setAvailableParts([]);
      setSelectedRows([]);
      return;
    }

    if (!selectedGRN) setMode("PO");

    setSelectedPO(po);
    setSelectedPart(null);
    setSelectedRows([]);

    try {
      const details = await fetchPurchaseOrderwithId(po.id);

      const vendorObj = vendorList.find((v) => v.id === details.companyId);
      setSelectedVendor(vendorObj || null);

      let loc = null;
      if (details.deliveryAddressId) {
        loc = locationList.find((l) => l.id === details.deliveryAddressId);
      } else if (details.shippingAddressId) {
        loc = locationList.find((l) => l.id === details.shippingAddressId);
      }
      if (loc) setSelectedLocation(loc);

      const mapped = details.poLineItems.map((item) => ({
        id: item.id,
        partId: item.partId,
        partNumber: item.part?.partNumber,
        partName: item.part?.name,
        trackingType: item.part?.isSerialNumberRequired ? "Serial" : "None",
        availableQty: item.orderedQuantity,
        grnLineItemId: "",
        returnQty: 0,
      }));

      setAvailableParts(mapped);
    } catch (e) {}
  };

  // =============================================================
  // MODE 3: Vendor selected (no GRN/PO)
  // =============================================================
  const handleSelectVendorDirect = async (vendor) => {
    setSelectedVendor(vendor);
    setSelectedPart(null);
    setErrors((prev) => ({ ...prev, vendor: "" }));
    if (!vendor) {
      setAvailableParts([]);
      setSelectedRows([]);
      setMode(null);
      return;
    }

    // 🚫 If GRN or PO already selected, do nothing
    if (selectedGRN || selectedPO) return;

    // ✅ Vendor-first mode
    setMode("Vendor");

    try {
      const parts = await fetchPartsLookUp();

      const mapped = parts.map((p) => ({
        id: p.id, // ensure unique
        partId: p.id,
        partNumber: p.partNumber,
        partName: p.name,
        trackingType: p.isSerialNumberRequired ? "Serial" : "None",
        availableQty: 999999, // vendor-based return has no stock constraint
        grnLineItemId: "",
        trackingId: "",
        returnQty: "",
        lineItemReason: "",
      }));

      setAvailableParts(mapped);
    } catch (error) {
      console.error(error);
      Alert("Failed to load parts", "error");
    }
  };

  // ================== ADD PART ==================
  const handleAddPart = () => {
    if (!selectedPart) return Alert("Select a part", "warning");

    // Check if part is already added
    if (selectedRows.find((r) => r.id === selectedPart.id)) {
      return Alert("Part already added", "warning");
    }

    setSelectedRows((prev) => [
      ...prev,
      { ...selectedPart, returnQty: "", lineItemReason: "" },
    ]);

    setSelectedPart(null);
  };

  // ================== UPDATE RETURN QTY ==================
  const handleCellEdit = (params) => {
    const { id, field, value } = params;

    if (field === "returnQty") {
      const row = selectedRows.find((r) => r.id === id);
      const numValue = parseFloat(value) || 0;

      if (numValue < 0) {
        Alert("Quantity cannot be negative", "warning");
        return;
      }

      if (numValue > row.availableQty) {
        Alert("Cannot exceed available quantity", "warning");
        return;
      }

      setSelectedRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, returnQty: numValue } : r)),
      );
    }
  };

  // ================== REMOVE PART ==================
  const handleRemovePart = (id) => {
    setSelectedRows((prev) => prev.filter((r) => r.id !== id));
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
    setSelectedRows((prev) =>
      prev.map((row) =>
        row.id === currentRowId
          ? { ...row, lineItemReason: tempReason.trim() }
          : row,
      ),
    );

    handleCloseReasonPopover();
  };

  // ================== SUBMIT ==================
  // const handleCreateVendorReturn = async () => {
  //   if (!selectedVendor) {
  //     setErrors({ vendor: "Vendor is required" });
  //     return;
  //   }

  //   if (selectedRows.length === 0)
  //     return Alert("Add at least one part to return", "warning");

  //   const hasInvalidQty = selectedRows.some(
  //     (r) => !r.returnQty || r.returnQty <= 0
  //   );
  //   if (hasInvalidQty)
  //     return Alert("All parts must have a valid return quantity", "warning");

  //   setLoading(true);

  //   try {
  //     const fd = new FormData();

  //     fd.append("VendorId", selectedVendor.id);
  //     fd.append("PoId", selectedPO?.id || "");
  //     fd.append("GrnId", selectedGRN?.id || "");
  //     fd.append("ReturnDate", returnDate);
  //     fd.append("Reason", reason);
  //     fd.append("LocationId", selectedLocation?.id || "");

  //     selectedRows.forEach((item, idx) => {
  //       fd.append(`VendorReturnRequestItems[${idx}].partId`, item.partId);
  //       fd.append(
  //         `VendorReturnRequestItems[${idx}].grnLineItemId`,
  //         item.grnLineItemId || ""
  //       );
  //       fd.append(
  //         `VendorReturnRequestItems[${idx}].trackingType`,
  //         item.trackingType
  //       );
  //       fd.append(
  //         `VendorReturnRequestItems[${idx}].returnQuantity`,
  //         item.returnQty
  //       );
  //       fd.append(
  //         `VendorReturnRequestItems[${idx}].reason`,
  //         item.lineItemReason || ""
  //       );
  //     });

  //     await createVendorReturnRequest(fd);

  //     Alert("Vendor Return created successfully!", "success");
  //     handleRefresh();
  //     handleCloseClick();
  //   } catch (e) {
  //     Alert("Error creating vendor return", "error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const buildFormData = (status) => {
    const fd = new FormData();

    fd.append("VendorId", selectedVendor.id);
    fd.append("PoId", selectedPO?.id || "");
    fd.append("GrnId", selectedGRN?.id || "");
    fd.append("ReturnDate", returnDate);
    fd.append("Reason", reason);
    fd.append("LocationId", selectedLocation?.id || "");

    // ✅ ADD STATUS HERE
    fd.append("Status", status);

    selectedRows.forEach((item, idx) => {
      fd.append(`VendorReturnRequestItems[${idx}].partId`, item.partId);
      fd.append(
        `VendorReturnRequestItems[${idx}].trackingType`,
        item.trackingType,
      );
      fd.append(
        `VendorReturnRequestItems[${idx}].trackingId`,
        item.trackingId || "",
      );
      fd.append(
        `VendorReturnRequestItems[${idx}].returnQuantity`,
        item.returnQty,
      );
      fd.append(
        `VendorReturnRequestItems[${idx}].reason`,
        item.lineItemReason || "",
      );
    });

    return fd;
  };

  const handleSaveDraft = async () => {
    if (!selectedVendor) {
      setErrors({ vendor: "Vendor is required" });
      return;
    }

    if (selectedRows.length === 0) {
      Alert("Add at least one part to save draft", "warning");
      return;
    }

    setLoading(true);

    try {
      const fd = buildFormData("Draft");

      if (vendorReturnId) {
        await updateVendorReturnRequestById(vendorReturnId, fd);
      } else {
        const res = await createVendorReturnRequest(fd);
        setVendorReturnId(res.id);
      }

      Alert("Draft saved successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (e) {
      console.error(e);
      Alert("Failed to save draft", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVendor) {
      setErrors({ vendor: "Vendor is required" });
      return;
    }

    if (selectedRows.length === 0) {
      Alert("Add at least one part", "warning");
      return;
    }

    const hasInvalidQty = selectedRows.some(
      (r) => !r.returnQty || r.returnQty <= 0,
    );
    if (hasInvalidQty) {
      return Alert("All parts must have valid quantities", "warning");
    }

    setLoading(true);

    try {
      const fd = buildFormData("Submitted");

      if (vendorReturnId) {
        await updateVendorReturnRequestById(vendorReturnId, fd);
      } else {
        const res = await createVendorReturnRequest(fd);
        setVendorReturnId(res.id);
      }

      setStatus("Submitted");
      Alert("Vendor Return submitted successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (e) {
      console.error(e);
      Alert("Submission failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================== GRID ==================
  const columns = [
    { field: "partNumber", headerName: "Part Number", flex: 1 },
    { field: "partName", headerName: "Part Name", flex: 1 },
    {
      field: "trackingType",
      headerName: "Tracking Type",
      width: 140,
      type: "singleSelect",
      valueOptions: ["Serial", "Batch", "None"],
      renderCell: ({ row }) => (
        <Autocomplete
          size="small"
          fullWidth
          options={[
            { value: "Serial", label: "Serial" },
            { value: "Batch", label: "Batch" },
            { value: "None", label: "None" },
          ]}
          value={[
            { value: "Serial", label: "Serial" },
            { value: "Batch", label: "Batch" },
            { value: "None", label: "None" },
          ].find((t) => t.value === row.trackingType)}
          disableClearable
          onChange={(_, val) => {
            setSelectedRows((prev) =>
              prev.map((r) =>
                r.id === row.id
                  ? {
                      ...r,
                      trackingType: val.value,
                      returnQty: val.value === "Serial" ? 1 : "",
                      trackingId: "",
                    }
                  : r,
              ),
            );
          }}
          getOptionLabel={(o) => o.label}
          renderInput={(params) => <TextField {...params} />}
        />
      ),
    },
    {
      field: "trackingId",
      headerName: "Tracking ID",
      width: 200,
      renderCell: ({ row }) =>
        row.trackingType !== "None" ? (
          <TextField
            size="small"
            fullWidth
            value={row.trackingId}
            placeholder={
              row.trackingType === "Serial"
                ? "Enter Serial Number"
                : "Enter Batch Number"
            }
            onChange={(e) =>
              setSelectedRows((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, trackingId: e.target.value } : r,
                ),
              )
            }
          />
        ) : (
          "---"
        ),
    },

    {
      field: "returnQty",
      headerName: "Return Qty",
      width: 120,
      type: "number",
      renderCell: ({ row }) => {
        const isSerial = row.trackingType === "Serial";

        return (
          <TextField
            type="number"
            size="small"
            fullWidth
            value={isSerial ? 1 : row.returnQty}
            InputProps={{ readOnly: isSerial }}
            onChange={(e) => {
              if (isSerial) return;

              const num = Number(e.target.value);
              if (num < 0) {
                Alert("Quantity cannot be negative", "warning");
                return;
              }

              // Validate exceeds available
              if (num > row.availableQty) {
                Alert(
                  `Return quantity cannot exceed available quantity (${row.availableQty})`,
                  "warning",
                );
                return;
              }

              setSelectedRows((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, returnQty: num } : r,
                ),
              );
            }}
          />
        );
      },
    },

    {
      field: "lineItemReason",
      headerName: "Remarks",
      flex: 0.7,
      sortable: false,
      renderCell: ({ row, value }) => (
        <div
          onClick={(event) => handleOpenReasonPopover(event, { row, value })}
        >
          {value || "Click to edit"}
        </div>
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          onClick={() => handleRemovePart(params.row.id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  // Get parts that haven't been added yet
  const partsToSelect = availableParts.filter(
    (part) => !selectedRows.find((r) => r.id === part.id),
  );

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Vendor Return</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loading ? (
        <div className="loader-container">
          <Cliploader loading={loading} />
        </div>
      ) : (
        <div className="CreateFlyoutBody">
          <Grid container spacing={2}>
            {/* GRN */}
            {mode !== "PO" && mode !== "Vendor" && (
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={grnList}
                  getOptionLabel={(g) => g.grnNumber ?? ""}
                  value={selectedGRN}
                  onChange={(e, v) => handleSelectGRN(v)}
                  renderInput={(p) => <TextField {...p} label="Select GRN" />}
                />
              </Grid>
            )}

            {/* PO */}
            {mode !== "Vendor" && (
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={mode === "GRN" ? [] : poList}
                  getOptionLabel={(p) => p.number ?? ""}
                  value={selectedPO}
                  onChange={(e, v) => handleSelectPO(v)}
                  disabled={mode === "GRN"}
                  renderInput={(p) => (
                    <TextField {...p} label="Purchase Order" />
                  )}
                />
              </Grid>
            )}

            {/* Vendor */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={vendorList}
                getOptionLabel={(v) => v.name ?? ""}
                disabled={mode === "GRN" || mode === "PO"}
                value={selectedVendor}
                onChange={(e, v) => handleSelectVendorDirect(v)}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    label="Vendor"
                    required
                    error={!!errors.vendor}
                    helperText={errors.vendor}
                  />
                )}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={locationList}
                getOptionLabel={(l) => l.name ?? ""}
                value={selectedLocation}
                onChange={(e, v) => setSelectedLocation(v)}
                renderInput={(p) => <TextField {...p} label="Location" />}
              />
            </Grid>

            {/* Return Date */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Return Date"
                type="date"
                fullWidth
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <TextField
            label="Reason for Return"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={4}
          />

          {/* PART SELECTION – full width */}
          <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 2 }}>
            <Autocomplete
              fullWidth
              options={partsToSelect}
              getOptionLabel={(p) =>
                `${p.partNumber || ""} - ${p.partName || ""}`
              }
              value={selectedPart}
              onChange={(e, v) => {
                if (!v) return;

                // Check if part is already added
                if (selectedRows.find((r) => r.id === v.id)) {
                  Alert("Part already added", "warning");
                  return;
                }

                // Add the part to selectedRows
                setSelectedRows((prev) => [
                  ...prev,
                  { ...v, returnQty: "", lineItemReason: "" },
                ]);

                // Clear the selection
                setSelectedPart(null);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Select Part" />
              )}
            />
          </Box>

          {/* GRID – full width */}
          {selectedRows.length > 0 && (
            <Box sx={{ height: 350, mb: 2 }}>
              <StyledDataGrid
                rows={selectedRows}
                columns={columns}
                getRowId={(r) => r.id}
              />
            </Box>
          )}
        </div>
      )}

      <div className="CreateFlyoutFooter">
        <Button onClick={handleCloseClick}>Cancel</Button>

        {status === "Draft" && (
          <>
            <Button
              variant="outlined"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save as Draft"}
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </>
        )}
      </div>

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
