import React from "react";
import { useState, useEffect, useContext } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import {
  createFeatureBit,
  fetchFeatureBit,
  activateFeatureBit,
  deactivateFeatureBit,
  deleteFeatureBit,
  updateFeatureBit,
} from "../../../services/featureBitService";
import { TextField, Switch, Button } from "@mui/material";
import "./Features.css";
import {
  showConfirmation,
  showAlert,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { useFeatureBitContext } from "./FeatureBitContext";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Features = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [featuresBitData, setFeaturesBitData] = useState([]);
  const [featureName, setFeatureName] = useState("");
  const [featureNameError, setFeatureNameError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [originalFeatureName, setOriginalFeatureName] = useState("");
  const appName = import.meta.env.VITE_APP_NAME;
  const { fetchFeatureBitContextData } = useFeatureBitContext();

  const fetchFeatureBitData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchFeatureBit();
      if (data) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeaturesBitData(data);
      }
    } catch (error) {
      Alert("Failed to load feature bit data. Please try again.", "error");
      console.error("Error fetching feature bit data:", error);
    } finally {
      setLoadingData(false);
    }
  };
  useEffect(() => {
    fetchFeatureBitData();
  }, []);

  const handleToggle = async (params) => {
    const { isActive, id } = params;
    setLoadingData(true);

    try {
      if (isActive) {
        await deactivateFeatureBit(id);
        await fetchFeatureBitContextData();
        Alert("Feature deactivated successfully..!", "success");
      } else {
        await activateFeatureBit(id);
        await fetchFeatureBitContextData();
        Alert("Feature activated successfully..!", "success");
      }

      await fetchFeatureBitData();
    } catch (error) {
      Alert(
        `Failed to ${
          isActive ? "deactivate" : "activate"
        } feature. Please try again.`,
        "error"
      );
      console.error(
        `Error ${isActive ? "deactivating" : "activating"} feature:`,
        error
      );
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "featureName",
      headerName: "Feature Name",
      flex: 0.3,
    },
    {
      field: "",
      headerName: "Actions",
      flex: 0.3,
      renderCell: ({ row }) => (
        <Switch
          checked={row.isActive || false}
          disabled={loadingData}
          onChange={(e) => handleToggle(row)}
        />
      ),
    },
    {
      field: " ",
      width: 10,
      renderCell: ({ row }) => {
        const handleDelete = async () => {
          const confirmed = await showConfirmation(
            "Delete FeatureBit?",
            "Are you sure you want to delete this FeatureBit?"
          );

          if (!confirmed) return;
          setLoadingData(true);

          try {
            await deleteFeatureBit(row.id);

            showAlert(
              "success",
              "Deleted!",
              "FeatureBit deleted successfully."
            );

            await fetchFeatureBitData();
          } catch (error) {
            console.error("Delete error:", error);
            showAlert(
              "error",
              "Failed!",
              "Couldn't delete the FeatureBit. Try again."
            );
          } finally {
            setLoadingData(false);
          }
        };

        return (
          <ion-icon
            style={{ cursor: "pointer", color: "red" }}
            name="trash-outline"
            onClick={handleDelete}
          ></ion-icon>
        );
      },
    },
  ];

  const checkDuplicateFeatureName = (name, excludeId = null) => {
    const trimmedName = name.trim().toLowerCase();
    return featuresBitData.some((feature) => {
      const existingName = feature.featureName.trim().toLowerCase();
      if (excludeId && feature.id === excludeId) return false;
      return existingName === trimmedName;
    });
  };

  const validateFields = () => {
    if (!featureName || !featureName.trim()) {
      setFeatureNameError("Feature name is required");
      return false;
    }

    const isDuplicate = checkDuplicateFeatureName(
      featureName,
      editMode ? selectedFeature?.id : null
    );

    if (isDuplicate) {
      setFeatureNameError(
        "Feature name already exists. Please use a different name."
      );
      return false;
    }

    return true;
  };

  const hasChanges = () => {
    if (!editMode) return true;
    return featureName.trim() !== originalFeatureName.trim();
  };

  const handleCreateFeature = async () => {
    if (!validateFields()) {
      Alert(featureNameError || "Please fill in all required fields", "error");
      return;
    }

    setLoadingData(true);

    const payload = {
      featureName: featureName.trim(),
      applicationName: appName,
    };

    try {
      await createFeatureBit(payload);
      Alert("Feature created successfully..!", "success");
      setFeatureName("");
      setFeatureNameError("");
      await fetchFeatureBitData();
      await fetchFeatureBitContextData();
    } catch (error) {
      Alert("Failed to create feature. Please try again.", "error");
      console.error("Error creating feature:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleEditFeature = async () => {
    if (!hasChanges()) {
      Alert(
        "No changes detected. Please modify the feature name to update.",
        "warning"
      );
      return;
    }
    if (!validateFields()) {
      Alert(featureNameError || "Please fill in all required fields", "error");
      return;
    }

    setLoadingData(true);

    const payload = {
      featureName: featureName.trim(),
      applicationName: appName,
    };

    try {
      await updateFeatureBit(selectedFeature?.id, payload);
      Alert("Feature updated successfully..!", "success");
      setFeatureName("");
      setFeatureNameError("");
      setSelectedFeature(null);
      setOriginalFeatureName("");
      setEditMode(false);
      await fetchFeatureBitData();
      await fetchFeatureBitContextData();
    } catch (error) {
      Alert("Failed to update feature. Please try again.", "error");
      console.error("Error updating feature:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFeatureName("");
    setFeatureNameError("");
    setSelectedFeature(null);
    setOriginalFeatureName("");
  };

  const handleFeatureNameChange = (e) => {
    const value = e.target.value;
    setFeatureName(value);

    if (value && value.trim()) {
      setFeatureNameError("");

      const isDuplicate = checkDuplicateFeatureName(
        value,
        editMode ? selectedFeature?.id : null
      );

      if (isDuplicate) {
        setFeatureNameError(
          "Feature name already exists. Please use a different name."
        );
      }
    } else {
      setFeatureNameError("Feature name is required.");
    }
  };

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Features</p>
        </div>
        <div className="AddFeatureContainer">
          <TextField
            label="Feature Name"
            className="FeatureName"
            value={featureName}
            error={!!featureNameError}
            helperText={featureNameError}
            onChange={handleFeatureNameChange}
          />
          <Button
            className="AddFeatureButton"
            onClick={editMode ? handleEditFeature : handleCreateFeature}
          >
            {editMode ? "Update" : "Add"}
          </Button>
          {editMode && (
            <Button
              className="CancelButton CancelFeatureButton"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </div>
        <div className="FeaturesDataGridDiv">
          <StyledDataGrid
            rows={featuresBitData}
            columns={columns}
            className="DataGrid"
            onCellClick={(params) => {
              if (params.field === "featureName") {
                setFeatureName(params.value);
                setOriginalFeatureName(params.value);
                setEditMode(true);
                setSelectedFeature(params.row);
                setFeatureNameError("");
              }
            }}
            loading={loadingData}
          />
        </div>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Features;
