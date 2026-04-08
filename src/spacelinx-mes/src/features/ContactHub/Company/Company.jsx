import React, { useContext, useEffect, useState } from "react";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import {
  fetchCompanies,
  fetchPartners,
  fetchVendors,
  deleteCompany,
} from "../../../services/companyService";
import { AlertsContext } from "../../AlertsContext/Context";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCustomers } from "../../../services/customers";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import CreateCompany from "./CreateCompany.jsx";
import EditCompany from "./EditCompany.jsx";
import { FlyoutAlerts } from "../../AlertsContext/Alerts.jsx";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid.jsx";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";

const Company = () => {
  const { value } = useParams();
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const navigateTo = useNavigate();
  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const [pageTabValue, setPageTabValue] = useState("All");
  const [loadingData, setLoadingData] = useState(true);
  const [pageData, setPageData] = useState([]);
  const [pageDrawer, setPageDrawer] = useState("");
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);

  useEffect(() => {
    const capitalizedValue = capitalizeFirstLetter(value);
    setPageTabValue(capitalizedValue);
  }, [value]);

  useEffect(() => {
    fetchData();
  }, [pageTabValue]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      let data;
      switch (pageTabValue) {
        case "All":
          data = await fetchCompanies();
          break;
        case "Vendors":
          data = await fetchVendors();
          break;
        case "Partners":
          data = await fetchPartners();
          break;
        case "Customers":
          data = await fetchCustomers();
          break;
        default:
          data = await fetchCompanies();
      }
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setPageData(sortedData);
    } catch (error) {
      Alert(`Failed to fetch data..${error}`, "error");
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field:
        pageTabValue === "All"
          ? "companyCode"
          : pageTabValue === "Vendors"
          ? "vendorCode"
          : pageTabValue === "Partners"
          ? "partnerCode"
          : "customerCode",
      headerName: "Code",
      flex: 1,
      renderCell: ({ row }) => {
        // Determine if the user has modify permission for the current page
        let hasModifyPermission = false;
        const permissionKey = pageTabValue.toUpperCase();

        if (pageTabValue === "All") {
          hasModifyPermission =
            hasPermission(PERMISSIONS.VENDORS.MODIFY) ||
            hasPermission(PERMISSIONS.PARTNERS.MODIFY) ||
            hasPermission(PERMISSIONS.CUSTOMERS.MODIFY);
        } else if (PERMISSIONS[permissionKey]) {
          hasModifyPermission = hasPermission(
            PERMISSIONS[permissionKey].MODIFY
          );
        }

        const handleClick = () => {
          if (hasModifyPermission) {
            setSelectedCompanyData(row);
            setPageDrawer("edit");
          } else {
            Alert(
              `You don't have access to modify a ${pageTabValue
                .toLowerCase()
                .slice(0, -1)}`,
              "warning"
            );
          }
        };

        // Conditionally apply a CSS class based on permission to change cursor and link styling
        const linkClassName = hasModifyPermission
          ? "AppHyperLink"
          : "AppHyperLinkDisabled";

        const code =
          pageTabValue === "All"
            ? row.companyCode
            : pageTabValue === "Vendors"
            ? row.vendorCode
            : pageTabValue === "Partners"
            ? row.partnerCode
            : row.customerCode;

        return (
          <span className={linkClassName} onClick={handleClick}>
            {code}
          </span>
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
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
      headerName: " Website",
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
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "currencyCode",
      headerName: "Currency",
      flex: 1,
    },
    ...(pageTabValue === "Vendors"
      ? [
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
              row.onTimeDeliveryRate !== null
                ? `${row.onTimeDeliveryRate}%`
                : "N/A",
          },
        ]
      : []),
    ...(() => {
      const permissionKey = pageTabValue.toUpperCase();
      let hasDeletePermission = false;

      if (pageTabValue === "All") {
        hasDeletePermission =
          hasPermission(PERMISSIONS.VENDORS.DELETE) ||
          hasPermission(PERMISSIONS.PARTNERS.DELETE) ||
          hasPermission(PERMISSIONS.CUSTOMERS.DELETE);
      } else if (PERMISSIONS[permissionKey]) {
        hasDeletePermission = hasPermission(PERMISSIONS[permissionKey].DELETE);
      }

      return hasDeletePermission
        ? [
            {
              field: "delete",
              headerName: " ",
              width: 50,
              sortable: false,
              filterable: false,
              hideable: false,
              renderCell: (params) => {
                const handleDelete = async (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const entityType =
                    pageTabValue === "All"
                      ? "Company"
                      : pageTabValue.slice(0, -1);

                  const isConfirmed = await showConfirmation(
                    "Are you sure?",
                    `You want to delete this ${entityType}`
                  );

                  if (isConfirmed) {
                    try {
                      await deleteCompany(params.row.id);
                      Alert(`${entityType} deleted successfully!`, "success");
                      fetchData();
                    } catch (error) {
                      Alert(`Failed to delete ${entityType}!`, "error");
                      console.error("Delete company error:", error);
                    }
                  }
                };

                return (
                  <ion-icon
                    name="trash-outline"
                    onClick={handleDelete}
                    style={{
                      cursor: "pointer",
                      color: "#d32f2f",
                      fontSize: "18px",
                    }}
                  ></ion-icon>
                );
              },
            },
          ]
        : [];
    })(),
  ];

  return (
    <div className="PageMainDiv">
      <div className="PageMainDivHeader">
        <p className="PageHeading">Companies</p>
      </div>
      <div className="AdminPageTabsDiv">
        <div className="AdminPageTabs">
          {hasPermission(PERMISSIONS.VENDORS.VIEW) &&
            hasPermission(PERMISSIONS.PARTNERS.VIEW) &&
            hasPermission(PERMISSIONS.CUSTOMERS.VIEW) && (
              <button
                className={`TabButton ${
                  pageTabValue === "All" ? "Selected" : ""
                }`}
                onClick={() => {
                  setPageTabValue("All");
                  navigateTo("/contacthub/companies/all");
                }}
              >
                All
              </button>
            )}
          {hasPermission(PERMISSIONS.VENDORS.VIEW) && (
            <button
              className={`TabButton ${
                pageTabValue === "Vendors" ? "Selected" : ""
              }`}
              onClick={() => {
                setPageTabValue("Vendors");
                navigateTo("/contacthub/companies/vendors");
              }}
            >
              Vendors
            </button>
          )}{" "}
          {hasPermission(PERMISSIONS.PARTNERS.VIEW) && (
            <button
              className={`TabButton ${
                pageTabValue === "Partners" ? "Selected" : ""
              }`}
              onClick={() => {
                setPageTabValue("Partners");
                navigateTo("/contacthub/companies/partners");
              }}
            >
              Partners
            </button>
          )}{" "}
          {hasPermission(PERMISSIONS.CUSTOMERS.VIEW) && (
            <button
              className={`TabButton ${
                pageTabValue === "Customers" ? "Selected" : ""
              }`}
              onClick={() => {
                setPageTabValue("Customers");
                navigateTo("/contacthub/companies/customers");
              }}
            >
              Customers
            </button>
          )}
        </div>{" "}
        <button
          className="AddOrUpdateButton"
          onClick={() => {
            const permissionKey = pageTabValue.toUpperCase();
            let hasCreatePermission = false;
            if (pageTabValue === "All") {
              hasCreatePermission =
                hasPermission(PERMISSIONS.VENDORS.MODIFY) ||
                hasPermission(PERMISSIONS.PARTNERS.MODIFY) ||
                hasPermission(PERMISSIONS.CUSTOMERS.MODIFY);
            } else if (PERMISSIONS[permissionKey]) {
              hasCreatePermission = hasPermission(
                PERMISSIONS[permissionKey].MODIFY
              );
            }

            if (hasCreatePermission) {
              setPageDrawer("Create");
            } else {
              Alert(
                `You don't have access to create a ${pageTabValue
                  .toLowerCase()
                  .slice(0, -1)}`,
                "warning"
              );
            }
          }}
        >
          + Add New
        </button>
      </div>
      <div className="AdminPageContent">
        <StyledDataGrid
          rows={pageData}
          columns={columns}
          className="DataGrid"
          loading={loadingData}
        />
      </div>
      <ResizableDrawer
        anchor="right"
        open={pageDrawer}
        onClose={() => setPageDrawer("")}
        defaultWidth={70}
      >
        {pageDrawer === "Create" ? (
          <CreateCompany
            pageTabValue={capitalizeFirstLetter(pageTabValue)}
            setPageDrawer={setPageDrawer}
            fetchCompanyData={fetchData}
          />
        ) : (
          <EditCompany
            selectedCompanyData={selectedCompanyData}
            fetchCompanyData={fetchData}
            setPageDrawer={setPageDrawer}
            pageTabValue={pageTabValue}
          />
        )}
      </ResizableDrawer>{" "}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default Company;
