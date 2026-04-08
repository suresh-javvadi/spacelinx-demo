import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
} from "@mui/material";

import Cliploader from "../../Components/Loaders/Cliploader";
import { AlertsContext } from "../AlertsContext/Context";
import { createBin } from "../../services/binService";
import { fetchUnitOfMeasure } from "../../services/unitOfMeasureService";
import { fetchLocations } from "../../services/locationService";

const NewBin = ({ handleCloseClick, fetchBinData }) => {
  const { Alert } = useContext(AlertsContext);

  const [formData, setFormData] = useState({
    binCode: "",
    aisle: "",
    rack: "",
    capacity: null,
    locationId: "",
    unitOfMeasureId: "",
  });

  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [locations, setLocations] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      setLoadingOptions(true);
      const [locRes, unitRes] = await Promise.all([
        fetchLocations(),
        fetchUnitOfMeasure(),
      ]);
      setLocations(locRes);
      setUnits(unitRes);
    } catch (err) {
      Alert("Failed to load dropdown data", "error");
    } finally {
      setLoadingOptions(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.binCode.trim()) newErrors.binCode = "Bin Code is required";
    if (!formData.locationId) newErrors.locationId = "Location is required";
    if (!formData.unitOfMeasureId)
      newErrors.unitOfMeasureId = "Unit of Measure is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoadingData(true);
    try {
      await createBin(formData);
      Alert("Bin created successfully", "success");
      fetchBinData();
      handleCloseClick();
    } catch (err) {
      console.error(err);
      Alert("Failed to create bin", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const requiredFields = ["binCode"];

    setFormData((prev) => ({ ...prev, [name]: value }));

    // ✅ clear/show errors only for required fields
    if (requiredFields.includes(name)) {
      if (!value.trim()) {
        setErrors((prev) => ({ ...prev, [name]: `${name} is required` }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Bin</h2>
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
            <Autocomplete
              options={locations}
              getOptionLabel={(option) => option.name || ""}
              loading={loadingOptions}
              value={
                locations.find((loc) => loc.id === formData.locationId) || null
              }
              onChange={(_, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  locationId: newValue?.id || "",
                }));

                // ✅ if cleared -> show error
                setErrors((prev) => ({
                  ...prev,
                  locationId: newValue ? "" : "Location is required",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  fullWidth
                  required
                  error={!!errors.locationId}
                  helperText={errors.locationId}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingOptions ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <TextField
              label="Bin Code"
              name="binCode"
              value={formData.binCode}
              onChange={handleChange}
              fullWidth
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
            />

            <TextField
              label="Rack"
              name="rack"
              value={formData.rack}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              fullWidth
              type="number"
            />

            <Autocomplete
              options={units}
              getOptionLabel={(option) => option.name || ""}
              loading={loadingOptions}
              value={
                units.find((unit) => unit.id === formData.unitOfMeasureId) ||
                null
              }
              onChange={(_, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  unitOfMeasureId: newValue?.id || "",
                }));

                // ✅ if cleared -> show error
                setErrors((prev) => ({
                  ...prev,
                  unitOfMeasureId: newValue
                    ? ""
                    : "Unit of Measure is required",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unit of Measure"
                  fullWidth
                  required
                  error={!!errors.unitOfMeasureId}
                  helperText={errors.unitOfMeasureId}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingOptions ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
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

export default NewBin;
