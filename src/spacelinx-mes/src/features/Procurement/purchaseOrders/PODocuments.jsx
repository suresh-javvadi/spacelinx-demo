import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { Visibility, Close, Delete } from "@mui/icons-material";
import "../../../Components/Documents/Documents.css";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import CsvPreview from "../../../Components/Documents/Previews/CsvPreview";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import PreviewNotAvailable from "../../../Components/Documents/Previews/PreviewNotAvailable";
import { ClipLoader } from "react-spinners";
import UploadDialog from "../../../Components/Documents/UploadDialog";

const PODocuments = ({
  onDocumentsChange,
  canUpload = true,
  canDelete = true,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [newDocuments, setNewDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [visibleRows, setVisibleRows] = useState(100);
  const observer = useRef();
  const [acceptedDocTypes, setAcceptedDocTypes] = useState([]);
  const [acceptedDocTypesLoading, setAcceptedDocTypesLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const blobUrlRef = useRef(null);

  useEffect(() => {
    fetchAcceptedDocTypes();
  }, []);

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
      setAcceptedDocTypes(types.length > 0 ? types : defaultDocType);
    } catch (error) {
      console.error("Error fetching accepted document types:", error);
    } finally {
      setAcceptedDocTypesLoading(false);
    }
  };
  const handleInstantUpload = async (files, docType) => {
    const formatted = files.map((file) => ({
      externalUrl: null,
      fileName: file.name,
      documentType: docType,
      documentFile: file,
    }));

    setNewDocuments((prev) => [...prev, ...formatted]);
    setUploadDialogOpen(false);
  };

  const handleUrlSubmit = (url, docType, fileName) => {
    const obj = {
      externalUrl: url,
      fileName: fileName,
      documentType: docType,
      documentFile: null,
    };

    setNewDocuments((prev) => [...prev, obj]);
    setUploadDialogOpen(false);
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

  const handleRemoveDocument = (indexToRemove) => {
    setNewDocuments((prevDocuments) =>
      prevDocuments.filter((_, index) => index !== indexToRemove)
    );
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

    try {
      let previewData = null;

      if (doc instanceof File) {
        const blobUrl = URL.createObjectURL(doc);
        blobUrlRef.current = blobUrl;
        previewData = {
          fileName: doc.name,
          fileExtension: "." + doc.name.split(".").pop(),
          filePath: blobUrl,
          isBlob: true,
        };
        setPreviewDoc(previewData);
      } else {
        previewData = {
          fileName: doc.fileName,
          fileExtension: doc.fileExtension,
          filePath: doc.filePath,
          isBlob: false,
        };
        setPreviewDoc(previewData);

        if (previewData.fileExtension === ".csv") {
          await fetchCsvContent(previewData.filePath);
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
        previewDoc.fileExtension
      )
    ) {
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            previewDoc.filePath
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
            previewDoc.filePath
          )}&embedded=true`}
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

  useEffect(() => {
    if (onDocumentsChange) {
      onDocumentsChange(newDocuments);
    }
  }, [newDocuments, onDocumentsChange]);

  return (
    <div className="DocContainer">
      <div className="DocContent">
        {canUpload && (
          <div className="DocUploadContainer">
            <div className="DocUpload">
              <h3>Upload New Documents</h3>
              <div className="SelectedFilesContainer">
                <Button
                  onClick={() => {
                    if (!canUpload) {
                      e.preventDefault();
                      Alert(
                        `You do not have permission to modify documents`,
                        "warning"
                      );
                    }

                    setUploadDialogOpen(true);
                  }}
                >
                  Upload
                </Button>
              </div>
            </div>

            <div className="UploadedDocs">
              {newDocuments.length > 0 ? (
                <div className="SelectedDocsHeader">
                  <h4 className="SelectedDocsTitle">Selected Documents:</h4>
                  <p className="SelectedDocsCount">
                    {newDocuments?.length || 0} file(s) selected
                  </p>
                </div>
              ) : (
                ""
              )}

              <div className="UploadedDocsList">
                {newDocuments && newDocuments.length > 0 && (
                  <table className="UploadedDocsTable">
                    <tbody>
                      {newDocuments.map((doc, index) => {
                        const displayName = doc.title || doc.fileName || "---";
                        const isExternal = !!doc.externalUrl;

                        return (
                          <tr key={index} className="ExistingDocsRow">
                            <td className="DocSnoCell">{index + 1}</td>
                            <td className="DocNameCell">
                              <div className="DocumentDetailsContainer">
                                {isExternal ? (
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
                                  <span className="DocLabel">
                                    {displayName}
                                  </span>
                                )}

                                <span className="DocLabel2">
                                  <span className="DocLabel ">
                                    Document Type :
                                  </span>
                                  {doc.documentType || "---"}
                                </span>
                              </div>
                            </td>

                            <td className="DocActionCell">
                              <IconButton
                                className="DocumentVisibleIconOptions"
                                onClick={() =>
                                  isExternal
                                    ? window.open(doc.externalUrl, "_blank")
                                    : handleViewDocument(doc)
                                }
                              >
                                <Visibility />
                              </IconButton>

                              <IconButton
                                className="DocumentVisibleIconOptions"
                                onClick={() => handleRemoveDocument(index)}
                                disabled={!canDelete}
                              >
                                <Delete />
                              </IconButton>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <UploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onInstantUpload={handleInstantUpload}
        onUrlSubmit={handleUrlSubmit}
        acceptedDocTypes={acceptedDocTypes}
        acceptedDocTypesLoading={acceptedDocTypesLoading}
        fetchAcceptedDocTypes={fetchAcceptedDocTypes}
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
              <ClipLoader color="#4F46E5" size={30} />
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

export default PODocuments;
