import React, { useContext, useState, useRef } from "react";
import { usePartDetailsDrawer } from "../parts/PartDetailsContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { IconButton, Tooltip } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createEcoPart } from "../../../services/ecoPartService";
import { createDocumentWithEntity } from "../../../services/documentsService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const ECOErrorDisplay = ({
  handleCloseClick,
  errorData,
  selectedEco,
  fetchEcoPartsData,
}) => {
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const { Alert } = useContext(AlertsContext);
  const [addedParts, setAddedParts] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const fileInputRef = useRef(null);
  const [currentPartToUpload, setCurrentPartToUpload] = useState(null);

  const [localMissingDocs, setLocalMissingDocs] = useState(
    Array.from(
      new Map(
        [
          ...(errorData?.partsWithNoDocuments || []),
          ...(errorData?.bomPartsWithNoDocuments || []),
        ].map((item) => [item.id, item])
      ).values()
    )
  );

  const addPartToECO = async (id) => {
    setLoadingData(true);
    const payload = {
      partId: id,
      status: "Release",
      description: "",
    };

    try {
      const response = await createEcoPart(selectedEco?.id, payload);
      fetchEcoPartsData();
      return { success: true };
    } catch (error) {
      console.error("Error adding part to ECO:", error);
      Alert("Failed to add part to ECO.", "error");
      return { success: false };
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !currentPartToUpload) {
      return;
    }

    setLoadingData(true);
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`documentFiles[${index}].documentFile`, file);
      formData.append(
        `documentFiles[${index}].entityId`,
        currentPartToUpload.id
      );
      formData.append(`documentFiles[${index}].entityType`, "Part");
      formData.append(`documentFiles[${index}].documentType`, file.type);
    });

    try {
      await createDocumentWithEntity(formData);
      const partNumber = currentPartToUpload.partNumber;
      if (files.length === 1) {
        Alert(`Uploaded 1 document for part ${partNumber}.`, "success");
      } else {
        Alert(
          `Uploaded ${files.length} documents for part ${partNumber}.`,
          "success"
        );
      }
      setLocalMissingDocs((prevDocs) =>
        prevDocs.map((part) =>
          part.id === currentPartToUpload.id
            ? { ...part, isUploaded: true }
            : part
        )
      );
    } catch (error) {
      console.error("Error uploading documents:", error);
      Alert("Failed to upload documents.", "error");
    } finally {
      setLoadingData(false);
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = (part) => {
    setCurrentPartToUpload(part);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const commonColumns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 0.5,
      renderCell: ({ row }) => (
        <div
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            if (row) {
              openPartDetailsDrawer({
                partNumberSuffix: row?.partNumberSuffix,
              });
            }
          }}
        >
          {row.partNumber || "---"}
        </div>
      ),
      valueGetter: (_value, row) => row.childPart?.partNumber || "---",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
      valueGetter: (_value, row) => (row.status === "Draft" ? "" : row.status),
    },
    {
      field: "makeBuy",
      headerName: "Make/Buy",
      flex: 0.5,
      valueGetter: (_value, row) => {
        const val = row?.makeBuy;
        return val == null ? "" : val ? "Buy" : "Make";
      },
    },
  ];

  const missingDocsColumns = [
    ...commonColumns,
    {
      field: "action",
      headerName: "Doc's",
      flex: 0.4,
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => {
        const isUploaded = row.isUploaded;
        return isUploaded ? (
          <button className="DimButton" disabled>
            <ion-icon name="checkmark-done-circle-outline"></ion-icon>Done
          </button>
        ) : (
          <button
            className="AddOrUpdateButton"
            onClick={() => handleUploadClick(row)}
          >
            <ion-icon name="cloud-upload-outline"></ion-icon> Upload
          </button>
        );
      },
    },
  ];

  const missingBOMColumns = [
    ...commonColumns,
    {
      field: "action",
      headerName: "",
      flex: 0.2,
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => {
        const isAddedToECO = addedParts.includes(row.id);

        return (
          <Tooltip title={isAddedToECO ? "Already added to ECO" : "Add to ECO"}>
            <span>
              <IconButton
                size="small"
                disabled={isAddedToECO}
                onClick={async (e) => {
                  e.stopPropagation();
                  const res = await addPartToECO(row.id);

                  if (res.success) {
                    setAddedParts((prev) => [...prev, row.id]);
                  } else {
                    Alert("Failed to update missing part.", "error");
                  }
                }}
              >
                {isAddedToECO ? (
                  <CheckCircleIcon sx={{ color: "#009cbb" }} />
                ) : (
                  <AddCircleOutlineIcon sx={{ color: "#00ccff" }} />
                )}
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  const renderGrid = (
    title,
    description,
    rows,
    useAddButton = false,
    loading
  ) =>
    rows?.length > 0 && (
      <div className="ECOErrorDisplayDataGridDiv">
        <div className="ECOErrorDisplayHeaderDiv">
          <p className="ECOErrorHeader"> {title} </p>{" "}
          <p className="ECOErrorDes">{description}</p>
        </div>

        <div className="ECOErrorDisplayGrid">
          <StyledDataGrid
            rows={rows}
            columns={useAddButton ? missingBOMColumns : missingDocsColumns}
            getRowId={(row) => row.id}
            disableRowSelectionOnClick
            disableColumnMenu
            loading={loading}
            rowHeight={40}
          />
        </div>
      </div>
    );

  return (
    <div className="ECOErrorDisplay">
      <div className="ECOErrorDisplayHeader">
        <h2>ECO Errors</h2>
        <button className="CloseButton" onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      <div className="ECOErrorGridContainer">
        {renderGrid(
          "Documents Missing in below Parts",
          "(Ensure each part has at least one document)",
          localMissingDocs,
          false,
          loadingData
        )}
        {renderGrid(
          "Below BOM Parts are still in Draft State",
          "(Release them or add them to this ECO)",
          errorData?.nonReleasedMissingParts,
          true,
          loadingData
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        style={{ display: "none" }}
        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
      />

      <div className="AlertMessages">
        {" "}
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default ECOErrorDisplay;
