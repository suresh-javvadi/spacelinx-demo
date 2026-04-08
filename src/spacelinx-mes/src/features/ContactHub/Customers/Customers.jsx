import React, { useCallback, useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { useUserContext } from "../../userContext/UserContext";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { fetchCustomers } from "../../../services/customers";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { Button } from "@mui/material";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import CreateVendor from "../../Procurement/vendors/NewVendor";
import UpdateVendor from "../../Procurement/vendors/EditVendorDetails";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { deleteCompany } from "../../../services/companyService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const defaultHiddenColumns = {
  contactName: false,
  alternatePhone: false,
  email: false,
  currencyCode: false,
  totalOrders: false,
  totalSpent: false,
  onTimeDeliveryRate: false,
};

const Customers = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [customersData, setCustomersData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [createCustomerDrawerStatus, setCreateCustomerDrawerStatus] =
    useState(false);
  const [editCustomerDrawerStatus, setEditCustomerDrawerStatus] =
    useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = sessionStorage.getItem("vendorColumnVisibility");
    return saved ? JSON.parse(saved) : defaultHiddenColumns;
  });

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const customersData = await fetchCustomers();
      if (customersData) {
        customersData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCustomersData(customersData);
      }
    } catch (error) {
      Alert("Error fetching Customers data", "error");
      console.error("Error fetching Customers data:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingData(true);
      try {
        const response = await fetchOptionSetByName("vendor_categories");
        setCategoryTypes(response ? JSON.parse(response.values) : []);
      } catch (error) {
        Alert("Error fetching categories", "error");
      } finally {
        setLoadingData(false);
      }
    };
    fetchCategories();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleRowClick = (params) => {
    setSelectedRowData(params.row);
    setEditCustomerDrawerStatus(true);
  };

  const handleCloseClick = () => {
    setCreateCustomerDrawerStatus(false);
    setEditCustomerDrawerStatus(false);
  };

  const canModifyCustomers = hasPermission(PERMISSIONS.CUSTOMERS.MODIFY);
  const canDeleteCustomer = hasPermission(PERMISSIONS.CUSTOMERS.DELETE);

  const columns = [
    {
      field: "customerCode",
      headerName: "Code",
      flex: 1,
      renderCell: ({ row }) => (
        <span className="AppHyperLink">{row.customerCode}</span>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "taxId",
      headerName: "Tax Number",
      flex: 1,
      valueGetter: (_value, row) => row.taxId || "--",
    },
    {
      field: "phoneNumber",
      headerName: "Phone",
      flex: 1,
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueGetter: (_value, row) => row.category || "NA",
    },
    {
      field: "paymentTerm",
      headerName: "Payment Terms",
      flex: 1,
      valueGetter: (_value, row) => row.paymentTerm?.name || "--",
    },
    {
      field: "website",
      headerName: "Supplier Website",
      flex: 1,
      renderCell: ({ row }) => {
        const website = row.website;
        return website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="AppHyperLink"
          >
            {website}
          </a>
        ) : (
          "--"
        );
      },
    },
    {
      field: "contactName",
      headerName: "Contact Name",
      flex: 1,
    },
    {
      field: "alternatePhone",
      headerName: "Alternate Phone",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "currencyCode",
      headerName: "Currency",
      flex: 1,
    },
    {
      field: "totalOrders",
      headerName: "Total Orders",
      flex: 1,
    },
    {
      field: "totalSpent",
      headerName: "Total Spent",
      flex: 1,
    },
    {
      field: "onTimeDeliveryRate",
      headerName: "On-Time Delivery (%)",
      flex: 1,
      valueGetter: (_value, row) =>
        row.onTimeDeliveryRate !== null ? `${row.onTimeDeliveryRate}%` : "N/A",
    },
    canDeleteCustomer
      ? {
          field: "delete",
          headerName: " ",
          width: 50,
          sortable: false,
          filterable: false,
          hideable: false,

          renderCell: ({ row }) => {
            const handleDelete = async (e) => {
              e.preventDefault();
              e.stopPropagation();

              const isConfirmed = await showConfirmation(
                "Are you sure?",
                "You Want to delete vendor"
              );
              if (isConfirmed) {
                try {
                  await deleteCompany(row.id);
                  showAlert(
                    "success",
                    "Deleted!",
                    "Vendor Deleted successfully!"
                  );
                  fetchData();
                } catch (error) {
                  showAlert(
                    "error",
                    "Error",
                    "Failed to delete vendor. Try again."
                  );
                  console.error("Delete vendor error:", error);
                }
              }
            };

            return (
              <ion-icon
                name="trash-outline"
                onClick={handleDelete}
                class="trash-icon"
              ></ion-icon>
            );
          },
        }
      : [],
  ];
  return (
    <>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="AdminChildren">
          <div className="AdminChildrenHeader">
            <div>
              <p className="PageHeader">Customers</p>
            </div>
            <div className="AdminChildrenHeaderControls">
              <Button
                onClick={() => {
                  if (canModifyCustomers) {
                    setCreateCustomerDrawerStatus(true);
                  } else {
                    Alert("You do not have access to create..!", "warning");
                  }
                }}
                className={!canModifyCustomers ? "IonIconDisabled" : undefined}
                disabled={!canModifyCustomers}
              >
                + Add New
              </Button>
            </div>
          </div>
          <div className="MasterDataDataGridDiv">
            <StyledDataGrid
              rows={customersData}
              columns={columns}
              pageSize={5}
              className="DataGrid"
              onRowClick={handleRowClick}
              getRowId={(row) => row.id}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => {
                setColumnVisibilityModel(newModel);
                sessionStorage.setItem(
                  "vendorColumnVisibility",
                  JSON.stringify(newModel)
                );
              }}
            />
          </div>
          <ResizableDrawer
            anchor="right"
            open={createCustomerDrawerStatus || editCustomerDrawerStatus}
            onClose={handleCloseClick}
            defaultWidth={70}
          >
            {createCustomerDrawerStatus ? (
              <CreateVendor
                handleCloseClick={() => setCreateCustomerDrawerStatus(false)}
                handleRefresh={handleRefresh}
                categoryTypes={categoryTypes}
                entityType="customer"
              />
            ) : (
              <UpdateVendor
                handleCloseClick={() => setEditCustomerDrawerStatus(false)}
                onEdit={handleRefresh}
                selectedVendorData={selectedRowData}
                categoryTypes={categoryTypes}
                entityType="customer"
              />
            )}
          </ResizableDrawer>

          <div className="AlertMessages">
            <HomeAlerts />
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;
