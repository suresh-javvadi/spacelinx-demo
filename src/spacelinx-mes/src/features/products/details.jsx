import React, { useEffect, useState, useContext } from "react";
import {
  TextField,
  Button,
  Drawer,
  IconButton,
  Autocomplete,
} from "@mui/material";
import "./product.css";
import {
  deleteProduct,
  editProductImage,
  fetchPlatformLookUp,
  updateProduct,
  updateProductImage,
} from "../../services/productService";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useTheme } from "@mui/material/styles";
import noimagelargedark from "../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noimagelargelight from "../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import {
  showAlert,
  showConfirmation,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";

const Details = ({
  selectedProduct,
  setProductId,
  products,
  setOpen,
  fetchMainProductsData,
  setMainProductLoadingData,
}) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [productDetailsTabsValue, setProductDetailsTabsValue] = useState("1");
  const [editedProductName, setEditedProductName] = useState(
    selectedProduct.name
  );
  const [loadingData, setLoadingData] = useState(true);
  const [editedProductNumber, setEditedProductNumber] = useState(
    selectedProduct.number
  );
  const [editedDescription, setEditedDescription] = useState(
    selectedProduct.description
  );
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [initialImage, setInitialImage] = useState("");
  const [imageMarkedForDeletion, setImageMarkedForDeletion] = useState(false);
  const theme = useTheme();
  const [noImagePNG, setNoImagePNG] = useState("");
  const [editProductNameError, setEditProductNameError] = useState("");
  const [editProductDescriptionError, setEditProductDescriptionError] =
    useState("");
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    setLoadingData(false);
    const NoImagePNG =
      theme.palette.mode === "dark" ? noimagelargedark : noimagelargelight;
    setNoImagePNG(NoImagePNG);
    setInitialImage(selectedProduct.image?.filePath || NoImagePNG);
    setPreviewImageUrl(selectedProduct.image?.filePath || NoImagePNG);
    setSelectedPlatform(selectedProduct.platform || null);
  }, [theme, selectedProduct]);

  const handleResetClick = () => {
    setEditedProductName(selectedProduct.name);
    setEditedProductNumber(selectedProduct.number);
    setEditedDescription(selectedProduct.description);
    setSelectedImageFile(null);
    setPreviewImageUrl(initialImage);
    setImageMarkedForDeletion(false);
    setEditProductNameError("");
    setEditProductDescriptionError("");
    setSelectedPlatform(selectedProduct.platform || null);
  };
  const validateFeilds = () => {
    let isValid = true;

    if (!editedProductName) {
      setEditProductNameError("Product Name is required");
      isValid = false;
    }
    if (!editedDescription) {
      setEditProductDescriptionError("Description is required");
      isValid = false;
    }
    if (!selectedPlatform) {
      isValid = false;
    }
    return isValid;
  };

  const handleUpdateDetails = async () => {
    if (!validateFeilds()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setMainProductLoadingData(true);

    try {
      const updatedData = {
        id: selectedProduct.id,
        name: editedProductName,
        platformId: selectedPlatform?.id,
        description: editedDescription,
      };
      await updateProduct(selectedProduct.id, updatedData);
      if (selectedImageFile) {
        await handleImageChange();
      }
      if (imageMarkedForDeletion) {
        await editProductImage(selectedProduct.id, new FormData());
      }
      setOpen(false);
      fetchMainProductsData();
      Alert("Updated Product Successfully..!", "success");
    } catch (error) {
      Alert("Couldn't update product...!", "error");
      console.log(error);
    } finally {
      setMainProductLoadingData(false);
    }
  };

  const handleDeleteProductBtn = async () => {
    if (!hasPermission(PERMISSIONS.PRODUCTS.DELETE)) {
      Alert("You do not have access to delete products!", "warning");
      return;
    }

    const confirmed = await showConfirmation(
      "Delete Product?",
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    setMainProductLoadingData(true);
    try {
      await deleteProduct(selectedProduct.id);
      setOpen(false);
      fetchMainProductsData();

      if (selectedProduct.tempSequence > 1) {
        const nextStep = products.find(
          (item) => item.tempSequence === selectedProduct.tempSequence - 1
        );
        if (nextStep) setProductId(nextStep.id);
      }

      showAlert("success", "Deleted!", "Product Deleted Successfully..!");
    } catch (error) {
      showAlert("Couldn't Delete product...!", "error");
      console.log(error);
    } finally {
      setMainProductLoadingData(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      Alert("Please upload a valid image file", "error");
      return;
    }
    setSelectedImageFile(file);
    setReadOnlyMode(false);
    e.target.value = null;
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImageUrl(imageUrl);
    } else {
      setPreviewImageUrl(initialImage);
    }
  };

  const handleImageChange = async () => {
    setMainProductLoadingData(true);
    try {
      const formData = new FormData();
      formData.append("imageFile", selectedImageFile);
      const isExistingImage = selectedProduct.image?.filePath;
      if (isExistingImage) {
        await updateProductImage(selectedProduct.id, formData);
        Alert(" Image Edited Successfully..!", "success");
      } else {
        await updateProductImage(selectedProduct.id, formData);
        Alert(" Image Uploaded Successfully..!", "success");
      }
      fetchMainProductsData();
    } catch (error) {
      Alert("Couldn't Upload...!", "error");
      console.log(error);
    } finally {
      setMainProductLoadingData(false);
    }
  };

  const handlePreviewClick = () => {
    if (readOnlyMode) return;

    if (previewImageUrl === noImagePNG) {
      document.getElementById("fileInput").click();
    } else {
      setPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const markImageForDeletion = () => {
    setImageMarkedForDeletion(true);
    setPreviewImageUrl(noImagePNG);
    setSelectedImageFile(null);
  };

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

  const canModifyProductDetails =
    !readOnlyMode && hasPermission(PERMISSIONS.PRODUCTS.MODIFY);

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3 className="ProductDetailsFlyoutName">{selectedProduct.name}</h3>
        <div>
          {productDetailsTabsValue === "1" ? (
            <button
              onClick={() => {
                if (hasPermission(PERMISSIONS.PRODUCTS.MODIFY)) {
                  setReadOnlyMode(false);
                } else {
                  Alert(
                    "You do not have access to modify products!",
                    "warning"
                  );
                }
              }}
              disabled={
                !hasPermission(PERMISSIONS.PRODUCTS.MODIFY) || !readOnlyMode
              }
            >
              <ion-icon
                name="create-outline"
                class={
                  !hasPermission(PERMISSIONS.PRODUCTS.MODIFY)
                    ? "IonIconDisabled"
                    : undefined
                }
              ></ion-icon>
            </button>
          ) : (
            ""
          )}
          <button
            onClick={() => {
              setOpen(false);
            }}
          >
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      <div className="BuildFlyoutBody1">
        {loadingData ? (
          <div className="loader-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : (
          productDetailsTabsValue === "1" && (
            <>
              <div className="ProductImageContainer">
                <div className="ProductDetailsImageDiv">
                  <img
                    className="DetailsImage"
                    onClick={handlePreviewClick}
                    src={previewImageUrl}
                    alt={selectedProduct.name}
                  />
                  {canModifyProductDetails && (
                    <div className="ProductImgOptions">
                      {previewImageUrl !== noImagePNG ? (
                        <>
                          <p
                            onClick={() => {
                              document.getElementById("fileInput").click();
                            }}
                          >
                            <ion-icon name="create-outline"></ion-icon> Edit
                          </p>
                          <p onClick={handlePreviewClick}>
                            <ion-icon name="eye-outline"></ion-icon> Preview
                          </p>
                          <p onClick={markImageForDeletion}>
                            <ion-icon name="trash-outline"></ion-icon> Delete
                          </p>
                        </>
                      ) : (
                        <div className="ProductImgOptionsForNoImage">
                          <p
                            onClick={() => {
                              document.getElementById("fileInput").click();
                            }}
                          >
                            <ion-icon name="create-outline"></ion-icon> Upload
                            Image
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  disabled={!hasPermission(PERMISSIONS.PRODUCTS.MODIFY)}
                />
              </div>

              <div className="ProductInner">
                <TextField
                  name="ProductNumber"
                  label="Product Number"
                  fullWidth
                  value={editedProductNumber}
                  onChange={(e) => setEditedProductNumber(e.target.value)}
                  InputProps={{ readOnly: true }}
                  disabled
                  required
                />
                <TextField
                  name="ProductName"
                  label="Product Name"
                  fullWidth
                  value={editedProductName}
                  error={editProductNameError}
                  helperText={editProductNameError}
                  onChange={(e) => {
                    if (!canModifyProductDetails) {
                      Alert(
                        "You do not have access to modify products!",
                        "warning"
                      );
                      return;
                    }
                    const value = e.target.value;
                    setEditedProductName(value);
                    if (value === "") {
                      setEditProductNameError("Product Name is required");
                    } else {
                      setEditProductNameError("");
                    }
                  }}
                  InputProps={{
                    readOnly: !canModifyProductDetails,
                  }}
                  required
                />
                <Autocomplete
                  value={selectedPlatform || null}
                  onChange={(event, newValue) => {
                    if (canModifyProductDetails) {
                      setSelectedPlatform(newValue);
                    } else {
                      Alert(
                        "You do not have access to modify products!",
                        "warning"
                      );
                    }
                  }}
                  options={platforms}
                  getOptionLabel={(option) => option.name}
                  readOnly={!canModifyProductDetails}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Platform"
                      error={!selectedPlatform}
                      helperText={
                        !selectedPlatform ? "Platform is required" : ""
                      }
                      required
                    />
                  )}
                />

                <TextField
                  name="Description"
                  label="Description"
                  variant="outlined"
                  multiline
                  fullWidth
                  rows={5}
                  value={editedDescription}
                  error={!!editProductDescriptionError}
                  helperText={editProductDescriptionError}
                  onChange={(e) => {
                    if (!canModifyProductDetails) {
                      Alert(
                        "You do not have access to modify products!",
                        "warning"
                      );
                      return;
                    }
                    const value = e.target.value;
                    setEditedDescription(value);
                    if (value === "") {
                      setEditProductDescriptionError("Description is required");
                    } else {
                      setEditProductDescriptionError("");
                    }
                  }}
                  InputProps={{
                    readOnly: !canModifyProductDetails,
                  }}
                  required
                />
              </div>
            </>
          )
        )}
      </div>
      {productDetailsTabsValue === "1" && (
        <div className="BuildEditFlyoutFooter">
          {canModifyProductDetails && (
            <>
              <ion-icon
                name="trash-outline"
                onClick={handleDeleteProductBtn}
                disabled={
                  loadingData || !hasPermission(PERMISSIONS.PRODUCTS.DELETE)
                }
                class={
                  !hasPermission(PERMISSIONS.PRODUCTS.DELETE)
                    ? "IonIconDisabled"
                    : undefined
                }
              ></ion-icon>
              <div className="update-reset">
                <Button onClick={handleResetClick} disabled={loadingData}>
                  Reset
                </Button>
                <Button onClick={handleUpdateDetails} disabled={loadingData}>
                  Update
                </Button>
              </div>
            </>
          )}
        </div>
      )}
      <Drawer anchor="right" open={previewOpen} onClose={closePreview}>
        <div className="image-flyout">
          <img src={previewImageUrl} alt="Preview Image" />
          <IconButton onClick={closePreview} className="close-button">
            <ion-icon name="close-outline"></ion-icon>
          </IconButton>
        </div>
      </Drawer>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default Details;
