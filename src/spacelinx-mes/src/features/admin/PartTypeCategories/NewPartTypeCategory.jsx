import React, { useState, useContext } from "react";
import { TextField, Button, FormGroup } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createPartTypeCategory } from "../../../services/PartTypeCategoriesService";
import Cliploader from "../../../Components/Loaders/Cliploader"; // <-- import added

const NewPartTypeCategory = ({ handleCloseClick, handleRefresh }) => {
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

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    let errorMsg = "";

    if (name === "name") {
      if (!value.trim()) {
        errorMsg = "Name is required";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill the required fields correctly", "error");
      return;
    }
    setLoadingData(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || "",
    };

    try {
      await createPartTypeCategory(payload);
      Alert("Part Type Category created successfully!", "success");
      handleCloseClick();
      if (typeof handleRefresh === "function") handleRefresh();
    } catch (error) {
      console.error("Error creating part type category (api):", error);
      Alert("Failed to create Part Type Category. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <>
      {loadingData ? (
        <Cliploader loading={loadingData} />
      ) : (
        <div className="CreateFlyout">
          <div className="CreateFlyoutHeader">
            <h2 style={{ marginLeft: "30px" }}>New Part Type Category</h2>
            <button onClick={handleCloseClick}>
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>

          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>

            <FormGroup>
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
            </FormGroup>

            <FormGroup>
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
            </FormGroup>
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
      )}
    </>
  );
};

export default NewPartTypeCategory;
