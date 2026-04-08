import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  FormGroup,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
} from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { createPartType } from "../../../services/partTypeService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
const NewPartType = ({
  handleCloseClick,
  handleRefresh,
  categoriesData,
  loadingCategories,
  partLevelData,
  loadingPartLevels,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    partNumberPrefix: "",
    category: "",
    partTypeCategoryId: null,
    isVisibleInUi: true,
    partLevelId: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    partNumberPrefix: "",
    category: "",
    partLevelId: "",
  });
  const validateFields = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.partNumberPrefix) {
      newErrors.partNumberPrefix = "Part Number Prefix is required";
      valid = false;
    } else if (Number.isNaN(Number(formData.partNumberPrefix))) {
      newErrors.partNumberPrefix = "Part Number Prefix must be a number";
      valid = false;
    }

    if (!formData.partTypeCategoryId) {
      newErrors.category = "Category is required";
      valid = false;
    }

    if (!formData.partLevelId.trim()) {
      newErrors.partLevelId = "Part Level is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const handleRadioChange = (e) => {
    setFormData({
      ...formData,
      isVisibleInUi: e.target.value === "true",
    });
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields correctly", "error");
      return;
    }
    setLoadingData(true);
    try {
      await createPartType(formData);
      Alert("Part Type created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Error creating part type:", error);
      Alert("Failed to create Part Type. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>New PartType</h2>
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
            label="Part Number Prefix"
            name="partNumberPrefix"
            className="AdminTextFeilds"
            value={formData.partNumberPrefix}
            onChange={handleChange}
            error={!!errors.partNumberPrefix}
            helperText={errors.partNumberPrefix}
            type="number"
            fullWidth
            required
          />
        </FormGroup>
        <FormGroup>
          <Autocomplete
            options={categoriesData}
            getOptionLabel={(option) => option.name || ""}
            loading={loadingCategories}
            loadingText="Loading categories..."
            onChange={(event, newValue) => {
              setFormData({
                ...formData,
                partTypeCategoryId: newValue ? newValue.id : "",
              });
              setErrors({ ...errors, partTypeCategoryId: "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                name="category"
                className="AdminTextFeilds"
                error={!!errors.category}
                helperText={errors.category}
                required
              />
            )}
          />
        </FormGroup>
        <FormGroup>
          <Autocomplete
            options={partLevelData}
            getOptionLabel={(option) => option.name || ""}
            loading={loadingPartLevels}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                partLevelId: newValue ? newValue.id : "",
              }));
              setErrors((prev) => ({ ...prev, partLevelId: "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Part Level"
                className="AdminTextFeilds"
                error={!!errors.partLevelId}
                helperText={errors.partLevelId}
                required
              />
            )}
          />
        </FormGroup>
        <FormGroup>
          <div className="IsVisibleInUiDiv">
            <p>Is visible in UI:</p>
            <RadioGroup
              row
              name="isVisibleInUi"
              value={formData.isVisibleInUi.toString()}
              onChange={handleRadioChange}
            >
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
              <FormControlLabel value="false" control={<Radio />} label="No" />
            </RadioGroup>
          </div>
        </FormGroup>
      </div>
      <div className="CreateFlyoutFooter">
        <Button className="CancelButton" onClick={handleCloseClick}>
          Cancel
        </Button>
        <Button disabled={loadingData} onClick={handleSubmit}>
          Create
        </Button>
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewPartType;
