import { Button, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React from "react";
import { format } from "date-fns";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const BulkUploadDetails = ({ selectedFile, handleCloseDrawer }) => {
  const parsedErrors = selectedFile?.error
    ? JSON.parse(selectedFile.error)
    : [];

  const columns = [
    {
      field: "RowNumber",
      headerName: "Number",
      flex: 1,
    },
    {
      field: "ErrorMessage",
      headerName: "Error Message",
      flex: 2,
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = selectedFile.url;
    link.download = selectedFile.fileName.endsWith(".xlsx")
      ? selectedFile.fileName
      : `${selectedFile.fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="CreateFlyout">
      {selectedFile && (
        <>
          <div className="CreateFlyoutHeader">
            <h2 style={{ marginLeft: "30px" }}>{selectedFile.fileName}</h2>
            <button onClick={handleCloseDrawer}>
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>
          <div className="FlyoutBody">
            <div className="details">
              <Typography>
                <span className="label">Name:</span>{" "}
                <span onClick={handleDownload} className="fileName">
                  {selectedFile.fileName}.xlsx
                </span>
                <Button onClick={handleDownload} className="downloadButton">
                  <SaveAltIcon />
                </Button>
              </Typography>
              <Typography>
                <span className="label">Requestor:</span>{" "}
                {selectedFile.requestedBy}
              </Typography>
              <Typography>
                <span className="label">Request Date:</span>{" "}
                {formatDate(selectedFile.requestedAt)}
              </Typography>
              <Typography>
                <span className="label">Total count:</span>{" "}
                {selectedFile.totalCount}
              </Typography>
              <Typography>
                <span className="label">Success Count:</span>{" "}
                {selectedFile.successCount}
              </Typography>
              <Typography>
                <span className="label">Error Count:</span>{" "}
                {selectedFile.failedCount}
              </Typography>
            </div>

            {parsedErrors.length > 0 && (
              <StyledDataGrid
                rows={parsedErrors}
                columns={columns}
                getRowId={(row) => row.RowNumber || row.id}
                className="DataGrid"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BulkUploadDetails;
