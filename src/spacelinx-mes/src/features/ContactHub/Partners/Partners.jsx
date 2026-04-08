import React, { useState, useEffect, useContext } from "react";
import { Button } from "@mui/material";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchPartners, deleteCompany } from "../../../services/companyService";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import CreateVendor from "../../Procurement/vendors/NewVendor";
import UpdateVendor from "../../Procurement/vendors/EditVendorDetails";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const defaultHiddenColumns = {
  companyCode: false,
  vendorCode: false,
  customerCode: false,
  contactName: false,
  alternatePhone: false,
  email: false,
  currencyCode: false,
  qualityScore: false,
  department: false,
  totalOrders: false,
  totalSpent: false,
  avgOrderValue: false,
  onTimeDeliveryRate: false,
  memberSince: false,
  lastActivityDate: false,
  notes: false,
};

const Partners = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [partnersData, setPartnersData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [createPartnerDrawerStatus, setCreatePartnerDrawerStatus] =
    useState(false);
  const [editPartnerDrawerStatus, setEditPartnerDrawerStatus] = useState(false);
  const canDeletePartner = hasPermission(PERMISSIONS.PARTNERS.DELETE);
  const canModifyPartner = hasPermission(PERMISSIONS.PARTNERS.MODIFY);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = sessionStorage.getItem("ColumnVisibility");
    return saved ? JSON.parse(saved) : defaultHiddenColumns;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPartners();
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPartnersData(sortedData);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      Alert("Failed to fetch partners. Please try again...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

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
    setEditPartnerDrawerStatus(true);
  };

  const handleCloseClick = () => {
    setCreatePartnerDrawerStatus(false);
    setEditPartnerDrawerStatus(false);
  };

  const columns = [
    {
      field: "partnerCode",
      headerName: "Code",
      flex: 1,
      renderCell: ({ row }) => (
        <span className="AppHyperLink">{row.partnerCode}</span>
      ),
    },
    {
      field: "companyCode",
      headerName: "Company Code",
      flex: 1,
    },
    {
      field: "vendorCode",
      headerName: "Vendor Code",
      flex: 1,
    },
    {
      field: "customerCode",
      headerName: "Customer Code",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1.5,
    },
    {
      field: "contactName",
      headerName: "Contact Name",
      flex: 1,
      valueGetter: (_value, row) => row.contactName || "--",
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      valueGetter: (_value, row) => row.phoneNumber || "--",
    },
    {
      field: "alternatePhone",
      headerName: "Alternate Phone",
      flex: 1,
      valueGetter: (_value, row) => row.alternatePhone || "--",
    },
    {
      field: "website",
      headerName: "Website",
      flex: 1.5,
      renderCell: ({ row }) =>
        row.website ? (
          <a
            href={
              row.website.startsWith("http")
                ? row.website
                : `https://${row.website}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="AppHyperLink"
          >
            {row.website}
          </a>
        ) : (
          "--"
        ),
    },
    {
      field: "taxId",
      headerName: "Tax ID",
      flex: 1,
      valueGetter: (_value, row) => row.taxId || "--",
    },
    {
      field: "currencyCode",
      headerName: "Currency",
      flex: 1,
      valueGetter: (_value, row) =>
        row.currency?.symbol
          ? `${row.currency.symbol} (${row.currency.code})`
          : row.currencyCode || "--",
    },
    {
      field: "qualityScore",
      headerName: "Quality Score",
      flex: 1,
      valueGetter: (_value, row) =>
        row.qualityScore !== null ? row.qualityScore : "--",
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueGetter: (_value, row) => row.category || "--",
    },
    {
      field: "department",
      headerName: "Department",
      flex: 1,
      valueGetter: (_value, row) => row.department || "--",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      valueGetter: (_value, row) => row.email || "--",
    },
    {
      field: "paymentTerm",
      headerName: "Payment Term",
      flex: 1.5,
      valueGetter: (_value, row) => row.paymentTerm?.name || "--",
    },
    {
      field: "totalOrders",
      headerName: "Total Orders",
      flex: 1,
      valueGetter: (_value, row) =>
        row.totalOrders !== null ? row.totalOrders : "--",
    },
    {
      field: "totalSpent",
      headerName: "Total Spent",
      flex: 1,
      valueGetter: (_value, row) =>
        row.totalSpent !== null ? `₹${row.totalSpent.toLocaleString()}` : "--",
    },
    {
      field: "avgOrderValue",
      headerName: "Average Order Value",
      flex: 1,
      valueGetter: (_value, row) =>
        row.avgOrderValue !== null ? row.avgOrderValue : "--",
    },
    {
      field: "onTimeDeliveryRate",
      headerName: "On-Time Delivery (%)",
      flex: 1,
      valueGetter: (_value, row) =>
        row.onTimeDeliveryRate !== null ? `${row.onTimeDeliveryRate}%` : "--",
    },
    {
      field: "memberSince",
      headerName: "Member Since",
      flex: 1,
      valueGetter: (_value, row) =>
        row.memberSince ? new Date(row.memberSince).toLocaleDateString() : "--",
    },
    {
      field: "lastActivityDate",
      headerName: "Last Activity Date",
      flex: 1,
      valueGetter: (_value, row) =>
        row.lastActivityDate
          ? new Date(row.lastActivityDate).toLocaleDateString()
          : "--",
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      valueGetter: (_value, row) => row.notes || "--",
    },

    ...(canDeletePartner
      ? [
          {
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

                const confirmed = await showConfirmation(
                  "Are you sure?",
                  "Do you want to delete this partner?"
                );
                if (confirmed) {
                  try {
                    await deleteCompany(row.id);
                    showAlert(
                      "success",
                      "Deleted!",
                      "Partner deleted successfully!"
                    );
                    fetchData();
                  } catch (error) {
                    showAlert("error", "Error", "Failed to delete partner!");
                    console.error("Delete Partner Error:", error);
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
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Partners</p>
          <Button
            onClick={() => {
              if (canModifyPartner) {
                setCreatePartnerDrawerStatus(true);
              } else {
                Alert("You do not have access to create..!", "warning");
              }
            }}
            className={!canModifyPartner ? "IonIconDisabled" : undefined}
          >
            + Add New
          </Button>
        </div>
        <div className="DataGridDiv">
          <StyledDataGrid
            rows={partnersData}
            loading={loadingData}
            columns={columns}
            pageSize={5}
            className="DataGrid"
            onRowClick={handleRowClick}
            getRowId={(row) => row.id}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              sessionStorage.setItem(
                "ColumnVisibility",
                JSON.stringify(newModel)
              );
            }}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createPartnerDrawerStatus || editPartnerDrawerStatus}
          onClose={handleCloseClick}
          defaultWidth={70}
        >
          {createPartnerDrawerStatus ? (
            <CreateVendor
              handleCloseClick={() => setCreatePartnerDrawerStatus(false)}
              handleRefresh={handleRefresh}
              categoryTypes={categoryTypes}
              entityType="Partner"
            />
          ) : (
            <UpdateVendor
              handleCloseClick={() => setEditPartnerDrawerStatus(false)}
              onEdit={handleRefresh}
              selectedVendorData={selectedRowData}
              categoryTypes={categoryTypes}
              entityType="Partner"
            />
          )}
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Partners;
