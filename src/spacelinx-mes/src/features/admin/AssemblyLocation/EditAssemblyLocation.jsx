import { useState, useEffect, useContext } from "react";
import { TextField, Button, IconButton } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import {
  fetchAssemblyLocationsById,
  updateAssemblyLocation,
} from "../../../services/assemblyLocationService";

const EditAssemblyLocation = ({
  handleCloseClick,
  handleRefresh,
  selectedLocation,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({ name: "" });

  useEffect(() => {
    if (!selectedLocation) return;

    setFormData({
      name: selectedLocation.name || "",
      description: selectedLocation.description || "",
    });

    setInitialData({
      name: selectedLocation.name || "",
      description: selectedLocation.description || "",
    });

    setReadOnlyMode(true);
    setErrors({ name: "" });
  }, [selectedLocation]);

  const validateFields = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (!value.trim() && name === "name") {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleReset = () => {
    setFormData({
      name: initialData.name,
      description: initialData.description,
    });

    setErrors({ name: "" });
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill required fields", "error");
      return;
    }
    if (!selectedLocation?.id) {
      Alert("Invalid Location ID", "error");
      return;
    }
    if (!hasPermission(PERMISSIONS.ASSEMBLYLOCATIONS?.MODIFY)) {
      Alert("You do not have permission to update", "warning");
      return;
    }
    setLoadingData(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
    };

    try {
      await updateAssemblyLocation(selectedLocation.id, payload);
      Alert("Assembly Location updated successfully!", "success");
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
        <h3>Edit Assembly Location</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.ASSEMBLYLOCATION?.MODIFY)) {
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
            label="Name"
            name="name"
            value={formData.name}
            className="AdminTextFeilds"
            onChange={handleInputChange}
            disabled={readOnlyMode}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            className="AdminTextFeilds"
            onChange={handleInputChange}
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
            <Button onClick={handleSubmit}>Update</Button>
          </div>
        </div>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditAssemblyLocation;
