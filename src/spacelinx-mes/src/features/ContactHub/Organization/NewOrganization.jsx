import React, { useState, useContext, useEffect } from "react";
import { TextField, Button, IconButton } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createOrganizationWithImage } from "../../../services/organizationService";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { styled, useTheme } from "@mui/material/styles";
import noImageDark from "../../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noImageLight from "../../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import "../../admin/admin.css";
import "../../../features/features.css";
import "../../materialKits/Kits.css";
const HiddenInput = styled("input")({
  display: "none",
});

const NewOrganization = ({
  handleCloseClick,
  handleRefresh,
  categoryOptions,
  loadCategoryOptions,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organizationAddress: null,
    category: "",
    description: "",
    taxNumber: "",
    imageFile: null,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const theme = useTheme();
  const NoImagePNG = theme.palette.mode === "dark" ? noImageDark : noImageLight;

  useEffect(() => {
    if (formData.imageFile) {
      const preview = URL.createObjectURL(formData.imageFile);
      setImagePreview(preview);

      return () => URL.revokeObjectURL(preview);
    } else {
      setImagePreview(null);
    }
  }, [formData.imageFile]);

  const validateFields = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Required";
    if (!formData.category.trim()) newErrors.category = "Required";
    if (!formData.taxNumber.trim()) newErrors.taxNumber = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
      }));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
    }));
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    setLoadingData(true);
    try {
      const form = new FormData();

      form.append("Name", formData.name);
      form.append("Category", formData.category);
      form.append("Description", formData.description);
      form.append("TaxNumber", formData.taxNumber);

      if (formData.imageFile) {
        form.append("ImageFile", formData.imageFile);
        let fileExtension = "png";
        if (formData.imageFile.name) {
          fileExtension = formData.imageFile.name.split(".").pop() || "png";
        } else if (formData.imageFile.type) {
          fileExtension = formData.imageFile.type.split("/").pop();
        }
        form.append("ImageType", fileExtension);
      }

      await createOrganizationWithImage(form);

      Alert("Organization created successfully!", "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      console.error("Submit error:", error);
      Alert("Failed to create organization", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
      <h2 style={{ marginLeft: "30px" }}>New Organization</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="CreateFlyoutBody">
        <div className="FlyoutContentSection">
          <div className="FlyoutContentWrapper">
            <div className="FlyoutContentLeft">
              <h3>Enter the Details</h3>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                fullWidth
                className="AdminTextFeilds"
              />

              <Autocomplete
                options={categoryOptions.map((option) => option.name)}
                loading={loadCategoryOptions}
                loadingText="Loading CategoryOptions..."
                value={formData.category || null}
                onChange={(e, newValue) => {
                  setFormData((prev) => ({ ...prev, category: newValue || "" }));
                  if (newValue) {
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    name="category"
                    required
                    error={!!errors.category}
                    helperText={errors.category}
                    className="AdminTextFeilds"
                  />
                )}
                disableClearable
              />

              <TextField
                label="Tax Number"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleTextChange}
                error={!!errors.taxNumber}
                helperText={errors.taxNumber}
                required
                fullWidth
                className="AdminTextFeilds"
              />

              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleTextChange}
                multiline
                rows={4}
                fullWidth
                className="AdminTextFeilds"
              />
            </div>

            <div className="FlyoutContentRight">
              <div className="newimage-container">
                <div className="image-header">
                  <p>Attach Image:</p>
                  {!formData.imageFile && (
                    <label htmlFor="image-input">
                      <Button component="span" className="icon-button">
                        <AttachFileIcon className="small-icon" />
                      </Button>
                    </label>
                  )}
                </div>

                <HiddenInput
                  type="file"
                  accept="image/*"
                  id="image-input"
                  onChange={handleSelectImage}
                />
              </div>

              {formData.imageFile ? (
                <div className="NewPartUploadedImageWrapper">
                  <div className="NewPartImagePreview">
                    <IconButton
                      onClick={handleRemoveImage}
                      aria-label="delete"
                      className="NewPartCloseButton"
                    >
                      <ion-icon
                        name="close-outline"
                        class="CloseIcon"
                      ></ion-icon>
                    </IconButton>
                    <img
                      src={imagePreview}
                      alt="Uploaded"
                      className="UploadedImage"
                    />
                  </div>
                </div>
              ) : (
                <div className="ProductImagePreview">
                  <img
                    src={NoImagePNG}
                    className="UploadedImage"
                    alt="No preview"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="CreateFlyoutFooter">
        <Button onClick={handleCloseClick} className="CancelButton">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loadingData}>
          {loadingData ? "Creating..." : "Create"}
        </Button>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewOrganization;
