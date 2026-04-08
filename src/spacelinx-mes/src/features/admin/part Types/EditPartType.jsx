import React, { useState, useContext, useEffect } from "react";
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
import { updatePartType } from "../../../services/partTypeService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
const EditPartType = ({
  handleCloseClick,
  handleRefresh,
  selectedPartType,
  categoriesData,
  loadingCategories,
  partLevelData,
  loadingPartLevels,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    partNumberPrefix: "",
    category: "",
    partTypeCategoryId: null,
    isVisibleInUi: true,
    partLevelId: "",
  });
  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({
    name: "",
    partNumberPrefix: "",
    category: "",
    partLevelId: "",
  });

  useEffect(() => {
    if (selectedPartType) {
      const data = {
        name: selectedPartType.name || "",
        partNumberPrefix: selectedPartType.partNumberPrefix ?? "",
        category: selectedPartType.category || "",
        partTypeCategoryId: selectedPartType.partTypeCategoryId ?? null,
        isVisibleInUi: selectedPartType.isVisibleInUi === false ? false : true,
        partLevelId: selectedPartType.partLevelId || "",
      };

      setFormData(data);
      setInitialData(data);
      setLoadingData(false);
    }
  }, [selectedPartType]);

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

    if (!formData.partLevelId) {
      newErrors.partLevelId = "Part Level is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const hasFormChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields", "error");
      return;
    }
    if (!hasFormChanged()) {
      Alert("No changes detected", "warning");
      return;
    }

    if (!selectedPartType?.id) {
      Alert("Invalid Part Type ID", "error");
      return;
    }
    setLoadingData(true);

    try {
      const updateData = {
        id: selectedPartType.id,
        name: formData.name,
        partNumberPrefix: formData.partNumberPrefix,
        category: formData.category,
        partTypeCategoryId: formData.partTypeCategoryId,
        isVisibleInUi: formData.isVisibleInUi,
        partLevelId: formData.partLevelId,
      };

      await updatePartType(selectedPartType.id, updateData);
      Alert("Part Type updated successfully!", "success");
      handleCloseClick();
      await handleRefresh();
    } catch (error) {
      console.error("Error updating Part Type:", error);
      Alert("Failed to update Part Type. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({
      name: "",
      partNumberPrefix: "",
      category: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });

    if (!value.trim()) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: `${name.replace(/([A-Z])/g, " $1")} is required`.trim(),
      }));
    } else if (name === "partNumberPrefix" && Number.isNaN(Number(value))) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        partNumberPrefix: "Part Number Prefix must be a number",
      }));
    }
  };

  const handleRadioChange = (e) => {
    setFormData({
      ...formData,
      isVisibleInUi: e.target.value === "true",
    });
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>Edit Part Type</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.PARTTYPES.MODIFY)) {
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
        <div className="CreateFlyoutBody">
          <FormGroup>
            <TextField
              label="Name"
              name="name"
              className="AdminTextFeilds"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={readOnlyMode}
            />
          </FormGroup>
          <FormGroup>
            <TextField
              label="Part Number Prefix"
              name="partNumberPrefix"
              className="AdminTextFeilds"
              value={formData.partNumberPrefix}
              type="number"
              onChange={handleInputChange}
              error={!!errors.partNumberPrefix}
              helperText={errors.partNumberPrefix}
              disabled={readOnlyMode}
            />
          </FormGroup>
          <FormGroup>
            <Autocomplete
              options={categoriesData}
              loading={loadingCategories}
              loadingText="Loading categories..."
              getOptionLabel={(option) => option.name || ""}
              value={
                categoriesData.find(
                  (c) => c.id === formData.partTypeCategoryId
                ) || null
              }
              onChange={(_, value) => {
                setFormData((prev) => ({
                  ...prev,
                  partTypeCategoryId: value ? value.id : null,
                  category: value ? value.name : "",
                }));
                setErrors((prev) => ({ ...prev, category: "" }));
              }}
              readOnly={readOnlyMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  error={!!errors.category}
                  helperText={errors.category}
                  InputProps={{
                    ...params.InputProps,
                    readOnly: readOnlyMode,
                  }}
                />
              )}
            />
          </FormGroup>

          <FormGroup>
            <Autocomplete
              options={partLevelData}
              loading={loadingPartLevels}
              loadingText="Loading part levels..."
              getOptionLabel={(option) => option.name || ""}
              value={
                partLevelData.find((c) => c.id === formData.partLevelId) || null
              }
              onChange={(_, value) => {
                setFormData((prev) => ({
                  ...prev,
                  partLevelId: value ? value.id : null,
                  partLevel: value ? value.name : "",
                }));
                setErrors((prev) => ({ ...prev, partLevel: "" }));
              }}
              readOnly={readOnlyMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Part Level"
                  error={!!errors.partLevelId}
                  helperText={errors.partLevelId}
                  InputProps={{
                    ...params.InputProps,
                    readOnly: readOnlyMode,
                  }}
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
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Yes"
                  disabled={readOnlyMode}
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="No"
                  disabled={readOnlyMode}
                />
              </RadioGroup>
            </div>
          </FormGroup>
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

export default EditPartType;
