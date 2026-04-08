import { useState, useContext } from "react";
import { TextField, Button, FormGroup, IconButton } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createAssemblyLocation } from "../../../services/assemblyLocationService";

const NewAssemblyLocation = ({ handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({ name: "" });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill the required fields correctly", "error");
      return;
    }

    setLoadingData(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    try {
      const response = await createAssemblyLocation(payload);
      Alert("Assembly Location created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Error creating assembly location:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create Assembly Location.";

      Alert(message, "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Assembly Location</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="CreateFlyoutBody">
        <h3>Enter The Details</h3>
        <TextField
          label="Name"
          name="name"
          className="AdminTextFeilds"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          required
        />
        <TextField
          label="Description"
          name="description"
          className="AdminTextFeilds"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
        />
      </div>
      <div className="CreateFlyoutFooter">
        <Button className="CancelButton" onClick={handleCloseClick}>
          Cancel
        </Button>

        <Button disabled={loadingData} onClick={handleSubmit}>
          {loadingData ? "Creating..." : "Create"}
        </Button>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewAssemblyLocation;
