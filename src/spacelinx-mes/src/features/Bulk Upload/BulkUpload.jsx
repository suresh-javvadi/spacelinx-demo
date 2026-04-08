import React, { useContext, useEffect, useState } from "react";
import "./BulkUpload.css";
import { Card, CardContent, Typography, Drawer, Alert } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { format } from "date-fns";
import { fetchMasterDataCount } from "../../services/dashboardService";
import { downloadTemplate, uploadData } from "../../services/bulkUploadService";
import { fetchBulkUpload } from "../../services/bulkUploadService";
import { Link } from "react-router-dom";
import BulkUploadDetails from "./BulkUploadDetails";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import * as XLSX from "xlsx";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { useUserContext } from "../userContext/UserContext";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const BulkUpload = () => {
  const sections = [
    { title: "Part", uploadKey: "part", countKey: "partsCount" },
    { title: "EBOM", uploadKey: "ebom", countKey: null },
    { title: "Tool", uploadKey: "tool", countKey: "toolsCount" },
    { title: "Machine", uploadKey: "machine", countKey: "machinesCount" },
    { title: "News", uploadKey: "news", countKey: "newsCount" },
    { title: "Location", uploadKey: "location", countKey: "locationCount" },
  ];
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [counts, setCounts] = useState({
    partsCount: null,
    toolsCount: null,
    machinesCount: null,
    newsCount: null,
    locationCount: null,
  });

  const [loadingData, setLoadingData] = useState(true);
  const [bulkUploadData, setBulkUploadData] = useState([]);
  const [errorDrawer, setErrorDrawer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchBulkUploadData = async () => {
    setLoadingData(true);
    try {
      const bulkuploadData = await fetchBulkUpload();
      if (bulkuploadData) {
        bulkuploadData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBulkUploadData(bulkuploadData);
      }
    } catch (error) {
      Alert("Error fetching BulkUpload Data", "error");
      console.error("Error fetching BulkUpload data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchBulkUploadData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          partsCount,
          toolsCount,
          machinesCount,
          newsCount,
          locationCount,
        } = await fetchMasterDataCount();

        setCounts({
          partsCount,
          toolsCount,
          machinesCount,
          newsCount,
          locationCount,
        });

        setLoadingData(false);
      } catch (error) {
        console.error("Error fetching count data", error);
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDrawer = (file) => {
    setSelectedFile(file);
    setErrorDrawer(true);
  };

  const handleCloseDrawer = () => {
    setErrorDrawer(false);
    setSelectedFile(null);
  };
  const validateRecords = (records) => {
    let errors = [];
    if (records.length === 0) {
      errors.push("The file is empty. Please fill in the required data.");
    }
    return errors;
  };
  const handleFileUpload = async (event, uploadKey, title) => {
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
            Alert(`File uploaded successfully for ${title}!`, "success");
            fetchBulkUploadData();
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

  const columns = [
    {
      field: "fileName",
      headerName: "Name",
      flex: 1,
      renderCell: ({ row, value }) => (
        <Link onClick={() => handleOpenDrawer(row)} className="AppHyperLink">
          {value}
        </Link>
      ),
    },
    {
      field: "requestedBy",
      headerName: "Requestor",
      flex: 1,
    },
    {
      field: "requestedAt",
      headerName: "Request Date",
      flex: 1,
      type: "dateTime",
      valueFormatter: ({ value }) => {
        if (!value) return "";
        return format(new Date(value), "dd/MM/yyyy HH:mm:ss");
      },
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      renderCell: ({ value }) => {
        if (!value) return "";
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
  ];

  return (
    <div>
      <p className="BulkUploadHeader">Bulk Upload</p>
      <div className="BulkUploadDetails">
        <div className="TemplateSection">
          <div className="TemplateDetails">
            {sections.map((section) => (
              <Card key={section.title} className="Cards">
                <CardContent className="CardContentCentered">
                  <Typography className="bulkupload-content" variant="h6">
                    {section.title}
                  </Typography>
                  <Typography
                    className="DownloadUpload"
                    onClick={() => downloadTemplate(section.title)}
                  >
                    Download Template
                    <i className="fa-solid fa-download icon-download"></i>
                  </Typography>

                  {hasPermission(PERMISSIONS.BULKUPLOAD.MODIFY) ? (
                    <Typography className="DownloadUpload" component="label">
                      Import Data
                      <i className="fa-solid fa-upload icon-upload"></i>
                      <input
                        className="VisuallyHiddenInput"
                        type="file"
                        multiple
                        onChange={(event) =>
                          handleFileUpload(
                            event,
                            section.uploadKey,
                            section.title
                          )
                        }
                      />
                    </Typography>
                  ) : (
                    <Typography
                      className="DownloadUpload"
                      onClick={() =>
                        Alert(
                          "You do not have permission to upload data.",
                          "warning"
                        )
                      }
                    >
                      Import Data
                      <i className="fa-solid fa-upload icon-upload"></i>
                    </Typography>
                  )}
                  {section.countKey && (
                    <span className="availableCountText">
                      No of available {section.title}:{" "}
                      {loadingData
                        ? "Loading..."
                        : counts[section.countKey] || 0}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="DataGridDiv">
        <StyledDataGrid
          rows={bulkUploadData}
          columns={columns}
          className="DataGrid"
          loading={loadingData}
        />
      </div>

      <Drawer
        anchor="right"
        open={errorDrawer}
        onClose={handleCloseDrawer}
        PaperProps={{ className: "PlatformDrawerStyles" }}
      >
        <BulkUploadDetails
          selectedFile={selectedFile}
          handleCloseDrawer={handleCloseDrawer}
        />
      </Drawer>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default BulkUpload;
