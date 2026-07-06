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
  qualityCheckGRNItems,
  updateGoodReceiptNote,
  acceptLineItems,
} from "../../../services/goodReceiptNoteService";
import { useUserContext } from "../../userContext/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { Autocomplete } from "@mui/material";
import Popover from "@mui/material/Popover";

const EditQualityCheck = ({ selectedGRN, handleClose, handleRefresh }) => {
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
  const qcStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "pass", label: "Pass" },
    { value: "fail", label: "Fail" },
  ];
  const normalizeQcStatus = (status) => (status || "").toString().toLowerCase();
  const isLineItemQcSubmitted = (item) =>
    item?.isQcSubmitted ?? normalizeQcStatus(item?.qcStatus) !== "pending";
  const canEditLineItem = (item) =>
    !readOnlyMode && !isLineItemQcSubmitted(item);
  const canAcceptLineItem = (item) =>
    isLineItemQcSubmitted(item) && normalizeQcStatus(item?.qcStatus) === "pass";

  const handleRemarksChange = (rowId, remarks) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.uniqueId === rowId ? { ...item, remark: remarks } : item,
      ),
    );
  };

  const handleSubmitQCheck = async () => {
    setLoadingData(true);

    const payLoad = lineItems.map((item) => ({
      id: item.id,
      qcStatus: item.qcStatus,
      dateCode: item.dateCode ?? item.DateCode ?? "",
      remark: item.remark,
    }));

    try {
      await qualityCheckGRNItems(payLoad);
      Alert("Quality check completed successfully", "success");
      handleClose();
      handleRefresh();
    } catch (error) {
      console.error("Quality check failed:", error);
      Alert("Quality check failed", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleRemarksPopoverOpen = (row, event) => {
    setActiveRowId(row.uniqueId);
    setTempRemarks(row.remark || "");
    setAnchorEl(event.currentTarget);
  };

  const handleDateCodeChange = (id, value) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dateCode: value } : item,
      ),
    );
  };

  const handleQCStatusChange = (id, value) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qcStatus: value.label } : item,
      ),
    );
  };

  const handleAcceptLineItem = async (row) => {
    try {
      await acceptLineItems({ lineItemIds: [row.id] });
      Alert("Line item accepted successfully", "success");
      fetchGRNDetails();
    } catch (error) {
      console.error("Failed to accept line item:", error);
      Alert("Failed to accept line item", "error");
    }
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

        setLineItems(
          sortedData.map((item) => ({
            ...item,
            isQcSubmitted: normalizeQcStatus(item.qcStatus) !== "pending",
          })),
        );
      }
    } catch (error) {
      Alert("Failed to load GRN details", "error");
      console.error("Error fetching GRN data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const lineItemColumns = [
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
      flex: 0.6,
      type: "number",
    },
    {
      field: "qcStatus",
      headerName: "QC Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Pending", "Pass", "Fail"],
      renderCell: ({ row }) => {
        const selected =
          qcStatusOptions.find(
            (opt) => opt.value === normalizeQcStatus(row.qcStatus),
          ) || null;

        if (!canEditLineItem(row)) {
          return <span>{row.qcStatus || "-"}</span>;
        }

        return (
          <Autocomplete
            fullWidth
            size="small"
            disableClearable
            options={qcStatusOptions}
            readOnly={!canEditLineItem(row)}
            value={selected}
            getOptionLabel={(opt) => opt.label}
            isOptionEqualToValue={(opt, val) => opt.value === val.value}
            onChange={(event, newValue) => {
              handleQCStatusChange(row.id, newValue);
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
                fontSize: "14px",
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Select"
                fullWidth
              />
            )}
          />
        );
      },
    },
    {
      field: "dateCode",
      headerName: "Date Code",
      flex: 1,
      filterable: false,
      renderCell: ({ row }) => (
        <TextField
          fullWidth
          value={row.dateCode ?? row.DateCode ?? ""}
          onChange={(e) => handleDateCodeChange(row.id, e.target.value)}
          inputProps={{
            readOnly: !canEditLineItem(row),
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
              fontSize: "14px",
            },
          }}
        />
      ),
    },
    {
      field: "remark",
      headerName: "Remarks",
      flex: 1,
      renderCell: ({ row, value }) => (
        <div
          onClick={(e) => {
            if (!canEditLineItem(row)) return;
            handleRemarksPopoverOpen(row, e);
          }}
        >
          <div>{value || (canEditLineItem(row) ? "Click to edit" : "-")}</div>
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      filterable: false,
      renderCell: ({ row }) => (
        <Button
          variant="contained"
          size="small"
          disabled={!canAcceptLineItem(row)}
          onClick={() => handleAcceptLineItem(row)}
        >
          Accept
        </Button>
      ),
    },
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
                  <div className="detailItem">
                    <p className="detailLabel">P.O Number</p>
                    <p
                      className="detailValue PO_Link"
                      onClick={() =>
                        navigateTo(
                          `/procurement/purchaseorders/${formData.purchaseOrderId}`,
                        )
                      }
                    >
                      {formData.purchaseOrderNumber}
                    </p>
                  </div>
                  <div className="detailItem">
                    <p className="detailLabel">P.O Status</p>
                    <p className="detailValue">{formData.poStatus}</p>
                  </div>
                  <div className="detailItem">
                    <p className="detailLabel">Received Date</p>
                    <p className="detailValue">{formData.receivedDate}</p>
                  </div>
                  <div className="detailItem">
                    <p className="detailLabel">Received By</p>
                    <p className="detailValue">{formData.receivedBy}</p>
                  </div>
                  <div className="detailItem">
                    <p className="detailLabel">Invoice Number</p>
                    <p className="detailValue">{formData.invoiceNumber}</p>
                  </div>
                  <div className="detailItem">
                    <p className="detailLabel">Invoice Date</p>
                    <p className="detailValue">{formData.invoiceDate}</p>
                  </div>
                  <div className="detailItem">
                    <p className="detailLabel">Location</p>
                    <p className="detailValue">{formData.locationName}</p>
                  </div>
                  <div className="detailItem">
                    <p className="detailLabel">Created On</p>
                    <p className="detailValue">{formData.createdDate}</p>
                  </div>
                </div>
              </div>

              {/* Reference + Description */}
              <div className="refDescGrid">
                <div className="refDescCard">
                  <h4 className="cardTitle">Reference</h4>
                  <div className="detailItem">
                    <p className="detailValue">{formData.reference || "-"}</p>
                  </div>
                </div>

                <div className="refDescCard">
                  <h4 className="cardTitle">Remarks(Excess/Shortage/Damage)</h4>
                  <div className="detailItem">
                    <p className="detailValue">{formData.description || "-"}</p>
                  </div>
                </div>
              </div>

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

          {!readOnlyMode && selectedGRN?.status === "In Process" && (
            <div className="GrnCreateFlyoutFooter">
              <Button
                onClick={() => {
                  handleSubmitQCheck();
                }}
              >
                Submit
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

export default EditQualityCheck;
