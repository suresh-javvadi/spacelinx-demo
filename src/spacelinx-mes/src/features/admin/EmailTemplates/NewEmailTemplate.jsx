import { TextField, Button } from "@mui/material";
import { useContext, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { createEmailTemplate } from "../../../services/emailTemplateService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import ReactQuill from "react-quill";
import Cliploader from "../../../Components/Loaders/Cliploader";

const NewEmailTemplate = ({ handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    templateCode: "",
    name: "",
    subject: "",
    body: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({
    templateCode: "",
    name: "",
    subject: "",
  });

  const validateCreateFields = () => {
    let valid = true;
    const errors = {
      templateCode: "",
      name: "",
      subject: "",
      body: "",
    };

    if (!formData.templateCode) {
      errors.templateCode = "Template Code is required";
      valid = false;
    } else if (formData.templateCode.length > 250) {
      errors.templateCode = "Template Code must be at most 250 characters long";
      valid = false;
    }

    if (!formData.name) {
      errors.name = "Name is required";
      valid = false;
    } else if (formData.name.length > 250) {
      errors.name = "Name must be at most 250 characters long";
      valid = false;
    }

    if (!formData.subject) {
      errors.subject = "Subject is required";
      valid = false;
    } else if (formData.subject.length > 250) {
      errors.subject = "Subject must be at most 250 characters long";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleCreate = async () => {
    if (!validateCreateFields()) {
      Alert("Please fill all the required fields", "error");
      return;
    }

    setLoadingData(true);

    const payload = {
      templateCode: formData.templateCode.trim(),
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      body: formData.body.trim(),
      description: formData.description.trim(),
    };

    try {
      const response = await createEmailTemplate(payload);
      Alert("Email Template created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Error creating email template:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Email Template.";
      Alert(message, "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <>
      <div className="CreateFlyout">
        <div className="CreateFlyoutHeader">
          <h2>New Email Template</h2>
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
        <div className="CreateFlyoutBody">
          <TextField
            label="Template Code"
            name="templateCode"
            fullWidth
            value={formData.templateCode}
            onChange={handleChange("templateCode")}
            error={!!formErrors.templateCode}
            helperText={formErrors.templateCode}
            required
          />

          <TextField
            label="Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange("name")}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
          />

          <TextField
            label="Subject"
            name="subject"
            fullWidth
            value={formData.subject}
            onChange={handleChange("subject")}
            error={!!formErrors.subject}
            helperText={formErrors.subject}
            required
          />
          <div className="quill-wrapper">
            <label className="quill-label">Body</label>

            <ReactQuill
              theme="snow"
              name="body"
              value={formData.body}
              onChange={handleChange("body")}
              error={!!formErrors.body}
              helperText={formErrors.body}
              required
            />
          </div>
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={2}
            value={formData.description}
            onChange={handleChange("description")}
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

export default NewEmailTemplate;
