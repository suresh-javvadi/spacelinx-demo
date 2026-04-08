import React, { useContext, useEffect, useState, useMemo } from "react";
import { TextField, Button, Autocomplete } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import Cliploader from "../../../Components/Loaders/Cliploader";
import dayjs from "dayjs";
import { fetchAllOrganization } from "../../../services/organizationService";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  updateStaff,
  updateStaffWithImage,
} from "../../../services/staffService";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../userContext/UserContext";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { IconButton, Avatar, Tooltip, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import ImagePreviewDrawer from "../../../Components/ImagePreviewDrawer/ImagePreviewDrawer";
import "./Staff.css";

const EditStaff = ({
  selectedStaff,
  handleCloseClick,
  staffData = [],
  handleRefresh,
  handleDeleteClick,
  organizationData,
  loadOrganizationData,
  loadingStaffData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [editStaffNumberError, setEditStaffNumberError] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);

  useEffect(() => {
    if (selectedStaff) {
      setFormData({
        FirstName: selectedStaff.firstName || "",
        LastName: selectedStaff.lastName || "",
        Email: selectedStaff.email || "",
        Phone: selectedStaff.phone || "",
        StaffNumber: selectedStaff.staffNumber || "",
        JobTitle: selectedStaff.jobTitle || "",
        Organization: selectedStaff.organization || null,
        Manager: selectedStaff.manager || null,
        JoinedOn: dayjs(selectedStaff.employmentStartDate),
        ResignedOn: selectedStaff.employmentEndDate
          ? dayjs(selectedStaff.employmentEndDate)
          : null,
        ImageFile: selectedStaff.imageUrl || "",
      });
      setImagePreviewUrl(selectedStaff.imageUrl || null);
    }
  }, [selectedStaff]);

  useEffect(() => {
    if (formData.ImageFile instanceof File) {
      const objectUrl = URL.createObjectURL(formData.ImageFile);
      setImagePreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [formData.ImageFile]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;

    if (name === "Phone") {
      let onlyDigits = value.replace(/\D/g, "");

      if (onlyDigits.length > 10) {
        onlyDigits = onlyDigits.slice(0, 10);
      }

      setFormData((prev) => ({ ...prev, Phone: onlyDigits }));

      if (onlyDigits.length > 0 && onlyDigits.length !== 10) {
        setErrors((prev) => ({
          ...prev,
          Phone: "Please enter a valid 10-digit phone number",
        }));
      } else {
        setErrors((prev) => ({ ...prev, Phone: "" }));
      }

      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "Email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        setErrors((prev) => ({
          ...prev,
          Email: "Please enter a valid email address",
        }));
        return;
      }

      const duplicate = staffData?.some(
        (staff) => staff.email?.toLowerCase() === value.trim().toLowerCase()
      );
      setIsEmailDuplicate(duplicate);

      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          Email: "Email already exists",
        }));
      }
    }
  };

  const handleResetClick = () => {
    if (selectedStaff) {
      setFormData({
        FirstName: selectedStaff.firstName || "",
        LastName: selectedStaff.lastName || "",
        Email: selectedStaff.email || "",
        Phone: selectedStaff.phone || "",
        StaffNumber: selectedStaff.staffNumber || "",
        JobTitle: selectedStaff.jobTitle || "",
        Organization: selectedStaff.organization || null,
        Manager: selectedStaff.manager || null,
        JoinedOn: dayjs(selectedStaff.employmentStartDate),
        ResignedOn: selectedStaff.employmentEndDate
          ? dayjs(selectedStaff.employmentEndDate)
          : null,
        ImageFile: selectedStaff.imageUrl || "",
      });
      setImagePreviewUrl(selectedStaff.imageUrl || "");
      setErrors({});
    }
  };

  const handleEditSubmit = async () => {
    const newErrors = {};
    if (!formData.FirstName) newErrors.FirstName = "First name is required";
    if (!formData.LastName) newErrors.LastName = "Last name is required";
    if (!formData.Email) newErrors.Email = "Email is required";
    else if (isEmailDuplicate) newErrors.Email = "Email already exists";
    if (!formData.Organization)
      newErrors.Organization = "Organization is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const isValidDate = (d) => dayjs(d).isValid();
    const startDate = isValidDate(formData.JoinedOn)
      ? dayjs(formData.JoinedOn).format("YYYY-MM-DD")
      : null;
    const endDate = isValidDate(formData.ResignedOn)
      ? dayjs(formData.ResignedOn).format("YYYY-MM-DD")
      : null;

    try {
      setLoadingData(true);
      const jsonPayload = {
        id: selectedStaff?.id || "",
        firstName: formData.FirstName || "",
        lastName: formData.LastName || "",
        email: formData.Email || "",
        phone: formData.Phone || "",
        staffNumber: formData.StaffNumber || "",
        jobTitle: formData.JobTitle || "",
        organizationId: formData.Organization?.id || "",
        managerId: formData.Manager?.id || null,
        employmentStartDate: startDate || null,
        employmentEndDate: endDate || null,
      };

      await updateStaff(selectedStaff?.id, jsonPayload);

      if (formData.ImageFile instanceof File) {
        const imagePayload = new FormData();
        imagePayload.append("ImageFile", formData.ImageFile);
        imagePayload.append("ImageType", formData.ImageFile.type);
        await updateStaffWithImage(selectedStaff.id, imagePayload);
      }

      Alert(`Staff details updated successfully!`, "success");
      handleRefresh();
      setReadOnlyMode(true);
      handleCloseClick();
    } catch (err) {
      Alert("Update failed", "error");
      console.error("Update failed", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, ImageFile: file }));
    }
  };

  const handleDelete = () => {
    if (!hasPermission(PERMISSIONS.STAFF.DELETE)) {
      Alert("You don't have access to delete", "warning");
      return;
    }
    handleDeleteClick(selectedStaff.id);
  };

  const filteredManagers = useMemo(() => {
    if (!formData.Organization) return [];
    return staffData.filter(
      (staff) =>
        staff.jobTitle?.toLowerCase() === "manager" &&
        staff.organization?.id === formData.Organization?.id
    );
  }, [formData.Organization, staffData]);

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>
          Edit {`${selectedStaff.firstName} ${selectedStaff.lastName}`} Details
        </h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.STAFF.MODIFY)) {
                Alert("You do not have access to edit.", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="StaffEditFlyoutBody">
          <Autocomplete
            options={organizationData}
            loading={loadOrganizationData}
            loadingText="Loading Organizations..."
            value={
              organizationData.find(
                (org) => org.id === formData?.Organization?.id
              ) || null
            }
            onChange={(e, newValue) => {
              setFormData((prev) => ({
                ...prev,
                Organization: newValue,
                Manager: null,
              }));
              if (newValue) {
                setErrors((prev) => ({ ...prev, Organization: "" }));
              }
            }}
            getOptionLabel={(option) => option?.name || ""}
            disabled={readOnlyMode}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Organization"
                error={!!errors.Organization}
                helperText={errors.Organization}
                required
              />
            )}
          />

          <div className="CreateFlyoutBodyTwoColumns">
            <TextField
              label="First Name"
              name="FirstName"
              value={formData.FirstName || ""}
              onChange={handleTextChange}
              error={!!errors.FirstName}
              helperText={errors.FirstName}
              required
              InputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Last Name"
              name="LastName"
              value={formData.LastName || ""}
              onChange={handleTextChange}
              error={!!errors.LastName}
              helperText={errors.LastName}
              required
              InputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Email"
              name="Email"
              value={formData.Email || ""}
              onChange={handleTextChange}
              error={!!errors.Email}
              helperText={errors.Email}
              required
              InputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Phone"
              name="Phone"
              value={formData.Phone || ""}
              onChange={handleTextChange}
              InputProps={{ readOnly: readOnlyMode }}
              error={!!errors.Phone}
              helperText={errors.Phone}
            />

            <TextField
              label="Staff Number"
              name="StaffNumber"
              value={formData.StaffNumber || ""}
              onChange={handleTextChange}
              InputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Job Title"
              name="JobTitle"
              value={formData.JobTitle || ""}
              onChange={handleTextChange}
              InputProps={{ readOnly: readOnlyMode }}
            />

            <Autocomplete
              options={filteredManagers}
              loading={loadingStaffData}
              loadingText="Loading Data"
              value={
                filteredManagers.find(
                  (manager) => manager.id === formData?.Manager?.id
                ) || null
              }
              getOptionLabel={(option) =>
                `${option?.firstName || ""} ${option?.lastName || ""}`
              }
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              onChange={(e, newValue) => {
                setFormData((prev) => ({ ...prev, Manager: newValue }));
                if (newValue) {
                  setErrors((prev) => ({ ...prev, Manager: "" }));
                }
              }}
              disabled={!formData.Organization || readOnlyMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Manager"
                  error={!!errors.Manager}
                  helperText={errors.Manager}
                />
              )}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Joined On"
                value={formData.JoinedOn || null}
                onChange={(newValue) =>
                  setFormData((prev) => ({ ...prev, JoinedOn: newValue }))
                }
                readOnly={readOnlyMode}
                slotProps={{
                  textField: {
                    error: !!errors.JoinedOn,
                    helperText: errors.JoinedOn,
                    required: true,
                    InputProps: { readOnly: readOnlyMode },
                  },
                }}
              />

              <DatePicker
                label="Resigned On"
                value={formData.ResignedOn || null}
                onChange={(newValue) =>
                  setFormData((prev) => ({ ...prev, ResignedOn: newValue }))
                }
                readOnly={readOnlyMode}
              />
            </LocalizationProvider>
          </div>

          <div className="staffImageUploadSection">
            {imagePreviewUrl ? (
              <div className="StaffImageContainer">
                <Avatar
                  src={imagePreviewUrl}
                  alt="Uploaded Preview"
                  className="StaffAvatarUploaded"
                  onClick={() => setImagePreviewOpen(true)}
                />
                {!readOnlyMode && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, ImageFile: null }));
                      setImagePreviewUrl(null);
                    }}
                    sx={{
                      bgcolor: "background.paper",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "error.light" },
                    }}
                    className="StaffRemoveImageButton"
                  >
                    <CloseIcon fontSize="small" color="error" />
                  </IconButton>
                )}
              </div>
            ) : (
              <Tooltip title="Upload Profile Image">
                <Box className="StaffImageContainer">
                  <Avatar
                    sx={{
                      bgcolor: "background.default",
                      color: "text.secondary",
                    }}
                    className="StaffAvatarPlaceholder"
                  >
                    <AccountCircleIcon fontSize="inherit" />
                  </Avatar>
                  {!readOnlyMode && (
                    <IconButton
                      component="label"
                      sx={{
                        bgcolor: "background.paper",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                      className="StaffUploadIconButton"
                    >
                      <CloudUploadIcon />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                      />
                    </IconButton>
                  )}
                </Box>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      <ImagePreviewDrawer
        open={imagePreviewOpen}
        imageUrl={imagePreviewUrl}
        onClose={() => setImagePreviewOpen(false)}
      />

      {!readOnlyMode && (
        <div className="EditFlyoutFooter">
          <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleResetClick}>
              Reset
            </Button>
            <Button
              disabled={
                loadingData ||
                !!editStaffNumberError ||
                isEmailDuplicate ||
                !!errors.Email
              }
              onClick={handleEditSubmit}
            >
              Update
            </Button>
          </div>
        </div>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditStaff;
