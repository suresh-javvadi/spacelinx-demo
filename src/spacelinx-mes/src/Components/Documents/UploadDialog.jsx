import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import { fetchOptionSetByName } from "../../services/optionSetService";

import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
const UploadDialog = ({
  open,
  onClose,
  onInstantUpload,
  onUrlSubmit,
  acceptedDocTypes,
  acceptedDocTypesLoading,
  fetchAcceptedDocTypes,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [customUrl, setCustomUrl] = useState("");
  const [docTypes, setDocTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileNameError, setFileNameError] = useState("");
  const [docTypeError, setDocTypeError] = useState("");
  const [loadingDocTypes, setLoadingDocTypes] = useState(true);

  useEffect(() => {
    fetchDocTypes();
  }, []);

  const fetchDocTypes = async () => {
    setLoadingDocTypes(true);
    try {
      const response = await fetchOptionSetByName("part_doc_types");
      const parsed = response ? JSON.parse(response.values) : [];
      setDocTypes(parsed);
    } catch (err) {
      Alert("Failed to load document types. File upload is disabled.", "error");
      console.error("Error fetching part_doc_types:", err);
    } finally {
      setLoadingDocTypes(false);
    }
  };

  const validateUrl = (url) => {
    const trimmed = url.trim();

    // Optional field → empty is valid
    if (trimmed === "") return "";

    // Allow user while typing http or https (partial but valid prefixes)
    if (/^https?:?$/i.test(trimmed)) return "";
    if (/^https?:\/?$/i.test(trimmed)) return "";
    if (/^https?:\/\/?$/i.test(trimmed)) return "";

    // Must start with http:// or https:// once fully typed
    if (!/^https?:\/\//i.test(trimmed)) {
      return "URL must start with http:// or https://";
    }

    try {
      const parsed = new URL(trimmed);

      // Must have a valid domain or localhost
      const host = parsed.hostname;
      if (!host.includes(".") && host !== "localhost") {
        return "Invalid domain name";
      }

      // No spaces
      if (/\s/.test(trimmed)) {
        return "URL cannot contain spaces";
      }

      return "";
    } catch {
      return "Invalid URL format";
    }
  };
  const extractFileNameFromUrl = (url) => {
    try {
      const parsed = new URL(url);
      let last = parsed.pathname.replace(/\/$/, "").split("/").pop() || "";

      if (!last) last = parsed.hostname.replace(/^www\./, "");

      return last.split(/[?#]/)[0] || "";
    } catch {
      return "";
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setCustomUrl(url);

    const err = validateUrl(url);
    setUrlError(err);

    if (!err && url.trim()) {
      const extracted = extractFileNameFromUrl(url.trim());
      setFileName(extracted);
      setFileNameError("");
    }
  };

  const handleUrlClick = async () => {
    if (!selectedDocType) {
      setDocTypeError("Document Type is required");
      return;
    }

    if (!fileName.trim()) {
      setFileNameError("File Name is required");
      return;
    }

    const error = validateUrl(customUrl);
    if (error) {
      setUrlError(error);
      Alert(error, "error");
      return;
    }

    setIsUploading(true);

    try {
      let formattedUrl = customUrl.trim();
      if (
        !formattedUrl.startsWith("http://") &&
        !formattedUrl.startsWith("https://")
      ) {
        formattedUrl = `https://${formattedUrl}`;
      }

      await onUrlSubmit(formattedUrl, selectedDocType, fileName);

      // reset fields
      setCustomUrl("");
      setSelectedDocType("");
      setUrlError("");
      setFileName("");
      setFileNameError("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!selectedDocType.trim()) {
      Alert("Please select a document type before uploading files.", "error");
      return;
    }

    setIsUploading(true);
    try {
      await onInstantUpload(files, selectedDocType);
      setSelectedDocType("");
      setFileName("");
      setFileNameError("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    onClose();
    setCustomUrl("");
    setSelectedDocType("");
    setUrlError("");
    setFileName("");
    setFileNameError("");
    setDocTypeError("");
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        disableEscapeKeyDown={isUploading}
      >
        <DialogTitle>Upload Document</DialogTitle>

        <DialogContent>
          <div className="UploadDialogMainContainer">
            {isUploading && (
              <div className="LoadingUploadDialogContainer">
                <CircularProgress size={50} />
                <p
                  style={{
                    marginTop: "16px",
                    color: "#4F46E5",
                    fontWeight: 500,
                  }}
                >
                  Uploading...
                </p>
              </div>
            )}
            <Autocomplete
              fullWidth
              disabled={isUploading}
              options={docTypes.map((item) => item.name)}
              value={selectedDocType || null}
              loading={loadingDocTypes}
              loadingText="Loading Document Types ..."
              onChange={(event, newValue) => {
                setSelectedDocType(newValue || "");
                setDocTypeError("");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <>
                      Select Document Type <span>*</span>
                    </>
                  }
                  error={!!docTypeError}
                  helperText={docTypeError}
                />
              )}
            />

            <TextField
              fullWidth
              label="Enter Document URL"
              value={customUrl}
              onChange={handleUrlChange}
              disabled={isUploading}
              error={!!urlError}
              helperText={
                urlError ? <span>{urlError}</span> : "e.g., https://example.com"
              }
              onBlur={() => {
                if (customUrl.trim()) {
                  const error = validateUrl(customUrl);
                  setUrlError(error);
                }
              }}
            />

            {customUrl.trim() && (
              <TextField
                fullWidth
                label="File Name *"
                variant="outlined"
                value={fileName}
                disabled={isUploading}
                onChange={(e) => {
                  setFileName(e.target.value);
                  if (e.target.value.trim()) setFileNameError("");
                }}
                error={!!fileNameError}
                helperText={fileNameError || ""}
                style={{ marginTop: "12px" }}
              />
            )}
            {!customUrl.trim() && (
              <>
                <div className="OrText">OR</div>

                <Button
                  component="label"
                  startIcon={<Upload />}
                  className="ChooseFilesButton"
                  onClick={(e) => {
                    if (!selectedDocType) {
                      setDocTypeError("Document Type is required");
                      e.preventDefault();
                      return;
                    }

                    if (acceptedDocTypesLoading) {
                      Alert(
                        "Loading allowed file types… please wait.",
                        "warning"
                      );
                      e.preventDefault();
                      return;
                    }

                    if (acceptedDocTypes.length === 0) {
                      fetchAcceptedDocTypes();
                    }
                  }}
                  disabled={
                    acceptedDocTypesLoading || acceptedDocTypes.length === 0
                  }
                >
                  Choose Files to Upload
                  {/* FILE INPUT */}
                  <input
                    type="file"
                    id="file-upload-input"
                    multiple
                    hidden
                    accept={acceptedDocTypes.join(",")}
                    disabled={
                      acceptedDocTypesLoading || acceptedDocTypes.length === 0
                    }
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 0) {
                        await handleFileUpload(files);
                      }
                      e.target.value = "";
                    }}
                  />
                </Button>
              </>
            )}
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>

          {customUrl.trim() && (
            <Button
              onClick={handleUrlClick}
              disabled={isUploading || !!urlError || !customUrl.trim()}
            >
              Submit
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </>
  );
};

export default UploadDialog;
