import React, { useState, useContext } from "react";
import { TextField, Button } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { createPartLevel } from "../../../services/partLevelService";

const NewPartLevel = ({ handleCloseClick, fetchPartLevelData }) => {
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

    if (!formData.code.trim()) newErrors.code = "Part Level Code is required";
    if (!formData.name.trim()) newErrors.name = "Part Level Name is required";

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
      await createPartLevel(formData);
      Alert("Part Level created successfully", "success");
      fetchPartLevelData();
      handleCloseClick();
    } catch (err) {
      console.error(err);
      Alert("Failed to create part level", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    const requiredFields = {
      code: "Part Level Code is required",
      name: "Part Level Name is required",
    };

    if ((name === "code" || name === "name") && value.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        [name]: requiredFields[name],
      }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Part Level</h2>
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
              label="Part Level Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.code}
              helperText={errors.code}
            />

            <TextField
              label="Part Level Name"
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

export default NewPartLevel;
