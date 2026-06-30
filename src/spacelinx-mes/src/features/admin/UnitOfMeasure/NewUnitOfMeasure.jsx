import React, { useState, useContext } from "react";
import { TextField, Button } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { createUnitOfMeasure } from "../../../services/unitOfMeasureService";

const NewUnitOfMeasure = ({ handleCloseClick, fetchUomData }) => {
  const { Alert } = useContext(AlertsContext);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert("Please fill the required fields", "error");
      return;
    }

    setLoadingData(true);
    try {
      await createUnitOfMeasure(formData);
      Alert("Unit of Measure created successfully", "success");
      fetchUomData();
      handleCloseClick();
    } catch (err) {
      console.error(err);
      Alert("Failed to create Unit of Measure", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && value.trim() === "") {
      setErrors((prev) => ({ ...prev, name: "Name is required" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Unit of Measure</h2>
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
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
            />
          </div>

          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>

            <Button
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

export default NewUnitOfMeasure;
