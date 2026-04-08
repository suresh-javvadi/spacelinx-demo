import React, { useState, useContext } from "react";
import { TextField, Button } from "@mui/material";

import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { createSubsystem } from "../../../services/subsystemService";

const NewSubsystem = ({ handleCloseClick, fetchSubsystemData }) => {
  const { Alert } = useContext(AlertsContext);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.code.trim()) newErrors.code = "Subsystem Code is required";
    if (!formData.name.trim()) newErrors.name = "Subsystem Name is required";

    // description is optional → no validation

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert("Please fill the required fields ", "error");
      return;
    }

    setLoadingData(true);
    try {
      await createSubsystem(formData);
      Alert("Subsystem created successfully", "success");
      fetchSubsystemData();
      handleCloseClick();
    } catch (err) {
      console.error(err);
      Alert("Failed to create subsystem", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Only code and name should show dynamic required errors
    if ((name === "code" || name === "name") && value.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name} is required`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Subsystem</h2>
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
            <h3>Enter the Details</h3>

            <TextField
              label="Subsystem Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.code}
              helperText={errors.code}
            />

            <TextField
              label="Subsystem Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />
          </div>

          <div className="CreateFlyoutFooter">
            <Button
              onClick={handleCloseClick}
              className="CancelButton"
              variant="outlined"
            >
              Cancel
            </Button>

            <Button
              variant="outlined"
              onClick={handleSubmit}
              className="CreateButton"
              disabled={loadingData}
            >
              Create
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewSubsystem;
