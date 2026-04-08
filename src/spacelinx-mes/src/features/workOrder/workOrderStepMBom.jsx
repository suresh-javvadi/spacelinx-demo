import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchGuideEquipmentWithStepId } from "../../services/guideEquipmentService";
import {
  fetchGuideMBomWithGuideId,
  fetchGuidesWithNumber,
  fetchPartsHavingGuide,
} from "../../services/guideService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const workOrderStepMBom = ({
  stepId,
  guideId,
  mBOMDrawerOpen,
  equipmentDrawerOpen,
}) => {
  const [loadingData, setLoadingData] = useState(true);
  const [partMBOMData, setPartMBOMData] = useState(null);
  const [mbomData, setMbomData] = useState(null);
  const [toolsAndMachinesMBOMData, setToolsAndMachinesMBOMData] =
    useState(null);
  const [partEquipmentAccordionStatus, setPartEquipmentAccordionStatus] =
    useState(true);
  useEffect(() => {
    if (equipmentDrawerOpen && stepId) {
      fetchStepBOMData();
    }
  }, [stepId]);
  const fetchStepBOMData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchGuideEquipmentWithStepId(stepId);
      if (data) {
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPartMBOMData(
          sortedData.filter((item) => item.equipmentType === "part")
        );
        setToolsAndMachinesMBOMData(
          sortedData.filter((item) => item.equipmentType !== "part")
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };
  useEffect(() => {
    if (mBOMDrawerOpen && guideId) {
      fetchMBOMData();
    }
  }, [guideId]);
  const fetchMBOMData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchGuideMBomWithGuideId(guideId);
      const partsHavingGuide = await fetchPartsHavingGuide();
      if (data) {
        const updatedMbomData = data.map((part) => {
          const guideInfo = partsHavingGuide.find(
            (item) => item.partId === part.ebomPartId
          );
          if (guideInfo) {
            return { ...part, guideNumber: guideInfo.number };
          } else {
            return { ...part, guideNumber: null };
          }
        });
        setMbomData(updatedMbomData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };
  const EColumns = [
    {
      field: "rowType",
      headerName: "",
      flex: 1,
      maxWidth: 60,
      renderCell: ({ row }) => {
        if (row.equipmentType === "part") {
          return <ion-icon name="construct-outline"></ion-icon>;
        } else if (row.equipmentType === "tool") {
          return <ion-icon name="build-outline"></ion-icon>;
        } else {
          return <ion-icon name="cog-outline"></ion-icon>;
        }
      },
    },
    {
      field: "partNumber",
      headerName: "Number",
      flex: 1,
      minWidth: 50,
      valueGetter: (_value, row) => {
        if (row.equipmentType === "part") {
          return row.part?.partNumber || "";
        } else if (row.equipmentType === "tool") {
          return row.tool?.number || "";
        } else {
          return row.machine?.number || "";
        }
      },
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 50,
      valueGetter: (_value, row) => {
        if (row.equipmentType === "part") {
          return row.part?.name || "";
        } else if (row.equipmentType === "tool") {
          return row.tool?.name || "";
        } else {
          return row.machine?.name || "";
        }
      },
    },
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 50,
      valueGetter: (_value, row) => {
        if (row.equipmentType === "part") {
          return row.part?.partType?.name || "";
        } else if (row.equipmentType === "tool") {
          return row.tool?.toolType?.name || "";
        } else {
          return row.machine?.machineType?.name || "";
        }
      },
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      minWidth: 50,
      renderCell: ({ row }) => <p>{row.quantity}</p>,
    },
  ];

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
            null
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
  const MColumns = [
    {
      field: "partNumber",
      headerName: "Number",
      flex: 1,
      minWidth: 50,
      headerClassName: "DataGridColumn",
      renderCell: (params) =>
        params.row.guideNumber !== null ? (
          <p
            className="DataGridLinkCell"
            onClick={() => fetchGuideVersions(params.row.guideNumber)}
          >
            {params.row.number}
          </p>
        ) : (
          params.row.value
        ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 50,
      headerClassName: "DataGridColumn",
    },
    {
      field: "quantityM",
      headerName: "Quantity",
      flex: 1,
      minWidth: 50,
      headerClassName: "DataGridColumn",
    },
    {
      field: "quantityE",
      headerName: "Quantity (E)",
      flex: 1,
      minWidth: 50,
      headerClassName: "DataGridColumn",
      renderCell: (params) => <p>{params.row.quantityE}</p>,
    },
  ];

  const initialGridState = {
    columns: {
      columnVisibilityModel: {
        quantityE: false,
      },
    },
  };

  const getRowClassName = (params) => {
    const { quantityM, quantityE } = params.row;
    if (quantityE < quantityM) {
      return "quantityMissMatch";
    }
    return "";
  };
  return (
    <div className="WOEquipmentTabDivMain">
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="WOEquipmentTabDiv">
          {equipmentDrawerOpen ? (
            <div className="AddItemsDataGrid">
              <Accordion
                expanded={partEquipmentAccordionStatus}
                onClick={() => {
                  setPartEquipmentAccordionStatus(
                    !partEquipmentAccordionStatus
                  );
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <p className="ProductsAccordionHeader">Parts</p>
                </AccordionSummary>
                <AccordionDetails>
                  {partMBOMData?.length > 0 ? (
                    <StyledDataGrid
                      getRowId={(row) => row.id}
                      rows={partMBOMData}
                      columns={EColumns}
                      className="GuideDataGrid"
                    />
                  ) : (
                    <p className="NoDataMessage">No Parts Added.</p>
                  )}
                </AccordionDetails>
              </Accordion>{" "}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  <p className="ProductsAccordionHeader">Tools and Machines</p>
                </AccordionSummary>
                <AccordionDetails>
                  {toolsAndMachinesMBOMData?.length > 0 ? (
                    <StyledDataGrid
                      rows={toolsAndMachinesMBOMData}
                      columns={EColumns}
                      className="GuideDataGrid"
                    />
                  ) : (
                    <p className="NoDataMessage">No Tool or Machine Added.</p>
                  )}
                </AccordionDetails>
              </Accordion>
            </div>
          ) : null}
          {mBOMDrawerOpen ? (
            <div className="WOMbomDiv">
              {!mbomData ? (
                <p>No MBom Available</p>
              ) : (
                <DataGrid
                  getRowId={(row) => row.ebomPartId}
                  rows={mbomData}
                  columns={MColumns}
                  getRowClassName={getRowClassName}
                  initialState={initialGridState}
                />
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default workOrderStepMBom;
