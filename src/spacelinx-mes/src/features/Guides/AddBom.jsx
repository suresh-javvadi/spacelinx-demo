import React, { useContext, useEffect, useState } from "react";
import {
  fetchGuideMBomWithGuideId,
  fetchGuidesWithNumber,
  fetchPartsHavingGuide,
} from "../../services/guideService";
import { Tooltip } from "@mui/material";
import { createNewEBom, updateEBom } from "../../services/childPartService";
import { AlertsContext } from "../AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import { Link, useNavigate } from "react-router-dom";
import { fetchGuideEquipmentWithGuideId } from "../../services/guideEquipmentService";
import { fetchPartsLookUp } from "../../services/partService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const AddBom = ({ guideId, guidePartId, setAllDataIsFetched, isReadOnly }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [loadingData, setLoadingData] = useState(true);
  const [mbomData, setMbomData] = useState([]);
  const navigateTo = useNavigate();
  const [guideEquipmentData, setGuideEquipmentData] = useState([]);
  const [partsData, setPartsData] = useState([]);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [eBOMQuantity, setEBOMQuantity] = useState(0);
  const [ebomId, setEBomId] = useState("");
  const [mbomDataLoading, setMbomDataLoading] = useState(true);

  useEffect(() => {
    if (guideId) {
      fetchMbomData();
      fetchGuideEquipment();
    }
  }, [guideId]);

  const fetchMbomData = async () => {
    setLoadingData(true);
    setAllDataIsFetched(true);
    try {
      const data = await fetchGuideMBomWithGuideId(guideId);
      const partsHavingGuide = await fetchPartsHavingGuide();
      if (data) {
        const updatedMbomData = data.map((part) => {
          const guideInfo = partsHavingGuide.find(
            (item) => item.partId === part.ebomPartId,
          );
          if (guideInfo) {
            return {
              ...part,
              guideNumber: guideInfo.number,
              guideId: guideInfo.id,
            };
          } else {
            return { ...part, guideNumber: null, guideId: null };
          }
        });
        setMbomData(updatedMbomData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
      setAllDataIsFetched(false);
      setMbomDataLoading(false);
    }
  };

  const fetchGuideEquipment = async () => {
    setLoadingData(true);
    setAllDataIsFetched(true);
    try {
      const data = await fetchGuideEquipmentWithGuideId(guideId);
      setGuideEquipmentData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
      setAllDataIsFetched(false);
    }
  };

  useEffect(() => {
    if (guidePartId) {
      fetchPartsInfo();
    }
  }, [guidePartId]);

  const fetchPartsInfo = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPartsLookUp();
      if (data) {
        const filteredData = data.filter(
          (part) =>
            part.id !== guidePartId &&
            !mbomData.some((mbomPart) => mbomPart.ebomPartId === part.id),
        );
        const sortedData = filteredData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setPartsData(sortedData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const getRowClassName = (params) => {
    const { quantityM, quantityE } = params.row;
    if (quantityE < quantityM) {
      return "quantityMissMatch";
    }
    return "";
  };

  const fetchGuideVersions = async (id) => {
    setLoadingData(true);
    try {
      const data = await fetchGuidesWithNumber(id);
      if (data) {
        let latestGuideVersion = data.find((item) => item.status === "Draft");
        if (!latestGuideVersion) {
          latestGuideVersion = data.reduce(
            (latest, item) =>
              item.version > (latest?.version || 0) ? item : latest,
            null,
          );
        }
        navigateTo(`/guides/${latestGuideVersion?.id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "number",
      headerName: "Number",
      flex: 1,
      valueGetter: (_value, row) => row.partNumber,
      renderCell: ({ row }) => {
        const { guideId, partNumberSuffix, partNumber, guideNumber } = row;

        return (
          <div className="GuideBOMCellWrapper">
            <span
              className="AppHyperLink"
              onClick={(e) => {
                e.stopPropagation();
                if (hasPermission(PERMISSIONS.PARTS.VIEW)) {
                  openPartDetailsDrawer({ partNumberSuffix });
                } else {
                  Alert("You do not have permission to view parts.", "error");
                }
              }}
            >
              {partNumber}
            </span>

            {guideNumber && guideId && (
              <span
                className="GuideBOMGuideLink"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasPermission(PERMISSIONS.GUIDES.VIEW)) {
                    window.open(`/guides/${guideId}`, "_blank");
                  } else {
                    Alert(
                      "You do not have permission to view guides.",
                      "error",
                    );
                  }
                }}
              >
                View Guide
              </span>
            )}
          </div>
        );
      },
    },

    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },

    {
      field: "childPartWeight",
      headerName: "Weight (g)",
      flex: 0.75,
    },

    {
      field: "quantityM",
      headerName: "Quantity",
      flex: 0.75,
      renderCell: ({ row }) => {
        const partId = row.ebomPartId;

        const stepQuantityDetails = guideEquipmentData
          .filter((step) => step.partId === partId)
          .map(
            (step) =>
              `Step: ${step.guideStep.sequence}, Quantity: ${
                step.quantity || "No quantity"
              }`,
          )
          .join("\n");

        return (
          <Tooltip
            title={
              <span style={{ whiteSpace: "pre-line" }}>
                {stepQuantityDetails || "No step or quantity available"}
              </span>
            }
          >
            <span>{row.quantityM}</span>
          </Tooltip>
        );
      },
    },

    {
      field: "quantityE",
      headerName: "BOM (Q)",
      flex: 0.75,
      renderCell: ({ row }) => row.quantityE || "---",
    },
  ];

  const initialGridState = {
    columns: {
      columnVisibilityModel: {
        quantityE: false,
      },
    },
  };

  const [addNewEBOMAccordionStatus, setAddNewEBOMAccordionStatus] =
    useState(false);

  useEffect(() => {
    if (selectedPart) {
      const findExistence = mbomData.find(
        (item) => item.ebomPartId === selectedPart.id,
      );
      if (findExistence) {
        setEBOMQuantity(findExistence.quantityE);
        setSelectedPartId(selectedPart.id);
        setEBomId(findExistence.ebomId);
        Alert("Part is already existing..", "error");
      } else {
        return;
      }
    }
  }, [selectedPart]);

  const updateDetails = async () => {
    setLoadingData(true);

    const updatedChild = {
      id: ebomId,
      partId: guidePartId,
      childPartId: selectedPartId,
      quantity: eBOMQuantity,
    };

    try {
      await updateEBom(ebomId, updatedChild);
      fetchMbomData();
      setAddNewEBOMAccordionStatus(false);
      Alert(`Updated ${selectedPart.number} Quantity Successfully`, "success");
      setSelectedPart(null);
      setSelectedPartId("");
      setEBOMQuantity(0);
    } catch (error) {
      console.error(error);
      Alert("Couldn't Update Quantity.!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreate = async () => {
    setLoadingData(true);

    const ChildPart = {
      partId: guidePartId,
      childPartId: selectedPart.id,
      quantity: eBOMQuantity,
    };

    try {
      await createNewEBom(ChildPart);
      fetchMbomData();
      setAddNewEBOMAccordionStatus(false);
      Alert(`Added ${selectedPart.number} to the EBOM`, "success");
      setSelectedPart(null);
      setSelectedPartId("");
      setEBOMQuantity(0);
    } catch (error) {
      console.error(error);
      Alert(`Couldn't Add Part to the EBOM`, "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="ManufacturingBomInner">
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="DataGridDiv">
          <StyledDataGrid
            rows={mbomData}
            columns={columns}
            getRowId={(row) => row.ebomPartId}
            initialState={initialGridState}
            className="DataGrid"
            getRowClassName={getRowClassName}
            loading={mbomDataLoading}
          />
        </div>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default AddBom;
