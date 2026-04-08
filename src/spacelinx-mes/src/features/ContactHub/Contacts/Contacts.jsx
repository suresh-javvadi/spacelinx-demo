import React, { useCallback, useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import Button from "@mui/material/Button";
import Cliploader from "../../../Components/Loaders/Cliploader";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import NewContact from "./NewContact";
import EditContact from "./EditContact";
import {
  deleteCompanyContact,
  fetchCompanyContact,
} from "../../../services/companyContactService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Contacts = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [contactData, setContactData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [createContactsDrawerStatus, setCreateContactsDrawerStatus] =
    useState(false);
  const [editContactsDrawerStatus, setEditContactsDrawerStatus] =
    useState(false);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const contactsData = await fetchCompanyContact();
      if (contactsData) {
        contactsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setContactData(contactsData);
      }
    } catch (error) {
      Alert("Error fetching Contacts data", "error");
      console.error("Error fetching Contacts data:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleRowClick = (params) => {
    setSelectedRowData(params.row);
    setEditContactsDrawerStatus(true);
  };

  const handleCloseClick = () => {
    setCreateContactsDrawerStatus(false);
    setEditContactsDrawerStatus(false);
  };

  const handleDeleteRow = async (id, e) => {
    const confirmed = await showConfirmation(
      "Are you sure?",
      "You want to delete this contact?"
    );

    if (confirmed) {
      try {
        await deleteCompanyContact(id);
        showAlert("success", "Deleted!", "Contact deleted successfully!");
        fetchData();
      } catch (error) {
        console.error("Delete failed:", error);
        showAlert("error", "Error", "Failed to delete contact. Try again.");
      }
    }
  };

  const canModifyContacts = hasPermission(PERMISSIONS.CONTACTS.MODIFY);
  const canDeleteContacts = hasPermission(PERMISSIONS.CONTACTS.DELETE);

  const columns = [
    {
      field: "firstName",
      headerName: "First Name",
      flex: 1,
      valueGetter: (_value, row) => row.contact.firstName || "",
    },
    {
      field: "lastName",
      headerName: "Last Name",
      flex: 1,
      valueGetter: (_value, row) => row.contact.lastName || "",
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1,
      valueGetter: (_value, row) => row.company?.name || "",
    },
    {
      field: "contactType",
      headerName: "Contact Type",
      flex: 1,
      valueGetter: (_value, row) => row.contactType || "",
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 1,
      valueGetter: (_value, row) => row.contact.jobTitle || "",
    },
    {
      field: "phoneNumber",
      headerName: "Phone Number",
      flex: 1,
      valueGetter: (_value, row) => row.contact.phoneNumber || "",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      valueGetter: (_value, row) => row.contact.email || "",
    },
    ...(canDeleteContacts
      ? [
          {
            headerName: "Actions",
            flex: 0.5,

            renderCell: ({ row }) => (
              <ion-icon
                name="trash-outline"
                style={{ cursor: "pointer", color: "red" }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteRow(row.id, event);
                }}
              ></ion-icon>
            ),
          },
        ]
      : []),
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
              <p className="PageHeader">Contacts</p>
            </div>
            <div className="AdminChildrenHeaderControls">
              <Button
                onClick={() => {
                  if (canModifyContacts) {
                    setCreateContactsDrawerStatus(true);
                  } else {
                    Alert("You do not have access to create..!", "warning");
                  }
                }}
                className={!canModifyContacts ? "IonIconDisabled" : undefined}
                disabled={!canModifyContacts}
              >
                + Add New
              </Button>
            </div>
          </div>
          <div className="MasterDataDataGridDiv">
            <StyledDataGrid
              rows={contactData}
              columns={columns}
              pageSize={5}
              className="DataGrid"
              onRowClick={canModifyContacts ? handleRowClick : undefined}
            />
          </div>

          <ResizableDrawer
            anchor="right"
            open={createContactsDrawerStatus || editContactsDrawerStatus}
            onClose={handleCloseClick}
            defaultWidth={50}
          >
            {createContactsDrawerStatus ? (
              <NewContact
                handleCloseClick={() => setCreateContactsDrawerStatus(false)}
                handleRefresh={handleRefresh}
                contactData={contactData}
              />
            ) : (
              <EditContact
                handleCloseClick={() => setEditContactsDrawerStatus(false)}
                contactData={selectedRowData}
                handleRefresh={handleRefresh}
              />
            )}
          </ResizableDrawer>
        </div>
      )}
    </>
  );
};

export default Contacts;
