import React, { useState, useEffect, useContext } from "react";
import { TextField, Button } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { updateUnitOfMeasure } from "../../../services/unitOfMeasureService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";

const EditUnitOfMeasure = ({ selectedUom, handleCloseClick, fetchUomData }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [formData, setFormData] = useState({ name: "" });
  const [initialValues, setInitialValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);

  useEffect(() => {
    if (selectedUom) {
      const values = { name: selectedUom.name || "" };
      setFormData(values);
      setInitialValues(values);
      setErrors({});
      setReadOnlyMode(true);
    }
  }, [selectedUom]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) {
      Alert("Please fill the required fields", "error");
      return;
    }

    setLoadingData(true);
    try {
      await updateUnitOfMeasure(selectedUom.id, formData);
      Alert("Unit of Measure updated successfully", "success");
      fetchUomData();
      handleCloseClick();
    } catch (err) {
      console.error("Update error:", err);
      Alert("Failed to update Unit of Measure", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    setFormData(initialValues);
    setErrors({});
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
        <h2>Edit Unit of Measure</h2>

        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.UNITOFMEASURE.MODIFY)) {
                Alert("You do not have access to edit.", "warning");
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
        <>
          <div className="CreateFlyoutBody">
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{ readOnly: readOnlyMode }}
              error={!!errors.name}
              helperText={errors.name}
            />
          </div>

          {!readOnlyMode && (
            <div className="CreateFlyoutFooter">
              <Button className="CancelButton" onClick={handleReset}>
                Reset
              </Button>

              <Button
                variant="outlined"
                onClick={handleUpdate}
                className="CreateButton"
                disabled={loadingData}
              >
                Update
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditUnitOfMeasure;
