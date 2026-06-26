import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  MenuItem,
  Button,
  styled,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";
import { fetchParts } from "../../services/partService";
import { fetchAllParentParts } from "../../services/partService";
import { fetchLocations } from "../../services/locationService";
import { createMaterialKitWithImage } from "../../services/materialKitService";
import CameraComponent from "./CameraComponent";
import "./Kits.css";
import "../../features/features.css";
import Cliploader from "../../Components/Loaders/Cliploader";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { fetchGuideWithId } from "../../services/guideService";
import attachIcon from "../../Assest/Images/icons/attach.png";
import cameraIcon from "../../Assest/Images/icons/camera.png";

const NewMaterialKit = ({
  handleCloseClick,
  fetchMaterialKitData,
  setMainLocationLoadingData,
}) => {
  const [loadingData, setLoadingData] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [parts, setParts] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [kitName, setKitName] = useState("");
  const [location, setLocation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [kitNameError, setKitNameError] = useState("");
  const [partError, setPartError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [partsLoading, setPartsLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [parentPart, setParentPart] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const { Alert } = useContext(AlertsContext);
  const [loadingPartFeild, setLoadingPartFeild] = useState(false);

  useEffect(() => {
    const handleFetchParts = async () => {
      setPartsLoading(true);
      try {
        const allParts = await fetchAllParentParts();
        setParts(allParts);
      } catch (error) {
        Alert("Error Fetching Parts", "error");
        console.error("Error fetching parts:", error);
      } finally {
        setPartsLoading(false);
      }
    };

    handleFetchParts();
  }, []);

  useEffect(() => {
    const handleFetchLocations = async () => {
      setLocationLoading(true);
      try {
        const allLocations = await fetchLocations();
        setLocationsData(allLocations);
      } catch (error) {
        Alert("Error Fetching Locations", "error");
        console.error("Error fetching locations:", error);
      } finally {
        setLocationLoading(false);
      }
    };

    handleFetchLocations();
  }, []);

  const filter = createFilterOptions();

  const validateCreateMaterialKitFields = () => {
    let valid = true;

    const errors = {
      kitName: "",
      part: "",
      quantity: "",
      location: "",
    };

    if (!kitName) {
      errors.kitName = "Kit Name is required";
      valid = false;
    }

    if (!parentPart) {
      errors.part = "Part is required";
      valid = false;
    }

    if (!quantity) {
      errors.quantity = "Quantity is required";
      valid = false;
    }

    if (!location) {
      errors.location = "Location is required";
      valid = false;
    }

    setKitNameError(errors.kitName);
    setPartError(errors.part);
    setQuantityError(errors.quantity);
    setLocationError(errors.location);

    return valid;
  };
  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImageFile(file);
    } else {
      setSelectedImageFile(null);
      alert("Please select a valid image file.");
    }
  };

  const handleCapture = async (imageSrc) => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], "captured-image.jpg", {
        type: "image/jpeg",
      });
      setSelectedImageFile(file);
    } catch (error) {
      console.error("Error converting base64 to file:", error);
    }
    setCameraOpen(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreateMaterialKitFields()) {
      return;
    }
    setMainLocationLoadingData(true);
    setLoadingData(true);

    try {
      const formData = new FormData();

      formData.append("name", kitName);
      formData.append("partId", parentPart?.id || "");
      formData.append("locationId", location?.id || "");
      formData.append("quantity", quantity || "");
      formData.append("imageFile", selectedImageFile || null);
      await createMaterialKitWithImage(formData);
      fetchMaterialKitData();
      handleCloseClick();
      Alert("Material Kit Created Successfully...", "success");
    } catch (error) {
      console.error("Error handling creation:", error);
      setMainLocationLoadingData(false);
      Alert("Couldn't Create Material Kit — Please Try Again...", "error");
    } finally {
      setLoadingData(false);
      setMainLocationLoadingData(false);
    }
  };

  const HiddenInput = styled("input")({
    display: "none",
  });

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "4%" }}>Create Kit</h2>
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
            <h3>Enter The Details</h3>

            <Autocomplete
              value={parentPart || null}
              disabled={loadingPartFeild}
              onChange={async (event, newValue) => {
                setParentPart(newValue);
                if (newValue) {
                  setKitName(`${newValue.name}`);
                  setKitNameError("");
                  setPartError("");
                } else {
                  setKitName("");
                }
              }}
              filterOptions={(options, params) => {
                return filter(options, params);
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="parent-child-autocomplete"
              options={parts}
              getOptionLabel={(option) =>
                `${option.partNumber} - ${option.name}`
              }
              renderOption={(props, option) => (
                <MenuItem
                  {...props}
                  style={{ color: option.guideId && "#6366F1" }}
                >
                  {`${option.partNumber} - ${option.name}`}
                </MenuItem>
              )}
              openOnFocus
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Part"
                  error={!!partError}
                  helperText={partError}
                  className="AdminTextFeilds"
                  required
                />
              )}
            />
            <TextField
              label="Kit Name"
              value={kitName}
              onChange={(e) => {
                setKitName(e.target.value);
                setKitNameError("");
              }}
              error={!!kitNameError}
              helperText={kitNameError}
              className="AdminTextFeilds"
              disabled
              required
            />

            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue === "" || newValue === "0") {
                  setQuantity("");
                } else {
                  setQuantity(Math.max(1, newValue));
                  setQuantityError("");
                }
              }}
              error={!!quantityError}
              helperText={quantityError}
              className="AdminTextFeilds"
              required
            />

            <Autocomplete
              value={location}
              onChange={(event, newValue) => {
                setLocation(newValue);
                setLocationError("");
              }}
              filterOptions={(options, params) => {
                return options.filter((option) =>
                  option.name
                    .toLowerCase()
                    .includes(params.inputValue.toLowerCase())
                );
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="location-autocomplete"
              options={locationsData}
              loading={locationLoading}
              loadingText="Loading Location..."
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <MenuItem {...props}>{option.name}</MenuItem>
              )}
              openOnFocus
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  error={!!locationError}
                  helperText={locationError}
                  className="AdminTextFields"
                  required
                />
              )}
            />
            <div className="MaterialKitImageControlsDiv">
              <label>
                <img src={attachIcon} alt="Attach" />
                <HiddenInput
                  type="file"
                  accept="image/*"
                  onChange={handleSelectImage}
                />
              </label>
              <label className="CameraButton">
                <button onClick={() => setCameraOpen(true)}>
                  <img src={cameraIcon} alt="" />
                </button>
              </label>
            </div>
            {cameraOpen && (
              <CameraComponent
                onSave={handleCapture}
                onClose={() => setCameraOpen(false)}
              />
            )}
            {selectedImageFile && (
              <div className="UploadedImageWrapper">
                <div className="ProductImagePreview">
                  {selectedImageFile instanceof File ? (
                    <img
                      src={URL.createObjectURL(selectedImageFile)}
                      alt="Preview"
                      className="UploadedImage"
                    />
                  ) : (
                    <p className="KitNewNoPreview">Preview not available</p>
                  )}
                </div>

                <ion-icon
                  onClick={() => setSelectedImageFile(null)}
                  name="close-outline"
                ></ion-icon>
              </div>
            )}
          </div>
          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>{" "}
            <Button type="submit" onClick={handleCreate}>
              Create
            </Button>
          </div>
          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
          <div className="AlertMessages">
            <HomeAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default NewMaterialKit;
