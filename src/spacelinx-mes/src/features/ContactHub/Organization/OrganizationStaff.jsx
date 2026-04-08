import React, { useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  showConfirmation,
  showAlert,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import {
  fetchStaffByOrgId,
  deleteStaff,
  createStaff,
  updateStaff,
} from "../../../services/staffService";
import dayjs from "dayjs";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../userContext/UserContext";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import "../Company/Company.css";
const OrganizationStaff = ({ selectedOrganization }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const formatDate = (date) =>
    date && dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD") : null;
  const [formData, setFormData] = useState({
    organization: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    staffNumber: "",
    jobTitle: "",
    manager: null,
    employmentStartDate: null,
    employmentEndDate: null,
    imageFile: null,
  });
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [loadManagers, setLoadManagers] = useState(true);

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchData();
    } else {
      setStaffData([]);
      setAccordionOpen(false);
      resetForm();
    }
  }, [selectedOrganization]);

  const fetchData = async () => {
    setLoading(true);
    setLoadManagers(true);
    try {
      const data = await fetchStaffByOrgId(selectedOrganization?.id);
      if (data) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setStaffData(data);
        const filteredManagers = data.filter(
          (staff) =>
            staff.organizationId === selectedOrganization?.id &&
            staff.jobTitle?.toLowerCase() === "manager"
        );

        setManagers(filteredManagers);
      }
    } catch (error) {
      Alert("Error fetching Staff Data", "error");
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
      setLoadManagers(false);
    }
  };

  const resetForm = () => {
    setFormData({
      organization: null,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      staffNumber: "",
      jobTitle: "",
      manager: null,
      employmentStartDate: null,
      imageFile: null,
    });
    setIsEditing(false);
    setEditId(null);
    setFormErrors({});
  };

  const closeAccordionAndReset = () => {
    resetForm();
    setAccordionOpen(false);
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim())
      errors.firstName = "First Name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last Name is required.";
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = "Email is invalid.";
    } else {
      const duplicate = staffData?.some(
        (staff) =>
          staff.email?.toLowerCase() === formData.email.trim().toLowerCase() &&
          (!isEditing || staff.id !== editId) // exclude current record when editing
      );
      if (duplicate) errors.email = "Email already exists.";
    }
    if (formData.phone.trim() && !/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Phone number must be exactly 10 digits.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();
    setFormData((prev) => ({ ...prev, [name]: trimmedValue }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "phone") {
      setFormErrors((prev) => ({
        ...prev,
        phone:
          trimmedValue !== "" && !/^\d{10}$/.test(trimmedValue)
            ? "Phone number must be exactly 10 digits"
            : "",
      }));
    }
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (trimmedValue !== "" && !emailRegex.test(trimmedValue)) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
        return;
      }
      const duplicate = staffData?.some(
        (staff) => staff.email?.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (duplicate) {
        setFormErrors((prev) => ({
          ...prev,
          email: "Email already exists",
        }));
      }
    }
  };

  const handleManagerChange = (e, newValue) => {
    setFormData((prev) => ({ ...prev, manager: newValue }));
  };

  const handleCreateStaff = async () => {
    if (!validate()) {
      Alert("Please fill all required fields correctly", "error");
      return;
    }
    if (!selectedOrganization?.id) {
      Alert("Organization must be selected to add staff", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        organizationId: selectedOrganization.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        staffNumber: formData.staffNumber,
        jobTitle: formData.jobTitle,
        managerId: formData.manager?.id || null,
        employmentStartDate: formatDate(formData.employmentStartDate),
        imageFile: formData.imageFile,
      };
      const res = await createStaff(payload);
      if (res && res.id) {
        await fetchData();
        Alert("Staff added successfully!", "success");
        closeAccordionAndReset();
      } else {
        Alert("Failed to add staff. Unexpected response.", "error");
      }
    } catch (error) {
      Alert("Error adding staff. Please try again.", "error");
      console.error("Create staff error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStaff = async () => {
    if (!validate()) {
      Alert("Please fill all required fields correctly", "error");
      return;
    }
    if (!editId) {
      Alert("No staff selected for edit", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        id: editId,
        organizationId: selectedOrganization.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        staffNumber: formData.staffNumber,
        jobTitle: formData.jobTitle,
        managerId: formData.manager?.id || null,
        employmentStartDate: formData.employmentStartDate,
        imageFile: formData.imageFile,
      };
      await updateStaff(editId, payload);
      await fetchData();
      Alert("Staff updated successfully!", "success");
      closeAccordionAndReset();
    } catch (error) {
      Alert("Error updating staff. Please try again.", "error");
      console.error("Edit staff error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (staffId) => {
    const confirmed = await showConfirmation(
      "Remove Staff?",
      "Are you sure you want to remove this Staff Details?"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await deleteStaff(staffId);
      Alert("Staff details removed successfully!", "success");
      fetchData();
      showAlert("success", "Removed!", "Staff details removed successfully.");
    } catch (error) {
      Alert("Failed to delete staff.", "error");
      console.error("Delete staff error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (params) => {
    const row = params.row;
    setFormData({
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      email: row.email || "",
      phone: row.phone || "",
      staffNumber: row.staffNumber || "",
      jobTitle: row.jobTitle || "",
      manager: managers.find((m) => m.id === row.managerId) || null,
      employmentStartDate: row.employmentStartDate
        ? dayjs(row.employmentStartDate).format("YYYY-MM-DD")
        : null,
      employmentEndDate: row.employmentEndDate
        ? dayjs(row.employmentEndDate).format("YYYY-MM-DD")
        : null,
      imageFile: row.imageFile || null,
    });
    setEditId(row.id);
    setIsEditing(true);
    setAccordionOpen(true);
  };

  const handleAccordionToggle = (e, expanded) => {
    setAccordionOpen(expanded);
    if (!expanded) {
      closeAccordionAndReset();
    } else if (!isEditing) {
      resetForm();
    }
  };

  const handleCancel = () => {
    closeAccordionAndReset();
  };

  const columns = [
    {
      field: "staffNumber",
      headerName: "Staff No.",
      flex: 1,
    },
    {
      field: "staffName",
      headerName: "Staff Name",
      flex: 1,
      valueGetter: (_value, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
    },
    {
      field: "jobTitle",
      headerName: "Job Title",
      flex: 1,
    },
    {
      field: "managerName",
      headerName: "Manager",
      flex: 1,
      valueGetter: (_value, row) => {
        const mgr = managers.find((m) => m.id === row.managerId);
        return mgr ? `${mgr.firstName} ${mgr.lastName}` : "NA";
      },
    },
    {
      field: "employmentStartDate",
      headerName: "Joined On",
      flex: 1,
      valueGetter: (_value, row) =>
        row.employmentStartDate
          ? dayjs(row.employmentStartDate).format("DD-MM-YYYY")
          : "",
    },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <ion-icon
          name="trash-outline"
          style={{ cursor: "pointer", color: "red" }}
          onClick={(e) => {
            e.stopPropagation();
            if (!hasPermission(PERMISSIONS.STAFF.DELETE)) {
              Alert("You do not have access to delete.", "warning");
              return;
            }
            handleDeleteClick(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="bank-details-container">
      <Accordion
        expanded={accordionOpen}
        onChange={(e, expanded) => {
          if (!hasPermission(PERMISSIONS.STAFF.MODIFY)) {
            Alert("You do not have permission to add staff!", "warning");
            return;
          }
          handleAccordionToggle(e, expanded);
        }}
      >
        <AccordionSummary
          expandIcon={
            accordionOpen ? (
              <CloseIcon className="AppHyperLink" />
            ) : (
              <AddCircleOutlineIcon className="AppHyperLink" />
            )
          }
        >
          <Typography variant="subtitle1">
            {isEditing ? "Edit Staff" : "Add Staff"}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="bank-details-grid">
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              className="AdminTextFeilds"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              className="AdminTextFeilds"
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              error={!!formErrors.email}
              helperText={formErrors.email}
              className="AdminTextFeilds"
            />
            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              inputMode="numeric"
              className="AdminTextFeilds"
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              onInput={(e) => {
                e.target.value = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 10);
              }}
            />
            <TextField
              label="Staff Number"
              name="staffNumber"
              value={formData.staffNumber}
              onChange={handleInputChange}
              className="AdminTextFeilds"
            />
            <TextField
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className="AdminTextFeilds"
            />

            <Autocomplete
              options={managers}
              loading={loadManagers}
              loadingText="Loading Managers...."
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName}` || ""
              }
              value={formData.manager}
              onChange={handleManagerChange}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Manager"
                  className="AdminTextFeilds"
                />
              )}
            />
            <TextField
              label="Joined On"
              type="date"
              value={formData.employmentStartDate || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  employmentStartDate: e.target.value,
                }))
              }
              InputLabelProps={{
                shrink: true,
              }}
            />

            {isEditing && (
              <TextField
                label="Resigned On"
                type="date"
                value={formData.employmentEndDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    employmentEndDate: e.target.value,
                  }))
                }
                InputLabelProps={{
                  shrink: true,
                }}
              />
            )}
          </div>
          <div className="bank-actions-row">
            <Button className="CancelButton" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="CreateButton"
              onClick={isEditing ? handleEditStaff : handleCreateStaff}
              disabled={loading}
            >
              {isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      <div className="OrganizationStaffDataGrid">
        <StyledDataGrid
          rows={staffData}
          columns={columns}
          loading={loading}
          onRowClick={(params) => {
            if (!hasPermission(PERMISSIONS.STAFF.MODIFY)) {
              Alert("You do not have access to edit.", "warning");
              return;
            }
            handleRowClick(params);
          }}
          getRowId={(row) => row.id}
        />
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default OrganizationStaff;
