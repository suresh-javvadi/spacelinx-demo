import React, { useState, useContext } from "react";
import { TextField, Button } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { createInventoryItem } from "../../../services/partService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import "../../materialKits/Kits.css";

const NewGoodsInventory = ({ handleClose, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      itemType: "Goods",
    };
    if (formData.description !== "") {
      payload.description = formData.description;
    }
    setLoadingData(true);
    try {
      await createInventoryItem(payload);
      Alert("Goods Inventory created successfully", "success");
      handleRefresh();
      handleClose();
    } catch (err) {
      console.error(err);
      Alert("Failed to create Goods Inventory", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Good</h2>
        <button onClick={handleClose}>
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
            <TextField
              label="Name"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
            <TextField
              label="Description"
              name="description"
              type="text"
              fullWidth
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
            />
          </div>

          <div className="CreateFlyoutFooter">
            <Button onClick={handleClose} className="CancelButton">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loadingData}>
              {loadingData ? "Creating..." : "Create"}
            </Button>
          </div>
        </>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewGoodsInventory;
