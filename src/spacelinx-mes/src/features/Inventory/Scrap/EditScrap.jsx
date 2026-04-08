import React, { useEffect, useState, useContext } from "react";
import { Button, TextField, Autocomplete, Box, Divider } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Grid from "@mui/material/Grid";
import { useUserContext } from "../../userContext/UserContext";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderwithId,
} from "../../../services/purchaseOrders";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import {
  fetchGoodReceiptNotes,
  fetchGRNDetailsById,
} from "../../../services/goodReceiptNoteService";
import { fetchLocations } from "../../../services/locationService";
import {
  fetchScrapDetails,
  updateScrap,
  submitScrap,
  approveScrap,
  rejectScrap,
} from "../../../services/scrapService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const EditScrap = ({ scrapData, handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);

  const [poList, setPoList] = useState([]);
  const [grnList, setGrnList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  const [formData, setFormData] = useState({
    poId: "",
    grnId: "",
    woId: "",
    locationId: "",
    scrapDate: "",
    reason: "",
    status: "",
    raisedById: "",
  });

  const [lineItems, setLineItems] = useState([]);

  const scrapId = scrapData?.scrapRequestId || scrapData?.id || null;

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [poRes, grnRes, locRes] = await Promise.all([
          fetchPurchaseOrders(),
          fetchGoodReceiptNotes(),
          fetchLocations(),
        ]);

        setPoList(poRes || []);
        setGrnList(grnRes || []);
        setLocationList(locRes || []);
      } catch (err) {
        Alert("Failed to load dropdown data", "error");
      }
    };

    loadDropdowns();
  }, [Alert]);

  useEffect(() => {
    if (formData.status === "Submitted") {
      setReadOnlyMode(true);
    }
  }, [formData.status]);

  useEffect(() => {
    if (!scrapId) return;

    const loadDetails = async () => {
      setLoadingData(true);

      try {
        const details = await fetchScrapDetails(scrapId);

        setFormData({
          poId: details.poId || "",
          grnId: details.grnId || "",
          woId: details.woId || "",
          locationId: details.locationId || "",
          scrapDate: details.scrapDate?.split("T")[0] || "",
          reason: details.reason || "",
          status: details.status || "Draft",
          raisedById:
            details.raisedById || details.raisedByID || details.raisedBy || "",
        });

        const scrapLineItems = details.scrapLineItems || [];

        let baseLineItems = [];

        //  If GRN is linked – build baseline from GRN
        if (details.grnId) {
          const grnDetails = await fetchGRNDetailsById(details.grnId);
          const grnLineItems = grnDetails?.grnLineItems || [];

          baseLineItems = grnLineItems.map((item) => ({
            id: item.id,
            partId: item.partId,
            partNumber:
              item.part?.partNumber ||
              item.part?.number ||
              item.partNumber ||
              "",
            partName: item.part?.name || "",
            trackingType: item.part?.trackingType || "Batch",
            trackingId: item.batchNumber || item.serialNumber || "",
            //  Prefer available/received quantity fields from GRN
            receivedQty:
              item.availableQty ??
              item.availableQuantity ??
              item.receivedQty ??
              item.receivedQuantity ??
              0,
            woId: grnDetails?.workOrderId || "",
            grnLineItemId: item.id,
          }));
        }
        //  If GRN is not linked but PO is – build baseline from PO
        else if (details.poId) {
          const poDetails = await fetchPurchaseOrderwithId(details.poId);
          const poLineItems = poDetails?.poLineItems || [];

          baseLineItems = poLineItems.map((item) => ({
            id: item.id,
            partId: item.partId,
            partNumber:
              item.part?.partNumber ||
              item.part?.number ||
              item.partNumber ||
              "",
            partName: item.part?.name || "",
            trackingType: item.part?.trackingType || "Batch",
            trackingId: "",

            receivedQty:
              item.availableQty ??
              item.availableQuantity ??
              item.receivedQty ??
              item.receivedQuantity ??
              item.quantity ??
              0,
          }));
        }

        //  Map Scrap Line Items and merge with baseline (GRN/PO)
        const mapped =
          scrapLineItems.map((li) => {
            const match = baseLineItems.find((b) => b.partId === li.partId);

            return {
              id: li.id,
              partId: li.partId,
              partNumber: match?.partNumber || li.partNumber || "",
              partName: match?.partName || li.partName || "",
              trackingType: li.trackingType || match?.trackingType || "",
              trackingId: li.trackingId || match?.trackingId || "",
              // Prefer baseline available qty, fallback to scrap line qty fields
              receivedQty:
                match?.receivedQty ??
                li.availableQty ??
                li.availableQuantity ??
                li.receivedQty ??
                li.receivedQuantity ??
                0,
              scrapQuantity: li.scrapQuantity,
              reason: li.reason,
            };
          }) || [];

        setLineItems(mapped);
      } catch (err) {
        Alert("Failed to load scrap details", "error");
      } finally {
        setLoadingData(false);
      }
    };

    loadDetails();
  }, [scrapId, Alert]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (id, value, maxQty) => {
    const typed = parseInt(value, 10);

    if (value === "") {
      setLineItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, scrapQuantity: "" } : item,
        ),
      );
      return;
    }

    const newQty = isNaN(typed) ? 0 : Math.max(0, typed);

    if (newQty > maxQty) {
      Alert("Qty to Scrap cannot be more than Available Qty", "error");
      setLineItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, scrapQuantity: maxQty } : item,
        ),
      );
      return;
    }

    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, scrapQuantity: newQty } : item,
      ),
    );
  };

  const handleUpdate = async () => {
    const invalid = lineItems.some(
      (item) => Number(item.scrapQuantity || 0) > Number(item.receivedQty || 0),
    );

    if (invalid) {
      Alert(
        "Qty to Scrap cannot be greater than Available Qty for one or more items.",
        "error",
      );
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("Reason", formData.reason);
      fd.append("ScrapDate", formData.scrapDate);
      fd.append("Status", formData.status);
      fd.append("LocationId", formData.locationId);

      fd.append("PoId", formData.poId);
      fd.append("GrnId", formData.grnId);
      fd.append("WoId", formData.woId);

      fd.append("RaisedById", formData.raisedById);

      lineItems.forEach((item, index) => {
        fd.append(`ScrapLineItems[${index}].Id`, item.id);
        fd.append(`ScrapLineItems[${index}].partId`, item.partId);
        fd.append(`ScrapLineItems[${index}].trackingType`, item.trackingType);
        fd.append(`ScrapLineItems[${index}].trackingId`, item.trackingId);
        fd.append(`ScrapLineItems[${index}].scrapQuantity`, item.scrapQuantity);
        fd.append(`ScrapLineItems[${index}].reason`, item.reason || "");
      });

      await updateScrap(scrapId, fd);

      Alert("Scrap updated successfully!", "success");
      setReadOnlyMode(true);
      if (handleRefresh) handleRefresh();
    } catch (err) {
      Alert("Failed to update scrap", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!lineItems || lineItems.length === 0) {
      Alert("Add at least one part", "warning");
      return;
    }

    for (const item of lineItems) {
      if (
        item.scrapQuantity === "" ||
        item.scrapQuantity === null ||
        Number.isNaN(Number(item.scrapQuantity)) ||
        Number(item.scrapQuantity) <= 0
      ) {
        Alert("All parts must have a valid scrap quantity", "warning");
        return;
      }

      if (Number(item.scrapQuantity) > Number(item.receivedQty || 0)) {
        Alert(
          `Qty to Scrap for ${item.partNumber || item.partId} exceeds Available Qty`,
          "warning",
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("Reason", formData.reason || "");
      fd.append("ScrapDate", formData.scrapDate || "");
      fd.append("Status", "Submitted");
      fd.append("LocationId", formData.locationId || "");
      fd.append("PoId", formData.poId || "");
      fd.append("GrnId", formData.grnId || "");
      fd.append("WoId", formData.woId || "");
      fd.append("RaisedById", formData.raisedById || "");

      lineItems.forEach((item, index) => {
        fd.append(`ScrapLineItems[${index}].Id`, item.id);
        fd.append(`ScrapLineItems[${index}].partId`, item.partId);
        fd.append(`ScrapLineItems[${index}].trackingType`, item.trackingType);
        fd.append(`ScrapLineItems[${index}].trackingId`, item.trackingId || "");
        fd.append(
          `ScrapLineItems[${index}].scrapQuantity`,
          Number(item.scrapQuantity),
        );
        fd.append(`ScrapLineItems[${index}].reason`, item.reason || "");
      });

      // ✅ STEP 1: UPDATE
      await updateScrap(scrapId, fd);

      // ✅ STEP 2: SUBMIT (NO BODY)
      await submitScrap(scrapId);

      setFormData((prev) => ({
        ...prev,
        status: "Submitted",
      }));

      Alert("Scrap submitted successfully!", "success");
      setReadOnlyMode(true);
      handleRefresh?.();
      handleCloseClick?.();
    } catch (error) {
      console.error("Submit failed:", error);
      Alert("Failed to submit scrap", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    const confirmed = await showConfirmation(
      "Approve Scrap Request?",
      "Are you sure you want to approve this Scrap Request?",
      "Yes, approve it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      await approveScrap(scrapId);

      setFormData((prev) => ({
        ...prev,
        status: "Approved",
      }));

      showAlert("success", "Approved", "Scrap approved successfully!");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error(error);
      showAlert("error", "Error", "Failed to approve Scrap.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReject = async () => {
    const confirmed = await showConfirmation(
      "Reject Scrap Request?",
      "Are you sure you want to reject this Scrap Request?",
      "Yes, reject it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      await rejectScrap(scrapId);

      setFormData((prev) => ({
        ...prev,
        status: "Rejected",
      }));

      showAlert("warning", "Rejected", "Scrap rejected successfully!");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error(error);
      showAlert("error", "Error", "Failed to reject Scrap.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleTrackingIdChange = (rowId, value) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === rowId ? { ...item, trackingId: value } : item,
      ),
    );
  };

  const columns = [
    { field: "partNumber", headerName: "Part Number", flex: 1 },
    { field: "partName", headerName: "Part Name", flex: 1 },
    {
      field: "trackingType",
      headerName: "Tracking",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Serial", "Batch", "None"],
    },

    {
      field: "trackingId",
      headerName: "Tracking ID",
      flex: 1,
      renderCell: ({ row }) => {
        const hasTracking = !!row.trackingType;

        if (!hasTracking) {
          return <span style={{ color: "#999" }}>—</span>;
        }

        return (
          <TextField
            size="small"
            value={row.trackingId ?? ""}
            onChange={(e) => handleTrackingIdChange(row.id, e.target.value)}
            inputProps={{ readOnly: readOnlyMode }}
          />
        );
      },
    },

    // { field: "receivedQty", headerName: "Available Qty", flex: 1 },

    {
      field: "scrapQuantity",
      headerName: "Qty to Scrap",
      flex: 1,
      type: "number",
      renderCell: ({ row }) => (
        <TextField
          type="number"
          size="small"
          value={row.scrapQuantity}
          onChange={(e) =>
            handleLineItemChange(row.id, e.target.value, row.receivedQty)
          }
          inputProps={{
            min: 0,
            max: row.receivedQty,
            readOnly: readOnlyMode,
          }}
        />
      ),
    },
  ];

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>{scrapData?.scrapNumber}</h2>
        <div className="EditFlyoutHeaderIcons">
          <p className="EditPartHeaderStatus">
            Status: {formData.status === "Draft" ? "" : formData.status}
          </p>
          {formData?.status === "Draft" && readOnlyMode && (
            <>
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <button onClick={() => setReadOnlyMode(false)}>
                <ion-icon name="create-outline"></ion-icon>
              </button>
            </>
          )}
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      {loadingData ? (
        <Cliploader loading={loadingData} />
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <Grid container spacing={2}>
              {/* GRN */}
              <Grid item xs={12} md={6}>
                {formData.grnId && (
                  <Autocomplete
                    disabled
                    options={grnList}
                    value={grnList.find((g) => g.id === formData.grnId) || null}
                    getOptionLabel={(g) => g?.grnNumber || ""}
                    renderInput={(params) => (
                      <TextField {...params} label="GRN" fullWidth />
                    )}
                  />
                )}
              </Grid>

              {/* PO */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  disabled
                  options={poList}
                  value={poList.find((p) => p.id === formData.poId) || null}
                  getOptionLabel={(p) => p?.number || ""}
                  renderInput={(params) => (
                    <TextField {...params} label="PO" fullWidth />
                  )}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={locationList}
                  value={
                    locationList.find((l) => l.id === formData.locationId) ||
                    null
                  }
                  getOptionLabel={(l) => l?.name || ""}
                  onChange={(e, v) => updateField("locationId", v?.id || "")}
                  disabled={readOnlyMode}
                  renderInput={(params) => (
                    <TextField {...params} label="Location" fullWidth />
                  )}
                />
              </Grid>

              {/* Scrap Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Scrap Date"
                  type="date"
                  fullWidth
                  value={formData.scrapDate}
                  onChange={(e) => updateField("scrapDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: readOnlyMode }}
                />
              </Grid>

              {/* Scrap Reason – full width */}
              <Grid item xs={12}>
                <TextField
                  label="Scrap Reason"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => updateField("reason", e.target.value)}
                  inputProps={{ readOnly: readOnlyMode }}
                />
              </Grid>

              {/* Table – full width */}
              <Grid item xs={12}>
                <Box sx={{ height: 250 }}>
                  <StyledDataGrid
                    rows={lineItems}
                    columns={columns}
                    hideFooter
                    getRowId={(row) => row.id}
                  />
                </Box>
              </Grid>
            </Grid>
          </div>

          {!readOnlyMode && (
            <div className="CreateFlyoutFooter">
              <Button onClick={() => setReadOnlyMode(true)}>Cancel</Button>
              <Button
                variant="outlined"
                onClick={handleUpdate}
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update"}
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          )}
          {formData.status === "Submitted" &&
            hasPermission(PERMISSIONS.VENDORRETURNS.APPROVE) && (
              <div className="CreateFlyoutFooter">
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    color="error"
                    onClick={handleReject}
                    disabled={submitting}
                  >
                    Reject
                  </Button>

                  <Button
                    color="success"
                    onClick={handleApprove}
                    disabled={submitting}
                  >
                    Approve
                  </Button>
                </Box>
              </div>
            )}
        </>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditScrap;
