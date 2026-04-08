import React, { useState, useContext, useEffect } from "react";
import { TextField, Button, FormGroup, Autocomplete } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import {
  createStaff,
  createStaffWithImage,
} from "../../../services/staffService";
import dayjs from "dayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { IconButton, Avatar, Tooltip, Box } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import Cliploader from "../../../Components/Loaders/Cliploader";
import ImagePreviewDrawer from "../../../Components/ImagePreviewDrawer/ImagePreviewDrawer";

const NewStaff = ({
  handleCloseClick,
  handleRefresh,
  staffData,
  loadOrganizationData,
  organizationData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);

  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);
  const [formData, setFormData] = useState({
    Organization: null,
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    StaffNumber: "",
    JobTitle: "",
    Manager: null,
    JoinedOn: null,
    ImageFile: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const previewImageUrl = formData.ImageFile
    ? URL.createObjectURL(formData.ImageFile)
    : null;

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      Organization:
        organizationData.find(
          (org) => org?.name === "XDLINX SPACE LABS PRIVATE LIMITED"
        ) || null,
    }));
  }, [organizationData]);

  const validateFields = () => {
    const newErrors = {};
    if (!formData.Organization) newErrors.Organization = "Required";
    if (!formData.FirstName.trim()) newErrors.FirstName = "Required";
    if (!formData.LastName.trim()) newErrors.LastName = "Required";
    if (!formData.Email.trim()) newErrors.Email = "Required";
    else if (isEmailDuplicate) newErrors.Email = "Email already exists";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    setLoadingData(true);
    try {
      const formatDate = (date) =>
        date && dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD") : null;

      if (formData.ImageFile) {
        const payload = new FormData();
        payload.append("FirstName", formData.FirstName);
        payload.append("LastName", formData.LastName);
        payload.append("Email", formData.Email);
        payload.append("Phone", formData.Phone);
        payload.append("OrganizationId", formData.Organization.id);
        payload.append("ManagerId", formData.Manager?.id || "");
        payload.append("StaffNumber", formData.StaffNumber || "");
        payload.append("JobTitle", formData.JobTitle);
        payload.append(
          "EmploymentStartDate",
          formatDate(formData.JoinedOn) || ""
        );

        payload.append(
          "ImageFile",
          formData.ImageFile,
          formData.ImageFile.name
        );
        payload.append("ImageType", formData.ImageFile.type);

        for (let [k, v] of payload.entries()) console.log(`${k}:`, v);

        await createStaffWithImage(payload);
      } else {
        const jsonPayload = {
          firstName: formData.FirstName,
          lastName: formData.LastName,
          email: formData.Email,
          phone: formData.Phone,
          organizationId: formData.Organization.id,
          managerId: formData.Manager?.id || null,
          staffNumber: formData.StaffNumber || "",
          jobTitle: formData.JobTitle,
          employmentStartDate: formatDate(formData.JoinedOn),
        };

        await createStaff(jsonPayload);
      }

      Alert("Staff created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Submit error:", error);
      Alert("Failed to create Staff", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const filteredManagers = staffData?.filter(
    (staff) =>
      staff.organizationId === formData.Organization?.id &&
      staff.jobTitle?.toLowerCase() === "manager"
  );
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        ImageFile: file,
      }));
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Staff</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>{" "}
            <Autocomplete
              options={organizationData}
              loading={loadOrganizationData}
              loadingText="Loading OrganizationData..."
              value={formData.Organization}
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
                value={formData.FirstName}
                onChange={handleTextChange}
                error={!!errors.FirstName}
                helperText={errors.FirstName}
                required
              />

              <TextField
                label="Last Name"
                name="LastName"
                value={formData.LastName}
                onChange={handleTextChange}
                error={!!errors.LastName}
                helperText={errors.LastName}
                required
              />

              <TextField
                label="Email"
                name="Email"
                value={formData.Email}
                onChange={handleTextChange}
                error={!!errors.Email}
                helperText={errors.Email}
                required
              />

              <TextField
                label="Phone"
                name="Phone"
                value={formData.Phone}
                onChange={handleTextChange}
                error={!!errors.Phone}
                helperText={errors.Phone}
              />
              <TextField
                label="Job Title"
                name="JobTitle"
                value={formData.JobTitle}
                onChange={handleTextChange}
              />
              <TextField
                label="Staff Number"
                name="StaffNumber"
                value={formData.StaffNumber}
                onChange={handleTextChange}
              />

              <Autocomplete
                options={filteredManagers || []}
                loading={loadOrganizationData}
                loadingText="Loading Managers..."
                value={formData.Manager}
                getOptionLabel={(option) =>
                  `${option.firstName || ""} ${option.lastName || ""}`
                }
                onChange={(e, newValue) =>
                  setFormData((prev) => ({ ...prev, Manager: newValue }))
                }
                disabled={!formData.Organization}
                renderInput={(params) => (
                  <TextField {...params} label="Manager" />
                )}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Joined On"
                  value={formData.JoinedOn}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, JoinedOn: newValue }))
                  }
                />
              </LocalizationProvider>
            </div>{" "}
            <div className="staffImageUploadSection">
              {formData.ImageFile ? (
                <div className="StaffImageContainer">
                  <Avatar
                    src={URL.createObjectURL(formData.ImageFile)}
                    alt="Uploaded Preview"
                    className="StaffAvatarUploaded"
                    onClick={() => setImagePreviewOpen(true)}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        ImageFile: null,
                      }))
                    }
                    sx={{
                      bgcolor: "background.paper",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "error.light" },
                    }}
                    className="StaffRemoveImageButton"
                  >
                    <CloseIcon fontSize="small" color="error" />
                  </IconButton>
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
                  </Box>
                </Tooltip>
              )}
            </div>
          </div>

          <ImagePreviewDrawer
            open={imagePreviewOpen}
            imageUrl={previewImageUrl}
            onClose={() => setImagePreviewOpen(false)}
          />

          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loadingData || isEmailDuplicate || !!errors.Email}
            >
              Create
            </Button>
          </div>

          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default NewStaff;
