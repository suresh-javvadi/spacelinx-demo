import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Autocomplete, Box } from "@mui/material";

import { AlertsContext } from "../../AlertsContext/Context";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import {
  fetchPurchaseOrders,
  fetchPurchaseOrderwithId,
} from "../../../services/purchaseOrders";

import {
  fetchGoodReceiptNotes,
  fetchGRNDetailsById,
} from "../../../services/goodReceiptNoteService";

import { fetchLocations } from "../../../services/locationService";
import { createScrap } from "../../../services/scrapService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { Grid } from "@mui/material";
export default function NewScrap({ handleCloseClick, handleRefresh }) {
  const { Alert } = useContext(AlertsContext);

  const [mode, setMode] = useState(null);

  const [selectedGRN, setSelectedGRN] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [selectedPart, setSelectedPart] = useState(null); // current part in dropdown
  const [selectedParts, setSelectedParts] = useState([]); // all added parts

  const [poList, setPoList] = useState([]);
  const [grnList, setGrnList] = useState([]);
  const [locationList, setLocationList] = useState([]);

  const [lineItems, setLineItems] = useState([]); // all possible parts (from GRN/PO)

  const [scrapDate, setScrapDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [scrapReason, setScrapReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [locationError, setLocationError] = useState(false);
  const trackingOptions = [
    { value: "Batch", label: "Batch" },
    { value: "Serial", label: "Serial" },
    { value: "None", label: "None" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
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
      console.error(err);
      Alert("Failed to load initial data", "error");
    }
  }

  const handleSelectGRN = async (grn) => {
    if (!grn) {
      setSelectedGRN(null);
      setMode(null);
      setLineItems([]);
      setSelectedPart(null);
      setSelectedParts([]);
      return;
    }

    setMode("GRN");
    setSelectedGRN(grn);
    setSelectedPO(null);
    setSelectedPart(null);
    setSelectedParts([]);

    try {
      const details = await fetchGRNDetailsById(grn.id);

      const grnLineItems = details?.grnLineItems || [];

      const mapped = grnLineItems.map((item) => ({
        id: item.id,
        partId: item.partId,
        partNumber:
          item.part?.partNumber || item.part?.number || item.partNumber || "",
        partName: item.part?.name || "",
        trackingType: item.trackingMethod || "",
        trackingId: item.trackingId || "",
        receivedQty: item.receivedQuantity ?? 0,
        woId: details?.workOrderId || "",
        grnLineItemId: item.id,
      }));

      setLineItems(mapped);

      // Auto-select PO
      if (details?.purchaseOrderId) {
        const poDetails = await fetchPurchaseOrderwithId(
          details.purchaseOrderId,
        );
        setSelectedPO({
          id: poDetails.id,
          number: poDetails.number,
        });
      } else {
        setSelectedPO(null);
      }

      // Auto-select Location
      const loc = locationList.find((l) => l.id === details?.locationId);
      setSelectedLocation(loc || null);
    } catch (e) {
      console.error(e);
      Alert("Failed to load GRN details", "error");
    }
  };

  const handleSelectPO = async (po) => {
    if (!po) {
      setSelectedPO(null);
      if (!selectedGRN) setMode(null);
      setLineItems([]);
      setSelectedPart(null);
      setSelectedParts([]);
      return;
    }

    if (!selectedGRN) setMode("PO");

    setSelectedPO(po);
    setSelectedPart(null);
    setSelectedParts([]);

    try {
      const details = await fetchPurchaseOrderwithId(po.id);

      const poLineItems = details?.poLineItems || [];

      const mapped = poLineItems.map((item) => {
        let trackingType = "";
        let trackingId = "";

        if (item.serialNumber) {
          trackingType = "Serial";
          trackingId = item.serialNumber;
        } else if (item.batchNumber) {
          trackingType = "Batch";
          trackingId = item.batchNumber;
        }

        return {
          id: item.id,
          partId: item.partId,
          partNumber: item?.part?.partNumber || "",
          partName: item.part?.name || "",
          trackingType,
          trackingId,
          receivedQty: item.receivedQuantity ?? 0,
          woId: details?.workOrderId || "",
          grnLineItemId: item.id,
        };
      });

      setLineItems(mapped);

      let loc =
        locationList.find((l) => l.id === details?.deliveryAddressId) ||
        locationList.find((l) => l.id === details?.shippingAddressId);

      setSelectedLocation(loc || null);
    } catch (e) {
      console.error(e);
      Alert("Failed to load PO details", "error");
    }
  };
  const handleAddPart = () => {
    if (!selectedPart) {
      Alert("Please select a part to add", "warning");
      return;
    }

    setSelectedParts((prev) => [
      ...prev,
      {
        ...selectedPart,
        trackingType:
          selectedPart.trackingType || (mode === "PO" ? "Batch" : ""),
        trackingId: selectedPart.trackingId || "",
        scrapQty: "",
      },
    ]);

    setSelectedPart(null);
  };

  const handleScrapQtyChange = (rowId, val) => {
    const qty = Number(val);

    setSelectedParts((prev) =>
      prev.map((p) => {
        if (p.id !== rowId) return p;

        const max = p.receivedQty ?? 0;

        if (qty > max) {
          Alert(
            "Scrap quantity cannot be more than available quantity",
            "warning",
          );

          return {
            ...p,
            scrapQty: max,
          };
        }

        return { ...p, scrapQty: val };
      }),
    );
  };

  const handleTrackingIdChange = (rowId, value) => {
    setSelectedParts((prev) =>
      prev.map((p) => (p.id === rowId ? { ...p, trackingId: value } : p)),
    );
  };
  const validateForm = () => {
    let isValid = true;

    if (!selectedLocation) {
      setLocationError(true);
      isValid = false;
    } else {
      setLocationError(false);
    }

    return isValid;
  };

  const handleCreateScrap = async (status = "Draft") => {
    const partsToSubmit = selectedParts.filter((p) => Number(p.scrapQty) > 0);

    if (!validateForm()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    if (!partsToSubmit.length) {
      Alert("Please enter scrap quantity for at least one part", "warning");
      return;
    }

    const invalidSerial = partsToSubmit.find(
      (p) => p.trackingType === "Serial" && !p.trackingId,
    );

    if (invalidSerial) {
      Alert("Serial number is required for serial-tracked parts", "error");
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("LocationId", selectedLocation?.id);
      fd.append("PoId", selectedPO?.id || "");
      fd.append("GrnId", selectedGRN?.id || "");
      fd.append("WoId", partsToSubmit[0]?.woId || "");
      fd.append("ScrapDate", scrapDate);
      fd.append("Reason", scrapReason);
      fd.append("Status", status);

      partsToSubmit.forEach((part, index) => {
        fd.append(`ScrapLineItems[${index}].partId`, part.partId);
        fd.append(
          `ScrapLineItems[${index}].scrapQuantity`,
          Number(part.scrapQty),
        );
        fd.append(`ScrapLineItems[${index}].trackingType`, part.trackingType);
        fd.append(`ScrapLineItems[${index}].trackingId`, part.trackingId || "");
        fd.append(
          `ScrapLineItems[${index}].reason`,
          scrapReason || "Damaged Material",
        );
      });

      await createScrap(fd);

      Alert(
        status === "Draft"
          ? "Scrap saved as Draft"
          : "Scrap submitted successfully",
        "success",
      );

      handleRefresh?.();
      handleCloseClick?.();
    } catch (e) {
      console.error(e);
      Alert("Failed to create scrap", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "partNumber", headerName: "Part Number", flex: 1 },
    { field: "partName", headerName: "Part", flex: 1 },

    {
      field: "trackingType",
      headerName: "Tracking",
      width: 150,
      type: "singleSelect",
      valueOptions: ["Serial", "Batch", "None"],
      renderCell: ({ row }) => {
        // GRN → read-only
        if (mode === "GRN") {
          return <span>{row.trackingType || "—"}</span>;
        }

        return (
          <Autocomplete
            size="small"
            options={trackingOptions}
            disableClearable
            value={
              trackingOptions.find((opt) => opt.value === row.trackingType) ||
              null
            }
            getOptionLabel={(opt) => opt.label}
            onChange={(_, val) => {
              setSelectedParts((prev) =>
                prev.map((p) =>
                  p.id === row.id
                    ? {
                        ...p,
                        trackingType: val.value,
                        trackingId: "", // reset when changed
                        // OPTIONAL: auto qty logic
                        // scrapQty: val.value === "Serial" ? 1 : p.scrapQty,
                      }
                    : p,
                ),
              );
            }}
            renderInput={(params) => <TextField {...params} />}
          />
        );
      },
    },
    {
      field: "trackingId",
      headerName: "Tracking ID",
      width: 180,
      renderCell: (params) => {
        const isGRN = mode === "GRN";

        return (
          <TextField
            size="small"
            placeholder={isGRN ? "" : "Enter Tracking ID"}
            value={params.row.trackingId ?? ""}
            disabled={isGRN}
            onChange={
              isGRN
                ? undefined
                : (e) => handleTrackingIdChange(params.row.id, e.target.value)
            }
          />
        );
      },
    },
    {
      field: "scrapQty",
      headerName: "Scrap Qty",
      width: 180,
      type: "number",
      renderCell: (params) => (
        <TextField
          type="number"
          size="small"
          value={
            params.row.scrapQty === "" || params.row.scrapQty === undefined
              ? ""
              : params.row.scrapQty
          }
          inputProps={{ min: 0 }}
          onChange={(e) => handleScrapQtyChange(params.row.id, e.target.value)}
        />
      ),
    },
  ];

  const availablePartOptions = lineItems.filter(
    (item) => !selectedParts.some((p) => p.id === item.id),
  );

  const effectiveSelectedPart =
    availablePartOptions.find((p) => p.id === selectedPart?.id) || null;

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Scrap Request</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="CreateFlyoutBody">
        <Grid container spacing={2}>
          {/* GRN Selector */}
          {mode !== "PO" && (
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={grnList}
                getOptionLabel={(g) => g?.grnNumber || ""}
                value={selectedGRN}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                onChange={(e, v) => handleSelectGRN(v)}
                renderInput={(params) => (
                  <TextField {...params} label="Select GRN" />
                )}
              />
            </Grid>
          )}

          {/* PO Selector */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={mode === "GRN" ? [] : poList}
              getOptionLabel={(p) => p?.number || ""}
              value={selectedPO}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(e, v) => handleSelectPO(v)}
              renderInput={(params) => (
                <TextField {...params} label="Select PO" />
              )}
            />
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={locationList}
              getOptionLabel={(l) => l?.name || ""}
              value={selectedLocation}
              isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
              onChange={(e, v) => {
                setSelectedLocation(v);
                setLocationError(false);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  error={locationError}
                  helperText={locationError ? "Location is required" : ""}
                />
              )}
            />
          </Grid>

          {/* Scrap Date */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Scrap Date"
              type="date"
              value={scrapDate}
              onChange={(e) => setScrapDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          {/* Scrap Reason (Full Width) */}
          <Grid item xs={12}>
            <TextField
              label="Scrap Reason"
              value={scrapReason}
              onChange={(e) => setScrapReason(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />
          </Grid>

          {/* Part Selector */}
          {lineItems.length > 0 && (
            <>
              <Grid item xs={12} md={8}>
                <Autocomplete
                  options={availablePartOptions}
                  getOptionLabel={(p) => p?.partName || ""}
                  value={effectiveSelectedPart}
                  isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                  onChange={(e, v) => setSelectedPart(v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Part" />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4} alignSelf="center">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleAddPart}
                  disabled={!selectedPart}
                  style={{
                    height: "55px",
                  }}
                >
                  Add
                </Button>
              </Grid>

              {/* Parts Table */}
              {selectedParts.length > 0 && (
                <Grid item xs={12}>
                  <Box>
                    <StyledDataGrid
                      rows={selectedParts}
                      columns={columns}
                      hideFooter
                      getRowId={(row) => row.id}
                    />
                  </Box>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </div>

      {/* Footer */}
      <div className="CreateFlyoutFooter">
        <Button onClick={handleCloseClick}>Cancel</Button>

        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => handleCreateScrap("Draft")}
        >
          {loading ? "Saving" : "Save as Draft"}
        </Button>

        <Button
          variant="contained"
          disabled={loading}
          onClick={() => handleCreateScrap("Submitted")}
        >
          {loading ? "Submit" : "Submit"}
        </Button>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
}
