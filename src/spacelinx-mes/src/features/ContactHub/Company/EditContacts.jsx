import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  CircularProgress,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  fetchCompanyContactByVendorId,
  deleteCompanyContact,
} from "../../../services/companyContactService";
import {
  createCompanyContact,
  UpdateCompanyContact,
} from "../../../services/contactService";
import {
  showConfirmation,
  showAlert,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";

import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const EditContacts = ({ selectedCompanyId }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  const [contactsData, setContactsData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    notes: "",
    alternatePhone: "",
    companyName: "",
    jobTitle: "",
    contactType: null,
  });

  const contactTypes = [
    { name: "Primary" },
    { name: "Secondary" },
    { name: "Billing" },
    { name: "Technical" },
  ];

  const requiredFields = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    contactType: "Contact Type",
  };

  const resetForm = () => {
    setContactsData({
      salutation: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      notes: "",
      alternatePhone: "",
      contactType: null,
      companyName: "",
      jobTitle: "",
    });
    setIsEditing(false);
    setEditId(null);
  };
  const closeAccordionAndReset = () => {
    setAccordionOpen(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactsData((prev) => ({ ...prev, [name]: value }));

    if (name === "phoneNumber") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber:
          value.trim() !== "" && !/^\d{10}$/.test(value.trim())
            ? "Phone number must be exactly 10 digits"
            : "",
      }));
    }
    if (name === "email") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? "Invalid email format"
          : "",
      }));
    }

    if (name === "alternatePhone") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        alternatePhone:
          value.trim() !== "" && !/^\d{10}$/.test(value.trim())
            ? "Alternate phone number must be exactly 10 digits"
            : "",
      }));
    }
    if (requiredFields[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: value.trim() ? "" : `${requiredFields[name]} is required`,
      }));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    Object.keys(requiredFields).forEach((field) => {
      if (!contactsData[field]) {
        newErrors[field] = `${requiredFields[field]} is required`;
      }
    });

    if (contactsData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactsData.email.trim())) {
        newErrors.email = "Invalid email format";
      }
    }

    if (contactsData.phoneNumber.trim()) {
      if (!/^\d{10}$/.test(contactsData.phoneNumber.trim())) {
        newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      }
    }

    if (contactsData.alternatePhone.trim()) {
      if (!/^\d{10}$/.test(contactsData.alternatePhone.trim())) {
        newErrors.alternatePhone =
          "Alternate phone number must be exactly 10 digits.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateContact = async () => {
    if (!selectedCompanyId) return;
    if (!validateFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoading(true);
    setRowsLoading(true);
    closeAccordionAndReset();
    try {
      await createCompanyContact({
        id: selectedCompanyId,
        contactType: contactsData.contactType,
        contact: contactsData,
      });
      await fetchContacts();
      resetForm();
      setAccordionOpen(false);

      Alert("Vendor Contact Added Successfully!", "success");
    } catch (error) {
      console.error("Error creating contact:", error);
      Alert("Failed to Add Vendor Contact", "error");
    } finally {
      setLoading(false);
      setRowsLoading(false);
    }
  };

  const handleEditContact = async () => {
    if (!selectedCompanyId || !editId) return;
    if (!validateFields()) {
      Alert("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);
    setRowsLoading(true);
    closeAccordionAndReset();

    try {
      const payload = {
        id: editId,
        contactType: contactsData.contactType,
        contact: contactsData,
      };
      await UpdateCompanyContact(selectedCompanyId, payload);
      await fetchContacts();
      Alert("Contact updated successfully!", "success");
    } catch (error) {
      Alert("Error updating contact", "error");
    } finally {
      setLoading(false);
      setRowsLoading(false);
    }
  };

  const fetchContacts = async () => {
    setRowsLoading(true);
    try {
      const data = await fetchCompanyContactByVendorId(selectedCompanyId);
      setRows(data || []);
    } catch (error) {
      Alert("Failed to fetch contacts", "error");
      setRows([]);
    } finally {
      setRowsLoading(false);
    }
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
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
        showAlert("error", "Error", "Failed to delete contact. Try again.");
      }
    }
  };

  const handleRowClick = (params) => {
    const selected = params.row;
    setAccordionOpen(true);
    setEditId(selected.id);
    setContactsData({
      ...selected.contact,
      contactType: selected.contactType,
    });
    setIsEditing(true);
  };

  useEffect(() => {
    if (selectedCompanyId !== null) fetchContacts();
  }, [selectedCompanyId]);

  const columns = [
    {
      field: "firstName",
      headerName: "Name",
      flex: 1,
      valueGetter: (_value, row) => {
        return row.contact.firstName;
      },
    },
    {
      field: "PhoneNumber",
      headerName: "Number",
      flex: 1,
      valueGetter: (_value, row) => {
        return row.contact.phoneNumber;
      },
    },
    {
      field: "email",
      headerName: "Email Id",
      flex: 1,
      valueGetter: (_value, row) => {
        return row.contact.email;
      },
    },

    {
      field: "contactType",
      headerName: "Contact Type",
      flex: 1,
    },
    hasPermission(PERMISSIONS.VENDORS.CONTACTS.DELETE)
      ? {
          headerName: "Actions",
          flex: 0.5,
          renderCell: ({ row }) => {
            return (
              <ion-icon
                name="trash-outline"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteRow(row.id, event);
                }}
              ></ion-icon>
            );
          },
        }
      : [],
  ];

  const handleAccordionNativeToggle = (event, isExpanded) => {
    if (!hasPermission(PERMISSIONS.VENDORS.CONTACTS.MODIFY)) {
      Alert("You do not have access to create..!", "warning");
      return;
    }

    setAccordionOpen(isExpanded);
    if (isExpanded) {
      if (!isEditing) {
        resetForm();
      }
    } else {
      closeAccordionAndReset();
    }
  };

  return (
    <div className="bank-details-container">
      <Accordion
        expanded={accordionOpen}
        onChange={handleAccordionNativeToggle}
      >
        <AccordionSummary
          expandIcon={
            accordionOpen ? (
              <CloseIcon className="AppHyperLink" />
            ) : (
              <AddCircleOutlineIcon
                className={
                  hasPermission(PERMISSIONS.VENDORS.CONTACTS.MODIFY)
                    ? "AppHyperLink"
                    : "IonIconDisabled AppHyperLink"
                }
              />
            )
          }
        >
          <Typography variant="subtitle1">
            {isEditing ? "Edit Contact" : "Add Contact"}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="bank-details-grid">
            <TextField
              className="AdminTextFeilds"
              label="First Name"
              name="firstName"
              value={contactsData.firstName}
              onChange={handleInputChange}
              error={!!errors.firstName}
              helperText={errors.firstName}
              required
            />
            <TextField
              className="AdminTextFeilds"
              label="Last Name"
              name="lastName"
              value={contactsData.lastName}
              onChange={handleInputChange}
              error={!!errors.lastName}
              required
              helperText={errors.lastName}
            />
            <TextField
              className="AdminTextFeilds"
              label="Email"
              name="email"
              value={contactsData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              required
              helperText={errors.email}
            />
            <Autocomplete
              options={contactTypes}
              getOptionLabel={(opt) => opt.name || ""}
              value={
                contactTypes.find((t) => t.name === contactsData.contactType) ||
                null
              }
              isOptionEqualToValue={(option, value) =>
                option.name === (value?.name || value)
              }
              getOptionDisabled={(option) =>
                option.name === "Primary" &&
                rows.some(
                  (row) =>
                    row.contactType === "Primary" &&
                    (!isEditing || row.id !== editId)
                )
              }
              onChange={(_, newVal) => {
                setContactsData((prev) => ({
                  ...prev,
                  contactType: newVal ? newVal.name : null,
                }));
                setErrors((prev) => ({
                  ...prev,
                  contactType: newVal ? "" : "Contact Type is required",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Contact Type"
                  error={!!errors.contactType}
                  helperText={errors.contactType}
                  required
                />
              )}
            />

            <TextField
              className="AdminTextFeilds"
              label="Phone Number"
              name="phoneNumber"
              value={contactsData.phoneNumber}
              onChange={handleInputChange}
              onInput={(e) => {
                e.target.value = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 10);
              }}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
            />
            <TextField
              className="AdminTextFeilds"
              label="Alternate Phone"
              name="alternatePhone"
              value={contactsData.alternatePhone}
              onChange={handleInputChange}
              onInput={(e) => {
                e.target.value = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 10);
              }}
              error={!!errors.alternatePhone}
              helperText={errors.alternatePhone}
            />
            <TextField
              className="AdminTextFeilds"
              label="Company Name"
              name="companyName"
              value={contactsData.companyName}
              onChange={handleInputChange}
            />
            <TextField
              className="AdminTextFeilds"
              label="Job Title"
              name="jobTitle"
              value={contactsData.jobTitle}
              onChange={handleInputChange}
            />
            <div className="full-width">
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notes"
                name="notes"
                value={contactsData.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="bank-actions-row">
            <Button
              variant="outlined"
              className="CancelButton"
              onClick={closeAccordionAndReset}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              className="CreateButton"
              onClick={isEditing ? handleEditContact : handleCreateContact}
              disabled={loading}
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      <div className="dataGridContainer">
        <StyledDataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          loading={rowsLoading}
        />
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditContacts;
