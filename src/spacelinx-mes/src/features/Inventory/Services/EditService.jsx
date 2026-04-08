import React, { useState, useEffect, useContext } from "react";
import { Tab, TextField, Button } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import PartInventory from "../../admin/parts/PartInventory";
import { fetchInventoryTransactionsByPart } from "../../../services/inventoryTransaction";
import { updatePart } from "../../../services/partService";
import { AlertsContext } from "../../AlertsContext/Context";
import { useUserContext } from "../../userContext/UserContext";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import "../../materialKits/Kits.css";

const EditService = ({
  partId,
  partData,
  partTypeId,
  handleCloseClick,
  handleRefresh,
}) => {
  const { hasPermission } = useUserContext();
  const [editServiceTabsValue, setEditServiceTabsValue] = useState("1");
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});

  const { Alert } = useContext(AlertsContext);

  const serviceTabChange = (event, newValue) =>
    setEditServiceTabsValue(newValue);

  useEffect(() => {
    if (partData) {
      const initialData = {
        name: partData?.partName || "",
        description: partData?.description || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [partData]);

  useEffect(() => {
    const getTransactions = async () => {
      if (partId && editServiceTabsValue === "2") {
        setLoadingTransactions(true);
        try {
          const data = await fetchInventoryTransactionsByPart(partId);
          const sortedData = [...data].sort(
            (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)
          );
          setTransactions(sortedData);
        } catch (error) {
          setTransactions([]);
        } finally {
          setLoadingTransactions(false);
        }
      }
    };

    getTransactions();
  }, [partId, editServiceTabsValue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Service name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoadingData(true);
    try {
      await updatePart(partId, {
        name: formData.name,
        description: formData.description,
        itemType: "Services",
        partTypeId: partTypeId,
      });
      Alert("Service details updated successfully", "success");
      handleRefresh();
      setEditMode(false);
      handleCloseClick();
    } catch (error) {
      Alert("Failed to update service details", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setEditMode(false);
    setErrors({});
  };

  const transactionColumns = [
    {
      field: "transactionDate",
      headerName: "Date",
      flex: 1.2,
      type: "date",
      valueGetter: (value, row) =>
        row?.transactionDate ? new Date(row.transactionDate) : null,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString() : "-",
    },
    {
      field: "transactionType",
      headerName: "Type",
      flex: 1,
    },
    {
      field: "createdByFullName",
      headerName: "Created By",
      flex: 1,
    },
    {
      field: "previousQuantity",
      headerName: "Previous Qty",
      flex: 1,
      type: "number",
    },
    {
      field: "currentQuantity",
      headerName: "Current Qty",
      flex: 1,
      type: "number",
    },
    {
      field: "transactedQuantity",
      headerName: "Transacted Qty",
      flex: 1,
      type: "number",
    },
    {
      field: "fromLocationName",
      headerName: "From Location",
      flex: 1,
      valueGetter: (_value, row) => row?.fromLocationName || "-",
    },
    {
      field: "toLocationName",
      headerName: "To Location",
      flex: 1,
      valueGetter: (_value, row) => row?.toLocationName || "-",
    },
    {
      field: "reference",
      headerName: "Reference",
      flex: 1.5,
      renderCell: ({ row }) => {
        const type = row.referenceType || "";
        const number = row.referenceNumber || "";
        const link = `/procurement/purchaseorders/${row?.referenceId}`;

        return (
          <span>
            {number && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(link, "_blank");
                }}
                className="AppHyperLink"
              >
                {number}
              </span>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>{partData.partName || "Service Details"}</h2>
        <div className="ActionsContainer">
          {editServiceTabsValue === "3" && !editMode && (
            <button
              onClick={() => {
                if (!hasPermission(PERMISSIONS.SERVICES.MODIFY)) {
                  Alert("You don't have access to edit service", "warning");
                  return;
                }
                setEditMode(true);
              }}
            >
              <ion-icon
                name="create-outline"
                class={
                  !hasPermission(PERMISSIONS.SERVICES.MODIFY)
                    ? "IonIconDisabled"
                    : undefined
                }
              ></ion-icon>
            </button>
          )}

          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      <TabContext value={editServiceTabsValue}>
        <div className="EditFlyoutTabsPanel">
          <TabList onChange={serviceTabChange} centered variant="fullWidth">
            <Tab label="Inventory" value="1" />
            {hasPermission(PERMISSIONS.SERVICES.TRANSACTIONS.VIEW) && (
              <Tab label="Transactions" value="2" />
            )}
            <Tab label="Details" value="3" />
          </TabList>
        </div>

        {loadingData ? (
          <div className="loader-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : (
          <>
            <TabPanel value="1" className="reqNewFlyoutTabPanel">
              <PartInventory selectedPartId={partId} />
            </TabPanel>

            <TabPanel value="2" className="reqNewFlyoutTabPanel">
              <div className="GrnEditDataGridDiv">
                {loadingTransactions ? (
                  <div className="loader-container">
                    <Cliploader loading={loadingTransactions} />
                  </div>
                ) : (
                  <StyledDataGrid
                    rows={transactions}
                    columns={transactionColumns}
                    getRowId={(row) => row.id}
                    pageSize={5}
                    className="DataGrid"
                    autoHeight={false}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                  />
                )}
              </div>
            </TabPanel>
            <TabPanel value="3" className="reqNewFlyoutTabPanel">
              <div className="GrnNewFlyoutContent">
                <TextField
                  label="Service Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  inputProps={{ readOnly: !editMode }}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />

                <TextField
                  label="Description"
                  name="description"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  inputProps={{ readOnly: !editMode }}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </div>
            </TabPanel>

            {editMode && editServiceTabsValue === "3" && (
              <div className="EditFlyoutFooter">
                <Button className="CancelButton" onClick={handleReset}>
                  Reset
                </Button>
                <div className="update-reset">
                  <Button onClick={() => handleSave()}>Save</Button>
                </div>
              </div>
            )}

            <div className="AlertMessages">
              <FlyoutAlerts />
            </div>
          </>
        )}
      </TabContext>
    </div>
  );
};

export default EditService;
