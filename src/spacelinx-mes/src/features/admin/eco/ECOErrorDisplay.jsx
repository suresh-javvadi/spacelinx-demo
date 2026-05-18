import React, { useContext, useState, useEffect, useRef } from "react";
import { usePartDetailsDrawer } from "../parts/PartDetailsContext";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { IconButton, Tooltip } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createEcoPart } from "../../../services/ecoPartService";
import { createDocumentWithEntity } from "../../../services/documentsService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import UploadDialog from "../../../Components/Documents/UploadDialog";
import { fetchOptionSetByName } from "../../../services/optionSetService";

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
  const [currentPartToUpload, setCurrentPartToUpload] = useState(null);
  const currentPartRef = useRef(null);
  const [dialogUploadOpen, setDialogUploadOpen] = useState(false);
  const [acceptedDocTypes, setAcceptedDocTypes] = useState([]);
  const [acceptedDocTypesLoading, setAcceptedDocTypesLoading] = useState(true);

  const [localMissingDocs, setLocalMissingDocs] = useState(
    Array.from(
      new Map(
        [
          ...(errorData?.partsWithNoDocuments || []),
          ...(errorData?.bomPartsWithNoDocuments || []),
        ].map((item) => [item.id, item]),
      ).values(),
    ),
  );

  useEffect(() => {
    fetchAcceptedDocTypes();
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

  const handleUploadDocuments = async ({
    files = [],
    url = null,
    documentType = "",
    fileName = "",
  }) => {
    const part = currentPartRef.current;
    if (!part) throw new Error("No part selected for upload");

    const formData = new FormData();

    const appendCommonFields = (index) => {
      formData.append(`documentFiles[${index}].entityId`, part.id);
      formData.append(`documentFiles[${index}].entityType`, "Part");
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

  const markPartAsUploaded = () => {
    const part = currentPartRef.current;
    if (!part) return;
    setLocalMissingDocs((prevDocs) =>
      prevDocs.map((p) => (p.id === part.id ? { ...p, isUploaded: true } : p)),
    );
  };

  const handleInstantUpload = async (files, documentType) => {
    setLoadingData(true);
    try {
      await handleUploadDocuments({ files, documentType });
      const partNumber = currentPartRef.current?.partNumber;
      if (files.length === 1) {
        Alert(`Uploaded 1 document for part ${partNumber}.`, "success");
      } else {
        Alert(
          `Uploaded ${files.length} documents for part ${partNumber}.`,
          "success",
        );
      }
      markPartAsUploaded();
      setDialogUploadOpen(false);
    } catch (error) {
      console.error("Error uploading documents:", error);
      Alert("Failed to upload documents.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleUrlSubmit = async (url, documentType, fileName) => {
    setLoadingData(true);
    try {
      await handleUploadDocuments({ url, documentType, fileName });
      const partNumber = currentPartRef.current?.partNumber;
      Alert(`Uploaded URL document for part ${partNumber}.`, "success");
      markPartAsUploaded();
      setDialogUploadOpen(false);
    } catch (error) {
      console.error("Error uploading URL document:", error);
      Alert("Failed to upload URL document.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleUploadClick = (part) => {
    setCurrentPartToUpload(part);
    currentPartRef.current = part;
    setDialogUploadOpen(true);
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
    loading,
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
          loadingData,
        )}
        {renderGrid(
          "Below BOM Parts are still in Draft State",
          "(Release them or add them to this ECO)",
          errorData?.nonReleasedMissingParts,
          true,
          loadingData,
        )}
      </div>

      <UploadDialog
        open={dialogUploadOpen}
        onClose={() => setDialogUploadOpen(false)}
        onInstantUpload={handleInstantUpload}
        onUrlSubmit={handleUrlSubmit}
        acceptedDocTypes={acceptedDocTypes}
        acceptedDocTypesLoading={acceptedDocTypesLoading}
        fetchAcceptedDocTypes={fetchAcceptedDocTypes}
      />

      <div className="AlertMessages">
        {" "}
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default ECOErrorDisplay;
