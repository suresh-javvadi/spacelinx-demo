import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  fetchECOPartsDocuments,
  fetchRequisitionPartsDocuments,
  fetchPOPartsDocuments,
} from "../../services/documentsService";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { StyledDataGrid } from "../StyledDataGrid/StyledDataGrid";
import { Button, IconButton } from "@mui/material";
import { Visibility, Download } from "@mui/icons-material";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import { usePartDetailsDrawer } from "../../features/admin/parts/PartDetailsContext";
import { DownloadDocsAsZip } from "../../services/documentsService";
import { SelectAll, Deselect } from "@mui/icons-material";

const EntityDocuments = ({
  entityType,
  entityId,
  entityNumber,
  tittle,
  handleViewDocument,
  handleDocDownload,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [docsData, setDocsData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState({
    type: "include",
    ids: new Set(),
  });
  const hasSelection = rowSelectionModel.ids.size > 0;
  const isAllSelected =
    docsData.length > 0 && rowSelectionModel.ids.size === docsData.length;

  const handleSelectAll = useCallback(() => {
    const allIds = docsData.map((row) => row.id);
    setRowSelectionModel({
      type: "include",
      ids: new Set(allIds),
    });
  }, [docsData]);

  const handleClearAll = useCallback(() => {
    setRowSelectionModel({
      type: "include",
      ids: new Set(),
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      handleClearAll();
    } else {
      handleSelectAll();
    }
  }, [isAllSelected, handleSelectAll, handleClearAll]);

  const handleDownloadSelectedDocs = async () => {
    const selectedIds = Array.from(rowSelectionModel.ids);

    if (selectedIds.length === 0) {
      Alert("Please select at least one document", "warning");
      return;
    }

    setLoadingData(true);

    try {
      const data = await DownloadDocsAsZip(selectedIds);

      const blob =
        data instanceof Blob
          ? data
          : new Blob([data], { type: "application/zip" });
      const today = new Date().toISOString().split("T")[0];
      const fileName = `${entityNumber}_Documents_${today}.zip`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Alert("Documents downloaded successfully!", "success");
    } catch (error) {
      console.error("ZIP download failed:", error);
      Alert("Couldn't download documents!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleRowSelectionChange = useCallback((newModel) => {
    setRowSelectionModel(newModel);
  }, []);

  useEffect(() => {
    if (!entityType) return;

    const fetchDocuments = async () => {
      setLoadingData(true);

      try {
        switch (entityType) {
          case "ECO": {
            const data = await fetchECOPartsDocuments(entityId);
            setDocsData(data || []);
            break;
          }

          case "Purchase Orders": {
            const data = await fetchPOPartsDocuments(entityId);
            setDocsData(data || []);
            break;
          }

          case "Requisition": {
            const data = await fetchRequisitionPartsDocuments(entityId);
            setDocsData(data || []);
            break;
          }

          default:
            console.warn("Unknown entityType:", entityType);
        }
      } catch (error) {
        Alert("Error fetching Part Level data", "error");
        console.error("Failed to load part levels:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDocuments();
  }, [entityType, Alert]);

  useEffect(() => {
    if (docsData.length > 0) {
      handleSelectAll();
    }
  }, [docsData]);

  const columns = [
    {
      field: "serialNumber",
      headerName: "Item No.",
      flex: 0.15,
      renderCell: (params) =>
        params.api.getRowIndexRelativeToVisibleRows(params.id) + 1,
    },
    {
      field: "title",
      headerName: "Tittle",
      flex: 1,
    },
    {
      field: "documentType",
      headerName: "Document Type",
      flex: 1,
    },
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
      renderCell: ({ row }) => (
        <div
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            if (row) {
              openPartDetailsDrawer({
                partNumberSuffix: row?.partNumberSuffix,
                partNumber: row?.partNumber,
              });
            }
          }}
        >
          {row?.partNumber}
        </div>
      ),
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "Uploaded On",
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleString() : "-",
    },
    {
      field: "action",
      headerName: "Actions",
      sortable: false,
      renderCell: (params) => (
        <div className="DocActionCell">
          <IconButton
            className="EntityDocsAction view"
            onClick={() =>
              params.row.documentStorageType === "external_url"
                ? window.open(params.row.externalUrl, "_blank")
                : handleViewDocument(params.row)
            }
          >
            <Visibility />
          </IconButton>
          <IconButton
            className="EntityDocsAction download"
            onClick={() =>
              handleDocDownload(params.row?.filePath, params.row?.fileName)
            }
          >
            <Download />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="EntityDocumentsContainer">
      <div className="EntityDocsHeader">
        <h3 className="EntityDocsTittle">{tittle}:</h3>
        <div className="EntityDocsActions">
          {/* <Button
            startIcon={isAllSelected ? <Deselect /> : <SelectAll />}
            disabled={docsData.length === 0}
            onClick={handleToggleSelectAll}
          >
            {isAllSelected ? "Unselect All" : "Select All"}
          </Button> */}

          <Button
            startIcon={<Download />}
            disabled={docsData.length === 0 || loadingData}
            onClick={handleDownloadSelectedDocs}
          >
            Download as ZIP
          </Button>
        </div>
      </div>

      <StyledDataGrid
        rows={docsData}
        columns={columns}
        loading={loadingData}
        getRowId={(row) => row.id}
        autoHeight
        checkboxSelection
        disableRowSelectionOnClick
        pageSizeOptions={[5, 10, 20]}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={handleRowSelectionChange}
        sx={{
          "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-checkboxInput": {
            display: "none",
          },
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 10, page: 0 },
          },
        }}
      />

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EntityDocuments;
