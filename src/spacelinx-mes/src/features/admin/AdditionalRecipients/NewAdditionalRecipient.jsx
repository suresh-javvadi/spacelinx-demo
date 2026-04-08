import { TextField, Button, Autocomplete } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createAdditionalRecipient } from "../../../services/additionalRecipientService";

const NewAdditionalRecipient = ({
  handleCloseClick,
  handleRefresh,
  templateCodeData,
  loadingTemplateCodes,
  emailRecipientsData,
  loadingEmailRecipients,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    templateCode: "",
    email: "",
    recipientName: "",
    recipientType: "",
  });
  const [formErrors, setFormErrors] = useState({
    templateCode: "",
    email: "",
    recipientName: "",
    recipientType: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);

  const validateCreateFields = () => {
    let valid = true;
    const errors = {
      templateCode: "",
      email: "",
      recipientName: "",
      recipientType: "",
    };

    if (!formData.templateCode) {
      errors.templateCode = "Template Code is required";
      valid = false;
    } else if (formData.templateCode.length > 250) {
      errors.templateCode = "Template Code must be at most 250 characters long";
      valid = false;
    }

    if (!formData.email) {
      errors.email = "Email is required";
      valid = false;
    } else if (formData.email.length > 250) {
      errors.email = "Email must be at most 250 characters long";
      valid = false;
    }

    if (!formData.recipientName) {
      errors.recipientName = "Recipient Name is required";
      valid = false;
    } else if (formData.recipientName.length > 250) {
      errors.recipientName =
        "Recipient Name must be at most 250 characters long";
      valid = false;
    }

    if (!formData.recipientType) {
      errors.recipientType = "Recipient Type is required";
      valid = false;
    } else if (formData.recipientType.length > 250) {
      errors.recipientType =
        "Recipient Type must be at most 250 characters long";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleCreate = async () => {
    if (!validateCreateFields()) {
      Alert("Please fill all the required fields", "error");
      return;
    }

    setLoadingData(true);

    const payload = {
      templateCode: formData.templateCode.trim(),
      email: formData.email.trim(),
      recipientName: formData.recipientName.trim(),
      recipientType: formData.recipientType.trim(),
    };

    try {
      const response = await createAdditionalRecipient(payload);
      Alert("Additional Recipient created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Error creating additional recipient:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Additional Recipient.";
      Alert(message, "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <>
      <div className="CreateFlyout">
        <div className="CreateFlyoutHeader">
          <h2>New Additional Recipient</h2>
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
        <div className="CreateFlyoutBody">
          <Autocomplete
            options={templateCodeData}
            getOptionLabel={(option) => option.templateCode || ""}
            loading={loadingTemplateCodes}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                templateCode: newValue ? newValue.templateCode : "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Template Code"
                className="AdminTextFeilds"
                error={!!formErrors.templateCode}
                helperText={formErrors.templateCode}
                required
              />
            )}
          />

          <Autocomplete
            options={emailRecipientsData}
            getOptionLabel={(option) => option.email || ""}
            loading={loadingEmailRecipients}
            value={selectedUser}
            onChange={(event, newValue) => {
              setSelectedUser(newValue);

              setFormData((prev) => ({
                ...prev,
                email: newValue ? newValue.email : "",
                recipientName: newValue
                  ? `${newValue.firstName} ${newValue.lastName}`
                  : "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Email"
                className="AdminTextFeilds"
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            )}
          />

          <TextField
            label="Recipient Name"
            value={formData.recipientName}
            disabled
            fullWidth
            error={!!formErrors.recipientName}
            helperText={formErrors.recipientName}
          />

          <Autocomplete
            options={["CC", "Watcher", "Stakeholder"]}
            getOptionLabel={(option) => option}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                recipientType: newValue ? newValue : "",
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Recipient Type"
                className="AdminTextFeilds"
                error={!!formErrors.recipientType}
                helperText={formErrors.recipientType}
                required
              />
            )}
          />
        </div>

        <div className="CreateFlyoutFooter">
          <Button className="CancelButton" onClick={handleCloseClick}>
            Cancel
          </Button>

          <Button disabled={loadingData} onClick={handleCreate}>
            Create
          </Button>
        </div>

        <div className="AlertMessages">
          <FlyoutAlerts />
        </div>
      </div>
    </>
  );
};

export default NewAdditionalRecipient;
