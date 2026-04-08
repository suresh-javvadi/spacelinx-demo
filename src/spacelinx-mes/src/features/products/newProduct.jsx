import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Stack, styled, MenuItem } from "@mui/material";
import Autocomplete from "@mui/lab/Autocomplete";
import { createFilterOptions } from "@mui/material";
import { createProductWithImage } from "../../services/productService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { fetchPlatformLookUp } from "../../services/productService";
import { fetchPartWithStatus } from "../../services/partService";
import { ProductContext } from "./prodcutContext";
import "../materialKits/Kits.css";

const NewProduct = ({
  handleCloseClick,
  fetchProductsData,
  setMainProductsLoadingData,
  setCreateProductDrawerStatus,
  setSearchQuery,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [productName, setProductName] = useState("");
  const [parentPartName, setParentPartName] = useState(null); // Default to null for better validation handling
  const [description, setDescription] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [availableParentParts, setAvailableParentParts] = useState([]);
  const [formErrors, setFormErrors] = useState({
    productName: "",
    parentPartName: "",
    description: "",
    selectedPlatform: "",
  });
  const { setSelectedProductId } = useContext(ProductContext);

  const filter = createFilterOptions();

  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
    }
  };

  useEffect(() => {
    async function fetchAvailableParts() {
      setLoadingData(true);
      try {
        const allParts = await fetchPartWithStatus("Release");
        const filteredParts = allParts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setAvailableParentParts(filteredParts);
        setLoadingData(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchAvailableParts();
  }, []);

  useEffect(() => {
    setLoadingData(true);
    async function fetchPlatforms() {
      try {
        const platformsData = await fetchPlatformLookUp();
        setPlatforms(platformsData);
      } catch (error) {
        console.error("Error fetching platforms:", error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchPlatforms();
  }, []);

  const validateCreateProductFields = () => {
    let valid = true;
    const errors = {
      productName: "",
      parentPartName: "",
      description: "",
      selectedPlatform: "",
    };

    if (!productName) {
      errors.productName = "Product Name is required";
      valid = false;
    }

    if (!parentPartName) {
      errors.parentPartName = "Part Name is required";
      valid = false;
    }

    if (!description) {
      errors.description = "Description is required";
      valid = false;
    }

    if (!selectedPlatform) {
      errors.selectedPlatform = "Platform is required";
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  const handleCreate = async () => {
    if (!validateCreateProductFields()) {
      return;
    }
    setMainProductsLoadingData(true);
    try {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("platformId", selectedPlatform.id);
      selectedImageFile
        ? formData.append("imageFile", selectedImageFile)
        : formData.append("imageFile", null);
      formData.append("partId", parentPartName.id);
      formData.append("description", description);
      setLoadingData(true);
      await createProductWithImage(formData);
      Alert("Created Product Successfully..!", "success");
      handleCloseClick();
      fetchProductsData();
      setProductName("");
      setParentPartName(null);
      setDescription("");
      setSelectedImageFile(null);
      setSearchQuery("");
      setSelectedProductId(null);
    } catch (error) {
      console.error("Error creating product:", error);
      Alert("Couldn't Create Product ...!", "error");
    } finally {
      setLoadingData(false);
      setMainProductsLoadingData(false);
    }
  };

  const HiddenInput = styled("input")({
    display: "none",
  });

  return (
    <div className="CreateFlyout ">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "4%" }}>Create Product</h2>
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
            <TextField
              label="Product Name"
              className="AdminTextFeilds"
              onChange={(e) => {
                setProductName(e.target.value);
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  productName: "",
                }));
              }}
              value={productName}
              error={!!formErrors.productName}
              helperText={formErrors.productName}
              required
            />
            <Autocomplete
              value={parentPartName || null}
              onChange={(event, newValue) => {
                setParentPartName(newValue);
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  parentPartName: "",
                }));
              }}
              filterOptions={(options, params) => filter(options, params)}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="parent-child-autocomplete"
              options={availableParentParts}
              getOptionLabel={(option) =>
                `${option.partNumber} - ${option.name}`
              }
              renderOption={(props, option) => (
                <MenuItem
                  {...props}
                  key={option.id}
                  >
                  {`${option.partNumber} - ${option.name}`}
                </MenuItem>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Part"
                  className="AdminTextFeilds"
                  error={!!formErrors.parentPartName}
                  helperText={formErrors.parentPartName}
                  required
                />
              )}
            />
            <Autocomplete
              value={selectedPlatform || null}
              onChange={(event, newValue) => {
                setSelectedPlatform(newValue);
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  selectedPlatform: "",
                }));
              }}
              options={platforms}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Platform"
                  error={!!formErrors.selectedPlatform}
                  helperText={formErrors.selectedPlatform}
                  required
                />
              )}
            />
            <TextField
              label="Description"
              className="AdminTextFeilds"
              multiline
              rows={3}
              onChange={(e) => {
                setDescription(e.target.value);
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  description: "",
                }));
              }}
              value={description}
              error={!!formErrors.description}
              helperText={formErrors.description}
              required
            />
            <div className="ImageUploadContainer">
              <div className="UploadTextWrapper">
                <p>Attach Image :</p>
                <HiddenInput
                  type="file"
                  accept="image/*"
                  id="image-input"
                  onChange={handleSelectImage}
                />
                {!selectedImageFile && (
                  <label htmlFor="image-input">
                    <Button component="span">
                      <ion-icon name="document-attach-outline"></ion-icon>
                    </Button>
                  </label>
                )}
              </div>

              {selectedImageFile && (
                <div className="UploadedImageWrapper">
                  <div className="ProductImagePreview">
                    <img
                      src={URL.createObjectURL(selectedImageFile)}
                      alt="Uploaded"
                      className="UploadedImage"
                    />
                  </div>
                  <ion-icon
                    onClick={() => setSelectedImageFile(null)}
                    name="close-outline"
                  ></ion-icon>
                </div>
              )}
            </div>
          </div>
          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loadingData}>
              Create
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NewProduct;
