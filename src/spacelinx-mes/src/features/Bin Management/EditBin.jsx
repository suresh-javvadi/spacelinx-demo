import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Autocomplete } from "@mui/material";
import Cliploader from "../../Components/Loaders/Cliploader";
import { AlertsContext } from "../AlertsContext/Context";
import { updateBin } from "../../services/binService";
import { fetchLocations } from "../../services/locationService";
import { fetchUnitOfMeasure } from "../../services/unitOfMeasureService";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
const EditBin = ({ selectedBin, handleCloseClick, fetchBinData }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [formData, setFormData] = useState({
    locationId: "",
    binCode: "",
    aisle: "",
    rack: "",
    capacity: 0,
    unitOfMeasureId: "",
  });

  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);

  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedUOM, setSelectedUOM] = useState(null);

  // ✅ useEffect 1: Fetch dropdown data once on component mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [locationData, unitData] = await Promise.all([
          fetchLocations(),
          fetchUnitOfMeasure(),
        ]);
        setLocations(locationData);
        setUnits(unitData);
      } catch (err) {
        Alert("Error fetching dropdown data", "error");
      }
    };

    fetchDropdowns();
  }, []);

  // ✅ useEffect 2: Handle selectedBin changes and form pre-filling
  useEffect(() => {
    if (selectedBin) {
      // Always set form data immediately
      setFormData({
        locationId: selectedBin.locationId || "",
        binCode: selectedBin.binCode || "",
        aisle: selectedBin.aisle || "",
        rack: selectedBin.rack || "",
        capacity: selectedBin.capacity || 0,
        unitOfMeasureId: selectedBin.unitOfMeasureId || "",
      });

      // Set temporary display values using names (instant display)
      if (selectedBin.locationName) {
        setSelectedLocation({ name: selectedBin.locationName });
      }
      if (selectedBin.unitOfMeasureName) {
        setSelectedUOM({ name: selectedBin.unitOfMeasureName });
      }

      // If dropdown data is already loaded, find and set proper objects
      if (locations.length && units.length) {
        const matchingLocation = locations.find(
          (loc) => loc.name === selectedBin.locationName
        );
        const matchingUOM = units.find(
          (unit) => unit.name === selectedBin.unitOfMeasureName
        );

        if (matchingLocation) {
          setSelectedLocation(matchingLocation);
          setFormData((prev) => ({ ...prev, locationId: matchingLocation.id }));
        }

        if (matchingUOM) {
          setSelectedUOM(matchingUOM);
          setFormData((prev) => ({ ...prev, unitOfMeasureId: matchingUOM.id }));
        }
      }
    }
  }, [selectedBin, locations, units]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "binCode" && !value.trim()) {
      setErrors((prev) => ({ ...prev, binCode: "Bin Code is required" }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.locationId) {
      newErrors.locationId = "Location is required";
      valid = false;
    }
    if (!formData.binCode.trim()) {
      newErrors.binCode = "Bin Code is required";
      valid = false;
    }
    if (!formData.unitOfMeasureId) {
      newErrors.unitOfMeasureId = "Unit of Measure is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoadingData(true);
    try {
      await updateBin(selectedBin.id, formData);
      Alert("Bin updated successfully", "success");
      fetchBinData();
      handleCloseClick();
    } catch (err) {
      Alert("Failed to update bin", "error");
      console.error("Update error:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    if (selectedBin) {
      const matchingLocation = locations.find(
        (loc) => loc.name === selectedBin.locationName
      );
      const matchingUOM = units.find(
        (unit) => unit.name === selectedBin.unitOfMeasureName
      );

      setFormData({
        locationId: matchingLocation?.id || "",
        binCode: selectedBin.binCode || "",
        aisle: selectedBin.aisle || "",
        rack: selectedBin.rack || "",
        capacity: selectedBin.capacity || 0,
        unitOfMeasureId: matchingUOM?.id || "",
      });

      setSelectedLocation(
        matchingLocation || { name: selectedBin.locationName }
      );
      setSelectedUOM(matchingUOM || { name: selectedBin.unitOfMeasureName });

      setErrors({});
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Edit Bin</h2>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.BINMANAGEMENT.MODIFY)) {
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
            <Autocomplete
              options={locations}
              getOptionLabel={(option) => option.name || ""}
              value={selectedLocation}
              onChange={(e, newValue) => {
                setSelectedLocation(newValue);
                setFormData((prev) => ({
                  ...prev,
                  locationId: newValue?.id || "",
                }));
              }}
              disabled={readOnlyMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  fullWidth
                  error={!!errors.locationId}
                  helperText={errors.locationId}
                  required
                />
              )}
            />

            <TextField
              label="Bin Code"
              name="binCode"
              value={formData.binCode}
              onChange={handleChange}
              fullWidth
              InputProps={{ readOnly: readOnlyMode }}
              error={!!errors.binCode}
              helperText={errors.binCode}
              required
            />

            <TextField
              label="Aisle"
              name="aisle"
              value={formData.aisle}
              onChange={handleChange}
              fullWidth
              InputProps={{ readOnly: readOnlyMode }}
            />

            <TextField
              label="Rack"
              name="rack"
              value={formData.rack}
              onChange={handleChange}
              fullWidth
              InputProps={{ readOnly: readOnlyMode }}
            />

            <TextField
              label="Capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              fullWidth
              InputProps={{ readOnly: readOnlyMode }}
            />

            <Autocomplete
              options={units}
              getOptionLabel={(option) => option.name || ""}
              value={selectedUOM}
              onChange={(e, newValue) => {
                setSelectedUOM(newValue);
                setFormData((prev) => ({
                  ...prev,
                  unitOfMeasureId: newValue?.id || "",
                }));
              }}
              disabled={readOnlyMode}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unit of Measure"
                  fullWidth
                  error={!!errors.unitOfMeasureId}
                  helperText={errors.unitOfMeasureId}
                  required
                />
              )}
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

export default EditBin;
