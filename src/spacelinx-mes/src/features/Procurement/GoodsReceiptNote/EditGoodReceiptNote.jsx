import React, { useState, useEffect, useContext, useMemo } from "react";
import { TextField, Tab, Button, Divider } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import ClipLoader from "../../../Components/Loaders/Cliploader";
import Documents from "../../../Components/Documents/Documents";
import dayjs from "dayjs";
import {
  fetchGRNDetailsById,
  qualityCheckGRN,
  updateGoodReceiptNote,
} from "../../../services/goodReceiptNoteService";
import { useUserContext } from "../../userContext/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import Popover from "@mui/material/Popover";

const EditGoodReceiptNote = ({ selectedGRN, handleClose, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission, isSuperAdmin } = useUserContext();
  const navigateTo = useNavigate();
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [loadingData, setLoadingData] = useState(true);
  const [lineItems, setLineItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [newDocuments, setNewDocuments] = useState([]);
  const [formData, setFormData] = useState({
    purchaseOrderNumber: "",
    receivedDate: "",
    description: "",
    receivedBy: "",
    reference: "",
    invoiceNumber: "",
    invoiceDate: dayjs().format("DD-MM-YYYY"),
    createdDate: dayjs().format("DD-MM-YYYY"),
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [tempRemarks, setTempRemarks] = useState("");

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

  const newFlyoutTabChange = (event, newValue) =>
    setEditFlyOutTabsValue(newValue);

  useEffect(() => {
    setLoadingData(true);
    fetchGRNDetails();
  }, [selectedGRN]);

  const fetchGRNDetails = async () => {
    try {
      if (selectedGRN?.grnId) {
        const lineItemData = await fetchGRNDetailsById(selectedGRN.grnId);
        setFormData({
          purchaseOrderId: selectedGRN.poId,
          poStatus: selectedGRN.poStatus,
          purchaseOrderNumber: selectedGRN.poNumber || "", // PO ID
          receivedDate: selectedGRN?.receivedDate
            ? dayjs(selectedGRN.receivedDate).format("DD-MM-YYYY")
            : "",
          locationName: selectedGRN?.locationName,
          description: selectedGRN.description || "",
          receivedBy: selectedGRN.receivedByFullName || "", // user ID
          reference: lineItemData?.referenceNumber || "",
          invoiceDate: selectedGRN?.invoiceDate
            ? dayjs(selectedGRN.invoiceDate).format("DD-MM-YYYY")
            : "",
          invoiceNumber: selectedGRN?.invoiceNumber,
          createdDate: selectedGRN?.createdAt
            ? dayjs(selectedGRN.createdAt).format("DD-MM-YYYY")
            : "",
        });

        const sortedData =
          lineItemData?.grnLineItems?.sort(
            (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
          ) || [];

        setLineItems(sortedData);
      }
    } catch (error) {
      Alert("Failed to load GRN details", "error");
      console.error("Error fetching GRN data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLineItemChange = (id, value) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, receivedQuantity: value } : item,
      ),
    );
  };
  const lineItemColumns = [
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
      valueGetter: (_value, row) =>
        row.part?.partNumber || row.partNumber || "",
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
      valueGetter: (_value, row) => row.part?.name || row.name || "",
    },
    {
      field: "trackingMethod",
      headerName: "Tracking Method",
      flex: 0.8,
    },
    {
      field: "trackingId",
      headerName: "Tracking ID",
      flex: 1,
    },
    {
      field: "receivedQuantity",
      headerName: "Received Qty",
      flex: 1,
      type: "number",
      renderCell: ({ row }) =>
        isEditing ? (
          <TextField
            size="small"
            type="number"
            value={row.receivedQuantity}
            onChange={(e) =>
              handleLineItemChange(row.id || row.partId, e.target.value)
            }
          />
        ) : (
          row.receivedQuantity
        ),
    },
    {
      field: "remark",
      headerName: "Remarks",
      flex: 1,
      renderCell: ({ row, value }) => (
        <div onClick={(e) => handleRemarksPopoverOpen(row, e)}>
          <div>{value || "Click to edit"}</div>
        </div>
      ),
    },
  ];

  async function handleEditSubmit() {
    const fd = new FormData();

    fd.append("PurchaseOrderId", selectedGRN.purchaseOrderId);
    fd.append("ReceivedDate", selectedGRN.receivedDate);
    fd.append("Description", formData.description);
    fd.append("ReceivedById", selectedGRN.receivedById);
    fd.append("ReferenceNumber", formData.reference);
    fd.append("LocationId", selectedGRN.locationId);
    fd.append("InvoiceNumber", formData.invoiceNumber);
    fd.append("InvoiceDate", selectedGRN.invoiceDate);

    lineItems.forEach((item, idx) => {
      fd.append(`GrnLineItems[${idx}][id]`, item.id);
      fd.append(
        `GrnLineItems[${idx}][partId]`,
        item.partId || item.part?.id || "",
      );
      fd.append(
        `GrnLineItems[${idx}][receivedQuantity]`,
        item.receivedQuantity,
      );
    });

    newDocuments.forEach((doc) => {
      fd.append("documents", doc);
    });

    try {
      await updateGoodReceiptNote(selectedGRN.grnId, fd);
      Alert("GRN updated successfully!", "success");
      handleRefresh();
      handleClose();
    } catch (error) {
      Alert("Failed to update GRN.", "error");
      console.error("GRN Update Error:", error);
    }
  }
  const { activeRole } = useUserContext();

  const grnDetailsFields = [
    { label: "Invoice Number", value: formData.invoiceNumber },
    { label: "Received By", value: formData.receivedBy },
    { label: "Location", value: formData.locationName },
    {
      label: "P.O Number",
      value: formData.purchaseOrderNumber,
      className: "PO_Link",
      onClick: () =>
        navigateTo(`/procurement/purchaseorders/${formData.purchaseOrderId}`),
    },
    { label: "Invoice Date", value: formData.invoiceDate },
    { label: "Received Date", value: formData.receivedDate },
    { label: "Created On", value: formData.createdDate },
    { label: "P.O Status", value: formData.poStatus },
  ];

  return (
    <div className="GrnNewFlyout">
      <div className="EditFlyoutHeader">
        <h3>{`${selectedGRN?.grnNumber} Details`}</h3>
        <div className="EditFlyoutHeaderIcons">
          <p>
            <span>Status:</span> <span>{selectedGRN?.status}</span>{" "}
          </p>
          {selectedGRN?.status === "In Process" && (
            <>
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <button
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.GOODSRECEIPTS.MODIFY)) {
                    Alert(
                      "You do not have access to Edit the GRN's ..! ",
                      "warning",
                    );
                    return;
                  }
                  setReadOnlyMode(false);
                  setIsEditing(true);
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
        <div className="loading-container">
          <ClipLoader loading={loadingData} />
        </div>
      ) : (
        <TabContext value={editFlyOutTabsValue}>
          <div className="EditFlyoutTabsPanel">
            <TabList onChange={newFlyoutTabChange} centered variant="fullWidth">
              <Tab label="GRN Details" value="1" />
              {hasPermission(PERMISSIONS.GOODSRECEIPTS.DOCUMENTS.VIEW) && (
                <Tab label="Documents" value="2" />
              )}
            </TabList>
          </div>

          <TabPanel value="1" className="GrnNewFlyoutTabPanel">
            <div className="GrnNewFlyoutContent">
              {/* GRN DETAILS CARD */}
              <div className="grnDetailsCard">
                <h4 className="cardTitle">GRN Details</h4>

                <div className="grnDetailsGrid">
                  {grnDetailsFields.map((item, index) => (
                    <div className="detailItem" key={index}>
                      <p className="detailLabel">{item.label}</p>

                      <p
                        className={`detailValue ${item.className || ""}`}
                        onClick={item.onClick}
                        style={{
                          cursor: item.onClick ? "pointer" : "default",
                        }}
                      >
                        {item.value || "---"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference + Description */}
              <div className="refDescGrid">
                <div className="refDescCard">
                  <h4 className="cardTitle">Reference</h4>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Reference"
                    value={formData.reference}
                    inputProps={{ readOnly: readOnlyMode }}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reference: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="refDescCard">
                  <h4 className="cardTitle">Description</h4>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    value={formData.description}
                    inputProps={{ readOnly: readOnlyMode }}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* DataGrid */}
              <div className="GrnEditDataGridDiv">
                <StyledDataGrid
                  rows={lineItems}
                  columns={lineItemColumns}
                  getRowId={(row) => row.id || row.partId}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  disableRowSelectionOnClick
                  loading={loadingData}
                />
              </div>
            </div>
          </TabPanel>

          {hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW) && (
            <TabPanel value="2">
              <Documents
                entityId={selectedGRN?.grnId}
                entityType="Goods Receipt"
                canDelete={
                  ["Draft", "In Process"].includes(selectedGRN?.status) &&
                  hasPermission(PERMISSIONS.GOODSRECEIPTS.DOCUMENTS.DELETE)
                }
                canEdit={hasPermission(
                  PERMISSIONS.GOODSRECEIPTS.DOCUMENTS.MODIFY,
                )}
                isDraft={["Draft", "In Process"].includes(selectedGRN?.status)}
              />
            </TabPanel>
          )}

          {!readOnlyMode && (
            <div className="GrnCreateFlyoutFooter">
              <Button className="CancelButton" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (hasPermission(PERMISSIONS.GOODSRECEIPTS.MODIFY)) {
                    handleEditSubmit();
                  } else {
                    Alert(
                      "You do not have access to Submit the GRN ..! ",
                      "warning",
                    );
                  }
                }}
              >
                Update
              </Button>
            </div>
          )}
        </TabContext>
      )}

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

export default EditGoodReceiptNote;
