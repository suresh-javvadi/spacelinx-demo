import React, { useState, useEffect, useContext, useRef } from "react";
import { TextField, Button, Autocomplete, Box, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { updateOrganizationWithImage } from "../../../services/organizationService";
import EditOrganizationAddress from "./EditOrganizationAddress";
import OrganizationStaff from "./OrganizationStaff";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useTheme } from "@mui/material/styles";
import noImageDark from "../../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noImageLight from "../../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import "../../admin/admin.css";
import "./Organization.css";
import ImagePreviewDrawer from "../../../Components/ImagePreviewDrawer/ImagePreviewDrawer";

const EditOrganization = ({
  selectedOrganization,
  handleCloseClick,
  handleRefresh,
  categoryOptions,
  handleDeleteClick,
  loadCategoryOptions,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const theme = useTheme();
  const NoImagePNG = theme.palette.mode === "dark" ? noImageDark : noImageLight;

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    taxNumber: "",
    description: "",
    imageUrl: null,
  });

  const [errors, setErrors] = useState({});
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [removedImage, setRemovedImage] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedOrganization) {
      setFormData({
        id: selectedOrganization.id || "",
        name: selectedOrganization.name || "",
        category: selectedOrganization.category || "",
        description: selectedOrganization.description || "",
        taxNumber: selectedOrganization.taxNumber || "",
        imageUrl: selectedOrganization.imageUrl || null,
        addressLine1:
          selectedOrganization.organizationAddress?.addressLine1 || "",
        addressLine2:
          selectedOrganization.organizationAddress?.addressLine2 || "",
        city: selectedOrganization.organizationAddress?.city || "",
        state: selectedOrganization.organizationAddress?.state || "",
        postalCode: selectedOrganization.organizationAddress?.postalCode || "",
        phoneNumber:
          selectedOrganization.organizationAddress?.phoneNumber || "",
        latitude: selectedOrganization.organizationAddress?.latitude || "",
        longitude: selectedOrganization.organizationAddress?.longitude || "",
      });
      setPreviewImageUrl(selectedOrganization.imageUrl || NoImagePNG);
    }
  }, [selectedOrganization]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imageUrl: file }));
      setPreviewImageUrl(URL.createObjectURL(file));
      setRemovedImage(false);
    }
  };

  const handlePreviewClick = () => {
    if (!formData.imageUrl) {
      Alert("Please upload an image first", "error");
      return;
    }

    const imageUrl =
      typeof formData.imageUrl === "string"
        ? formData.imageUrl
        : URL.createObjectURL(formData.imageUrl);

    setPreviewImageUrl(imageUrl);
    setPreviewOpen(true);
  };

  const closePreview = () => setPreviewOpen(false);

  const handleTabChange = (event, newValue) => setActiveTab(newValue);

  const handleEditSubmit = async () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Organization Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.taxNumber) newErrors.taxNumber = "Tax Number is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload = new FormData();
    payload.append("Id", formData.id);
    payload.append("Name", formData.name);
    payload.append("Category", formData.category);
    payload.append("TaxNumber", formData.taxNumber);
    payload.append("Description", formData.description);

    if (formData.imageUrl instanceof File) {
      payload.append("ImageFile", formData.imageUrl);
      payload.append("ImageType", formData.imageUrl.type.split("/")[1]);
    } else if (removedImage) {
      payload.append("ImageFile", null);
      payload.append("ImageType", null);
    } else {
      payload.append("ImageFile", null);
      payload.append("ImageType", null);
    }

    try {
      setLoadingData(true);
      await updateOrganizationWithImage(formData.id, payload);
      Alert("Organization updated successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("Update failed", error);
      Alert("Failed to update organization", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = () => {
    if (!hasPermission(PERMISSIONS.ORGANIZATION.DELETE)) {
      Alert("You don't have access to delete", "warning");
      return;
    }
    handleDeleteClick(formData.id);
  };

  const handleResetClick = () => {
    if (selectedOrganization) {
      setFormData({
        id: selectedOrganization.id || "",
        name: selectedOrganization.name || "",
        category: selectedOrganization.category || "",
        taxNumber: selectedOrganization.taxNumber || "",
        description: selectedOrganization.description || "",
        imageUrl: selectedOrganization.imageUrl || null,
      });
      setPreviewImageUrl(selectedOrganization.imageUrl || NoImagePNG);
      setErrors({});
      setRemovedImage(false);
    }
  };

  if (loadingData) {
    return (
      <div className="EditFlyout">
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      </div>
    );
  }

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <div className="EditFlyoutHeader1">
          <h2>Edit {selectedOrganization?.name} Details</h2>
        </div>
        <div className="EditFlyoutHeaderIcons">
          {activeTab === "1" && (
            <button
              onClick={() => {
                if (!hasPermission(PERMISSIONS.ORGANIZATION.MODIFY)) {
                  Alert("You do not have access to edit.", "warning");
                  return;
                }
                setReadOnlyMode(false);
              }}
            >
              <ion-icon name="create-outline"></ion-icon>
            </button>
          )}
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      <TabContext value={activeTab}>
        <Box className="EditFlyoutTabsPanel">
          <TabList onChange={handleTabChange} centered variant="fullWidth">
            <Tab label="Details" value="1" />

            {hasPermission(PERMISSIONS.ORGANIZATION.ADDRESS.VIEW) && (
              <Tab label="Address" value="2" />
            )}
          </TabList>
        </Box>

        <TabPanel value="1" className="EditFlyoutTabPanel">
          <div
            className={
              !readOnlyMode
                ? "EditFlyoutContentWithFooter"
                : "EditFlyoutContent"
            }
          >
            <div className="EditFlyoutContentLeft">
              <TextField
                label="Organization Name"
                name="name"
                className="AdminTextFeilds"
                value={formData.name || ""}
                onChange={handleTextChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                fullWidth
                InputProps={{ readOnly: readOnlyMode }}
              />
              <Autocomplete
                options={categoryOptions.map((option) => option.name)}
                loading={loadCategoryOptions}
                loadingText="Loading CategoryOptions..."
                value={
                  categoryOptions.find((opt) => opt.name === formData.category)
                    ?.name || null
                }
                onChange={(e, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    category: newValue || "",
                  }));
                  if (newValue) {
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }
                }}
                readOnly={readOnlyMode}
                className="AdminTextFeilds"
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    required
                    error={!!errors.category}
                    helperText={errors.category}
                  />
                )}
                disableClearable
              />

              <TextField
                label="Tax Number"
                name="taxNumber"
                className="AdminTextFeilds"
                value={formData.taxNumber || ""}
                onChange={handleTextChange}
                error={!!errors.taxNumber}
                helperText={errors.taxNumber}
                required
                fullWidth
                InputProps={{ readOnly: readOnlyMode }}
              />

              <TextField
                label="Description"
                name="description"
                className="AdminTextFeilds"
                value={formData.description || ""}
                multiline
                rows={3}
                onChange={handleTextChange}
                fullWidth
                InputProps={{ readOnly: readOnlyMode }}
              />
            </div>
            <div className="EditFlyoutContentRight">
              <div className="EditOrganizationImage">
                <img
                  src={
                    typeof formData.imageUrl === "string"
                      ? formData.imageUrl
                      : formData.imageUrl
                        ? URL.createObjectURL(formData.imageUrl)
                        : NoImagePNG
                  }
                  alt="Organization"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    cursor: "pointer",
                  }}
                  onClick={handlePreviewClick}
                />
              </div>
              {!readOnlyMode && (
                <div className="EditOrganizationImageControls">
                  <p>
                    <label className="upload">
                      <ion-icon
                        name="share-outline"
                        className="UploadIcon"
                      ></ion-icon>
                      Upload
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                  </p>

                  {formData.imageUrl && (
                    <p
                      className="remove-image"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, imageUrl: null }));
                        setRemovedImage(true);
                        setPreviewImageUrl(NoImagePNG);
                      }}
                    >
                      <ion-icon
                        name="trash-outline"
                        className="RemoveIcon"
                      ></ion-icon>
                      Remove
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          {!readOnlyMode && (
            <div className="EditFlyoutFooter">
              <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
              <div className="update-reset">
                <Button className="CancelButton" onClick={handleResetClick}>
                  Reset
                </Button>
                <Button onClick={handleEditSubmit}>Update</Button>
              </div>
            </div>
          )}
        </TabPanel>
        <TabPanel value="2">
          <EditOrganizationAddress
            selectedOrganizationData={selectedOrganization?.id}
            handleRefresh={handleRefresh}
          />
        </TabPanel>
        <TabPanel value="3">
          <OrganizationStaff selectedOrganization={selectedOrganization} />
        </TabPanel>
      </TabContext>

      <ImagePreviewDrawer
        open={previewOpen}
        imageUrl={previewImageUrl}
        onClose={closePreview}
      />

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditOrganization;
