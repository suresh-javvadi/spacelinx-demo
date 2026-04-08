import { useState, useEffect, useContext } from "react";
import { TextField, Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { updateEmailTemplate } from "../../../services/emailTemplateService";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EditEmailTemplate = ({
  handleCloseClick,
  handleRefresh,
  selectedEmailTemplate,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [formData, setFormData] = useState({
    templateCode: "",
    name: "",
    subject: "",
    body: "",
    description: "",
  });
  const [errors, setErrors] = useState({ name: "", subject: "" });

  useEffect(() => {
    if (!selectedEmailTemplate) return;

    setFormData({
      templateCode: selectedEmailTemplate.templateCode || "",
      name: selectedEmailTemplate.name || "",
      subject: selectedEmailTemplate.subject || "",
      body: selectedEmailTemplate.body || "",
      description: selectedEmailTemplate.description || "",
    });

    setReadOnlyMode(true);
    setErrors({ name: "", subject: "" });
  }, [selectedEmailTemplate]);

  const validateFields = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleReset = () => {
    if (!selectedEmailTemplate) return;

    setFormData({
      templateCode: selectedEmailTemplate.templateCode || "",
      name: selectedEmailTemplate.name || "",
      subject: selectedEmailTemplate.subject || "",
      body: selectedEmailTemplate.body || "",
      description: selectedEmailTemplate.description || "",
    });

    setReadOnlyMode(true);
    setErrors({ name: "", subject: "" });
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleUpdate = async () => {
    if (!validateFields()) {
      Alert("Please fill required fields", "error");
      return;
    }
    if (!selectedEmailTemplate?.id) {
      Alert("Invalid Email Template ID", "error");
      return;
    }
    if (!hasPermission(PERMISSIONS.EMAILTEMPLATES?.MODIFY)) {
      Alert("You do not have permission to update", "warning");
      return;
    }
    setLoadingData(true);
    const payload = {
      templateCode: formData.templateCode.trim(),
      name: formData.name.trim(),
      subject: formData.subject.trim(),
      body: formData.body.trim(),
      description: formData.description?.trim() || "",
    };

    try {
      await updateEmailTemplate(selectedEmailTemplate.id, payload);
      Alert("Email Template updated successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (err) {
      console.error("Update failed:", err);
      Alert("Failed to update. Try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>Edit Email Template</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.EMAILTEMPLATES?.MODIFY)) {
                Alert("No edit access", "warning");
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
        <div className="CreateFlyoutBody">
          <TextField
            label="Template Code"
            name="templateCode"
            value={formData.templateCode}
            className="AdminTextFeilds"
            disabled
          />
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            className="AdminTextFeilds"
            onChange={handleChange("name")}
            disabled={readOnlyMode}
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Subject"
            name="subject"
            value={formData.subject}
            className="AdminTextFeilds"
            onChange={handleChange("subject")}
            disabled={readOnlyMode}
            required
            error={!!errors.subject}
            helperText={errors.subject}
          />
          <div className="quill-wrapper">
            <label className="quill-label">Body</label>

            <ReactQuill
              theme="snow"
              name="body"
              value={formData.body}
              readOnly={readOnlyMode}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, body: value }))
              }
            />
          </div>
          <TextField
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            className="AdminTextFeilds"
            onChange={handleChange("description")}
            disabled={readOnlyMode}
          />
        </div>
      )}

      {!readOnlyMode && (
        <div className="CreateFlyoutFooter">
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </div>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditEmailTemplate;
