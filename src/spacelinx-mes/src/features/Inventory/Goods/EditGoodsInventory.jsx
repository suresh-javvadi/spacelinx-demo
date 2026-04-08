import React, { useEffect, useState, useContext } from "react";
import { Button, Tab, TextField } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { fetchInventoryTransactionsByPart } from "../../../services/inventoryTransaction";
import PartInventory from "../../admin/parts/PartInventory";
import { updatePart } from "../../../services/partService";
import { useUserContext } from "../../userContext/UserContext";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import "../../materialKits/Kits.css";

const EditGoodsInventory = ({
  partId,
  partTypeId,
  selectedGoodInventory,
  handleClose,
  handleRefresh,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [inventoryTransactionData, setInventoryTransactionData] = useState([]);
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    partTypeId: partTypeId || "",
  });
  const [originalFormData, setOriginalFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  // const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (editFlyOutTabsValue !== "2" || !partId) {
        return;
      }

      // setLoadingTransactions(true);
      setLoadingData(true);
      try {
        const data = await fetchInventoryTransactionsByPart(partId);
        if (Array.isArray(data)) {
          const sortedData = [...data].sort(
            (a, b) => new Date(b.transactionDate) - new Date(a.transactionDate),
          );
          setInventoryTransactionData(sortedData);
        } else {
          setInventoryTransactionData([]);
        }
      } catch (error) {
        console.error(
          "Error fetching Inventory Transaction Data:",
          error?.response?.data || error.message,
        );
        Alert("Error fetching Inventory Transaction Data", "error");
      } finally {
        // setLoadingTransactions(false);
        setLoadingData(false);
      }
    };

    fetchData();
  }, [partId, editFlyOutTabsValue]);

  const newFlyoutTabChange = (event, newValue) =>
    setEditFlyOutTabsValue(newValue);

  useEffect(() => {
    if (selectedGoodInventory) {
      const initialData = {
        name: selectedGoodInventory.partName || "",
        description: selectedGoodInventory.description || "",
        makeBuy: selectedGoodInventory.makeBuy || 1,
        isSerialNumberRequired:
          selectedGoodInventory.isSerialNumberRequired ?? true,
        partTypeId: selectedGoodInventory?.partTypeId || partTypeId || "",
      };

      setFormData(initialData);
      setOriginalFormData(initialData);
    }
  }, [selectedGoodInventory, partTypeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    if (!partId) {
      Alert("Part ID is missing. Cannot update.", "error");
      return;
    }
    setLoadingData(true);
    try {
      const payload = {
        id: partId,
        name: formData.name,
        description: formData.description,
        partTypeId: formData.partTypeId,
        makeBuy: formData.makeBuy,
        isSerialNumberRequired: formData.isSerialNumberRequired,
        itemType: "Goods",
      };

      await updatePart(partId, payload);
      Alert("Goods Inventory updated successfully", "success");
      setReadOnlyMode(true);
      handleClose();
      handleRefresh();
    } catch (err) {
      console.error("Update Error:", err);
      Alert(
        err?.response?.data?.message || "Failed to update Goods Inventory",
        "error",
      );
    } finally {
      setLoadingData(false);
      setReadOnlyMode(true);
    }
  };

  const handleReset = () => {
    if (originalFormData) {
      setFormData(originalFormData);
    }
    setErrors({});
    setReadOnlyMode(true);
  };

  const columns = [
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
        <h2>{`${selectedGoodInventory?.partNumber} Details`}</h2>
        <div className="ActionsContainer">
          {editFlyOutTabsValue === "3" && readOnlyMode && (
            <button
              onClick={() => {
                if (!hasPermission(PERMISSIONS.GOODS.MODIFY)) {
                  Alert("You do not have access to edit this..", "warning");
                  return;
                }
                setReadOnlyMode(false);
              }}
            >
              <ion-icon name="create-outline"></ion-icon>
            </button>
          )}
          <button onClick={handleClose}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          <TabContext value={editFlyOutTabsValue}>
            <div className="EditFlyoutTabsPanel">
              <TabList
                onChange={newFlyoutTabChange}
                centered
                variant="fullWidth"
              >
                <Tab label="Inventory" value="1" />
                {hasPermission(PERMISSIONS.GOODS.TRANSACTIONS.VIEW) && (
                  <Tab label="Transactions" value="2" />
                )}

                <Tab label="Details" value="3" />
              </TabList>
            </div>

            <TabPanel value="1" className="reqNewFlyoutTabPanel">
              <PartInventory selectedPartId={partId} />
            </TabPanel>
            <TabPanel value="2" className="reqNewFlyoutTabPanel">
              <div className="GrnEditDataGridDiv">
                {loadingData ? (
                  <div className="loader-container">
                    <Cliploader loading={loadingData} />
                  </div>
                ) : (
                  <StyledDataGrid
                    rows={inventoryTransactionData}
                    columns={columns}
                    getRowId={(row) => row.id}
                    className="DataGrid"
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    autoHeight={false}
                  />
                )}
              </div>
            </TabPanel>
            <TabPanel value="3" className="reqNewFlyoutTabPanel">
              <div className="GrnNewFlyoutContent">
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  inputProps={{ readOnly: readOnlyMode }}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
                <TextField
                  label="Description"
                  name="description"
                  type="text"
                  fullWidth
                  value={formData.description}
                  onChange={handleChange}
                  inputProps={{ readOnly: readOnlyMode }}
                  multiline
                  rows={4}
                />
              </div>
            </TabPanel>

            {!readOnlyMode && editFlyOutTabsValue === "3" && (
              <div className="EditFlyoutFooter">
                <Button onClick={handleReset}>Reset</Button>
                <div className="update-reset">
                  <Button className="CancelButton" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={loadingData}>
                    Update
                  </Button>
                </div>
              </div>
            )}
          </TabContext>
        </>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditGoodsInventory;
