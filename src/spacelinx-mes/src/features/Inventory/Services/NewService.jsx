import React, { useState, useContext } from "react";
import { TextField, Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createInventoryItem } from "../../../services/partService";
import "../../materialKits/Kits.css";

const NewService = ({ handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const validateFields = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Service Name is Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        itemType: "Services",
        unitPrice: 0,
      };
      if (formData.description !== "") {
        payload.description = formData.description;
      }

      await createInventoryItem(payload);
      Alert("Service created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Submit error:", error);
      Alert("Failed to create service", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Service</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="CreateFlyoutBody">
        <TextField
          label="Service Name"
          name="name"
          fullWidth
          required
          value={formData.name}
          onChange={handleTextChange}
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="Description"
          name="description"
          fullWidth
          value={formData.description}
          onChange={handleTextChange}
          multiline
          rows={4}
        />
      </div>

      <div className="CreateFlyoutFooter">
        <Button onClick={handleCloseClick}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewService;
