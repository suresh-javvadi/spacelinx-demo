import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { useUserContext } from "../../features/userContext/UserContext";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import {
  fetchDocumentsByEntityIdWithUsers,
  deleteDocument,
  createDocumentWithEntity,
} from "../../services/documentsService";
import {
  Delete,
  Visibility,
  Download,
  Close,
  MoreHoriz,
} from "@mui/icons-material";
import {
  showAlert,
  showConfirmation,
} from "../ConfirmationDialog/ConfirmationDialog";
import "./Documents.css";
import { ClipLoader } from "react-spinners";
import { fetchOptionSetByName } from "../../services/optionSetService";
import PreviewNotAvailable from "./Previews/PreviewNotAvailable";
import CsvPreview from "./Previews/CsvPreview";
import UploadDialog from "./UploadDialog";
import EntityDocuments from "./EntityDocuments";

const Documents = ({
  entityId,
  entityType,
  entityNumber,
  canDelete,
  canEdit,
  isDraft = true,
  tittle,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { userData, isSuperAdmin } = useUserContext();
  const currentUserEmail = userData?.email;
  const [selectedDoc, setSelectedDoc] = useState(null);
  const isCreator =
    selectedDoc?.createdBy?.toLowerCase() === currentUserEmail?.toLowerCase();
  const isDeleteAllowed = isSuperAdmin || canDelete || (isCreator && isDraft);
  const [loadingData, setLoadingData] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [visibleRows, setVisibleRows] = useState(100);
  const [acceptedDocTypes, setAcceptedDocTypes] = useState([]);
  const [acceptedDocTypesLoading, setAcceptedDocTypesLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dialogUploadOpen, setDialogUploadOpen] = useState(false);
  const allowedTypes = ["eco", "purchase orders", "requisition"];

  const observer = useRef();
  const blobUrlRef = useRef(null);

  useEffect(() => {
    fetchAcceptedDocTypes();
  }, []);

  useEffect(() => {
    if (entityId) {
      fetchDocumentsForEntity();
    }
  }, [entityId]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const fetchAcceptedDocTypes = async () => {
    setAcceptedDocTypesLoading(true);
    try {
      const data = await fetchOptionSetByName("accepted_doc_types");
      const parsedData = data?.values ? JSON.parse(data.values) : [];
      const types = parsedData.map((item) => item.type);
      setAcceptedDocTypes(types);
    } catch (error) {
      Alert(
        "Failed to fetch accepted document types. Please try again.",
        "error",
      );
      console.error("Error fetching accepted document types:", error);
    } finally {
      setAcceptedDocTypesLoading(false);
    }
  };

  const fetchDocumentsForEntity = async () => {
    setLoadingData(true);
    try {
      const data = await fetchDocumentsByEntityIdWithUsers(entityId);
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setExistingDocuments(sortedData);
    } catch (error) {
      console.error(error);
      Alert("Failed to fetch documents", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleInstantUpload = async (files, documentType) => {
    try {
      await handleUploadDocuments({ files, documentType });
      Alert("Files uploaded successfully!", "success");
      setDialogUploadOpen(false);
      setLoadingData(true);
      await fetchDocumentsForEntity();
    } catch (error) {
      Alert("Failed to upload files", "error");
      console.error("Upload failed:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUrlSubmit = async (url, documentType, fileName) => {
    try {
      await handleUploadDocuments({ url, documentType, fileName });
      Alert("URL uploaded successfully!", "success");
      setDialogUploadOpen(false);
      setLoadingData(true);
      await fetchDocumentsForEntity();
    } catch (error) {
      Alert("Failed to upload URL", "error");
      console.error("URL upload failed:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUploadDocuments = async ({
    files = [],
    url = null,
    documentType = "",
    fileName = "",
  }) => {
    const formData = new FormData();

    const appendCommonFields = (index) => {
      formData.append(`documentFiles[${index}].entityId`, entityId);
      formData.append(`documentFiles[${index}].entityType`, entityType);
      formData.append(`documentFiles[${index}].documentType`, documentType);
    };

    if (url) {
      appendCommonFields(0);
      formData.append(`documentFiles[0].externalUrl`, url);
      formData.append(`documentFiles[0].fileName`, fileName);
      return await createDocumentWithEntity(formData);
    }
    if (!files || files.length === 0) return;

    files.forEach((file, index) => {
      appendCommonFields(index);
      formData.append(`documentFiles[${index}].documentFile`, file);
    });

    return await createDocumentWithEntity(formData);
  };

  const handleDeleteDocument = async (id) => {
    const isConfirmed = await showConfirmation(
      "Are you sure?",
      "You won't be able to undo this!",
    );

    if (isConfirmed) {
      setLoadingData(true);
      try {
        await deleteDocument(id);
        await fetchDocumentsForEntity();
        showAlert("success", "Deleted!", "Document deleted successfully.");
      } catch (error) {
        showAlert("error", "Error", "Failed to delete document.");
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    }
  };

  const handleDocDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "downloaded-file";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      Alert("Failed to download file", "error");
    }
  };

  const parseCsv = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(",").map((header) => header.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((value) => value.trim());
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });
      return rowData;
    });

    return { headers, rows };
  };

  const fetchCsvContent = async (filePath) => {
    try {
      const response = await fetch(filePath);
      const text = await response.text();
      const parsedData = parseCsv(text);
      setCsvData(parsedData);
      setVisibleRows(100);
    } catch (error) {
      console.error("Error fetching CSV:", error);
      Alert("Failed to load CSV file", "error");
      setCsvData(null);
    }
  };

  const handleViewDocument = async (doc) => {
    setPreviewLoading(true);
    setDialogOpen(true);

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    const isFile = doc instanceof File;

    try {
      if (isFile) {
        const blobUrl = URL.createObjectURL(doc);
        blobUrlRef.current = blobUrl;

        const previewData = {
          fileName: doc.name,
          fileExtension: "." + doc.name.split(".").pop().toLowerCase(),
          filePath: blobUrl,
          isBlob: true,
        };
        setPreviewDoc(previewData);

        if (previewData.fileExtension === ".csv") {
          await fetchCsvContent(previewData.filePath);
        }
      } else {
        // Normalize extension to lowercase so previews work regardless
        // of how the server stored it (e.g. ".PDF", ".Pdf", ".pdf")
        const normalizedDoc = {
          ...doc,
          fileExtension: doc.fileExtension?.toLowerCase(),
        };
        setPreviewDoc(normalizedDoc);
        if (normalizedDoc.fileExtension === ".csv") {
          await fetchCsvContent(normalizedDoc.filePath);
        }
      }
    } catch (error) {
      console.error("Error viewing document:", error);
      Alert("Failed to load document", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCsvData(null);
    setVisibleRows(100);

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const lastRowRef = (node) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleRows((prev) => prev + 50);
      }
    });
    if (node) observer.current.observe(node);
  };

  const handleMenuOpen = (event, doc) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const renderDocumentPreview = () => {
    if (!previewDoc) return <p>No preview available.</p>;

    if (previewDoc.fileExtension === ".csv") {
      return (
        <CsvPreview
          csvData={csvData}
          visibleRows={visibleRows}
          lastRowRef={lastRowRef}
        />
      );
    }

    if (
      [".docx", ".doc", ".xls", ".xlsx", ".ppt", ".pptx"].includes(
        previewDoc.fileExtension,
      )
    ) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            previewDoc.filePath,
          )}`}
          className="DocumentPreview"
          title="Document Preview"
        />
      );
    }

    if (previewDoc.fileExtension === ".pdf") {
      return (
        <iframe
          src={previewDoc.filePath}
          className="DocumentPreview"
          title="PDF Preview"
          type="application/pdf"
        />
      );
    }

    if (previewDoc.fileExtension === ".txt") {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(
            previewDoc.filePath,
          )}&embedded=true`}
          className="DocumentPreview"
          title="Document Preview"
        />
      );
    }

    if ([".jpg", ".jpeg", ".png", ".gif"].includes(previewDoc.fileExtension)) {
      return (
        <img
          src={previewDoc.filePath}
          alt="Document Preview"
          className="ImagePreview"
        />
      );
    }

    return (
      <PreviewNotAvailable
        fileName={previewDoc.fileName}
        fileExtension={previewDoc.fileExtension}
        onDownload={() =>
          handleDocDownload(previewDoc?.filePath, previewDoc?.fileName)
        }
      />
    );
  };

  return (
    <div className="DocContainer">
      <div className="DocContent">
        <div className="DocUploadContainer">
          <div className="DocUpload">
            <h3>Upload New Documents</h3>
            <div className="SelectedFilesContainer">
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => {
                  if (!isDraft) {
                    e.preventDefault();
                    Alert(
                      `Only ${entityType} in Draft status can be modified`,
                      "warning",
                    );
                    return;
                  }
                  if (!canEdit) {
                    e.preventDefault();
                    Alert(
                      `You do not have permission to modify ${entityType} documents`,
                      "warning",
                    );
                    return;
                  }
                  setDialogUploadOpen(true);
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>

        <div className="DocExistingContainer">
          <h3>Documents:</h3>
          {loadingData ? (
            <div className="LoaderContainer">
              <ClipLoader
                color={"#009cbb"}
                loading={loadingData}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          ) : (
            <div className="ExistingDocsList">
              {existingDocuments.length > 0 ? (
                <div className="Existingdiv">
                  <div className="DocumentContainer">
                    {existingDocuments.map((doc, index) => {
                      const displayName = doc.title || doc.fileName || "---";

                      return (
                        <div key={doc.id || index} className="ExistingDocsRow">
                          <div className="DocSnoCell">{index + 1}</div>
                          <div className="DocNameCell">
                            <div className="DocumentDetailsContainer">
                              {doc.documentStorageType === "external_url" &&
                              doc.externalUrl ? (
                                <div className="URLContainer">
                                  <Tooltip
                                    title={doc.externalUrl}
                                    placement="top"
                                    arrow
                                  >
                                    <a
                                      href={doc.externalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ExternalURL"
                                    >
                                      {displayName}
                                    </a>
                                  </Tooltip>
                                </div>
                              ) : (
                                <span className="DocLabel">{displayName}</span>
                              )}
                              <span className="DocLabel2">
                                <span className="DocLabel ">Created By :</span>
                                {doc.createdByFullName || "---"}
                              </span>

                              <span className="DocLabel2">
                                <Tooltip
                                  title={"Document Type"}
                                  placement="top"
                                  arrow
                                >
                                  <span className="DocType">
                                    {doc.documentType || "---"}
                                  </span>
                                </Tooltip>
                              </span>

                              <span className="DocLabel2">
                                <span className="DocLabel ">Uploaded On :</span>
                                {doc.createdAt
                                  ? new Date(doc.createdAt).toLocaleString()
                                  : "---"}
                              </span>
                            </div>
                          </div>

                          <div className="DocActionCell">
                            <IconButton
                              className="DocumentVisibleIconOptions"
                              onClick={() =>
                                doc.documentStorageType === "external_url"
                                  ? window.open(doc.externalUrl, "_blank")
                                  : handleViewDocument(doc)
                              }
                            >
                              <Visibility />
                            </IconButton>

                            <IconButton
                              className="DocumentVisibleIconOptions"
                              onClick={(e) => handleMenuOpen(e, doc)}
                            >
                              <MoreHoriz />
                            </IconButton>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p>No existing documents found.</p>
              )}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  disabled={selectedDoc?.documentStorageType === "external_url"}
                  onClick={() => {
                    handleDocDownload(
                      selectedDoc?.filePath,
                      selectedDoc?.fileName,
                    );
                    handleMenuClose();
                  }}
                >
                  <Download className=" DocumentDownloadIcon" /> Download
                </MenuItem>
                <MenuItem
                  onClick={
                    isDeleteAllowed
                      ? () => {
                          handleDeleteDocument(selectedDoc?.id);
                          handleMenuClose();
                        }
                      : undefined
                  }
                  disabled={!isDeleteAllowed}
                  className={!isDeleteAllowed ? "IonIconDisabled" : undefined}
                >
                  <Delete className="DocumentDeleteIcon" /> Delete
                </MenuItem>
              </Menu>
              <div className="EntityDocs">
                {allowedTypes.includes(entityType?.toLowerCase()) && (
                  <EntityDocuments
                    entityId={entityId}
                    entityType={entityType}
                    entityNumber={entityNumber}
                    tittle={tittle}
                    handleViewDocument={handleViewDocument}
                    handleDocDownload={handleDocDownload}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <UploadDialog
        open={dialogUploadOpen}
        onClose={() => setDialogUploadOpen(false)}
        onInstantUpload={handleInstantUpload}
        acceptedDocTypes={acceptedDocTypes}
        acceptedDocTypesLoading={acceptedDocTypesLoading}
        fetchAcceptedDocTypes={fetchAcceptedDocTypes}
        onUrlSubmit={handleUrlSubmit}
        Alert={Alert}
      />

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="none"
        fullScreen
        aria-labelledby="document-preview-dialog-title"
      >
        <DialogTitle id="document-preview-dialog-title">
          <div className="DocumentDialogHeader">
            {previewDoc && `Preview: ${previewDoc.fileName}`}
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <Close />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent dividers className="PreviewContentContainer">
          {previewLoading ? (
            <div className="PreviewLoaderContainer">
              <ClipLoader color="#009cbb" size={30} />
              <p>Loading preview...</p>
            </div>
          ) : (
            renderDocumentPreview()
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          {previewDoc && (
            <Button
              onClick={() =>
                handleDocDownload(previewDoc?.filePath, previewDoc?.fileName)
              }
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default Documents;
