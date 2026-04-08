import React, { useContext, useState } from "react";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import { Add, MoreHoriz } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { uploadData, downloadTemplate } from "../../services/bulkUploadService";
import { AlertsContext } from "../AlertsContext/Context";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import "../../features/Bulk Upload/BulkUpload.css";

const ImportComponent = ({
  handleRefresh,
  entityName,
  setCreateDrawerStatus,
  uploadKey,
}) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    if (!hasPermission(PERMISSIONS.BULKUPLOAD.VIEW)) {
      Alert("You do not have permission to Bulk upload.", "warning");
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const validateRecords = (records) => {
    let errors = [];
    if (records.length === 0) {
      errors.push("The file is empty. Please fill in the required data.");
    }
    return errors;
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;

    if (files.length > 0) {
      const file = files[0];
      const fileName = file.name.toLowerCase();

      // Only allow Excel files
      if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        Alert("Please upload Excel files only", "error");
        event.target.value = "";
        return;
      }

      // Parse the Excel file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const records = XLSX.utils.sheet_to_json(worksheet);

        const validationErrors = validateRecords(records);
        if (validationErrors.length > 0) {
          Alert(`Validation failed: ${validationErrors.join(", ")}`, "error");
          event.target.value = "";
          return;
        }

        // If validation passes, create FormData for upload
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await uploadData(uploadKey, formData);
          if (!response.error) {
            Alert(`File uploaded successfully for ${entityName}!`, "success");
            handleRefresh();
          }

          if (response.failedRecords && response.failedRecords.length > 0) {
            const errorMessage = response.failedRecords
              .map((failedRecord) => failedRecord.errorMessage)
              .join(", ");
            Alert(`Upload failed for some records: ${errorMessage}`, "error");
          }
        } catch (error) {
          Alert("Error uploading the file", "error");
          console.error("File upload error:", error);
        } finally {
          event.target.value = "";
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleOpenCreateDrawer = (uploadKey) => {
    const isPlural = uploadKey.toLowerCase().endsWith("s");

    const key = isPlural
      ? uploadKey.toUpperCase()
      : `${uploadKey.toUpperCase()}S`;

    const config = {
      permission: PERMISSIONS[key]?.MODIFY,
      message: `You do not have permission to add new ${uploadKey}${
        isPlural ? "" : "s"
      }.`,
    };

    if (config.permission && !hasPermission(config.permission)) {
      Alert(config.message, "warning");
      return;
    }

    setCreateDrawerStatus(true);
  };

  return (
    <div className="buttons-container">
      <Button
        onClick={() => handleOpenCreateDrawer(uploadKey)}
        startIcon={<Add />}
      >
        Add New
      </Button>
      <IconButton onClick={handleMenuOpen} sx={{ color: "#00ccff" }}>
        <MoreHoriz />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem>
          <label className="DownloadUpload">
            Import Data
            <input
              type="file"
              className="VisuallyHiddenInput"
              multiple
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <i className="fa-solid fa-upload icon-upload"></i>
          </label>
        </MenuItem>
        <MenuItem
          className="DownloadUpload"
          style={{ cursor: "pointer" }}
          onClick={() => downloadTemplate(entityName)}
        >
          <label className="DownloadUpload">
            Download Template{" "}
            <i className="fa-solid fa-download icon-download"></i>
          </label>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ImportComponent;
