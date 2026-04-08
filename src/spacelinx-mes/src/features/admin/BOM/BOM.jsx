import React, { useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchMakePartsWithEBOM } from "../../../services/partService";
import NewBOM from "./NewBOM";
import EditPart from "../parts/EditPart";
import { fetchUnitOfMeasureLookUp } from "../../../services/unitOfMeasureService";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const BOM = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [BOMData, setBOMData] = useState([]);
  const [createBOMDrawerStatus, setCreateBOMDrawerStatus] = useState(false);
  const [editBOMDrawerStatus, setEditBOMDrawerStatus] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [uomData, setUomData] = useState([]);
  const [loadingBomData, setLoadingBomData] = useState(true);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("bomColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          weight: false,
          manufacturingPartNumber: false,
          isSerialNumberRequired: false,
          unitPrice: false,
          referenceNumber: false,
        };
  });

  const handleCloseClick = () => {
    setCreateBOMDrawerStatus(false);
    setEditBOMDrawerStatus(false);
  };

  const handleRefresh = () => {
    setLoadingBomData(true);
    fetchBOMData();
  };

  useEffect(() => {
    fetchBOMData();
    handleFetchUOMData();
  }, []);

  const fetchBOMData = async () => {
    setLoadingBomData(true);
    try {
      const data = await fetchMakePartsWithEBOM();
      setBOMData(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (error) {
      Alert("Error fetching BOM data", "error");
      console.error("Error fetching BOM data:", error);
    } finally {
      setLoadingBomData(false);
    }
  };

  const handleFetchUOMData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchUnitOfMeasureLookUp();
      if (data) {
        setUomData(data);
      }
    } catch (error) {
      Alert("Error fetching Unit of Measure data", "error");
      console.error("Error fetching Unit of Measure data:", error);
    } finally {
      setLoadingData(false);
    }
  };
  const initialGridState = {
    columns: {
      columnVisibilityModel: {
        weight: false,
        unitOfMeasure: false,
        manufacturingPartNumber: false,
        isSerialNumberRequired: false,
        unitPrice: false,
        referenceNumber: false,
        ...columnVisibilityModel,
      },
    },
  };
  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 0.5,
    },
    {
      field: "name",
      headerName: "Part Name",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
      valueGetter: (_value, row) => (row.status === "Draft" ? "" : row.status),
    },
    {
      field: "partType",
      headerName: "Type",
      flex: 0.5,
      valueGetter: (_value, row) => row.partType?.name || "",
    },
    {
      field: "category",
      headerName: "Category",
      flex: 0.5,
      valueGetter: (_value, row) => row.partType?.category || "",
    },
    {
      field: "makeBuy",
      headerName: "Make/Buy",
      flex: 0.3,
      valueGetter: (_value, row) => (row?.makeBuy ? "Buy" : "Make"),
    },
    {
      field: "unitOfMeasure",
      headerName: "Unit of Measure",
      flex: 0.5,
      valueGetter: (_value, row) => row.unitOfMeasure?.name || "",
    },
    {
      field: "manufacturingPartNumber",
      headerName: "Manufacturing Part Number",
      flex: 0.7,
    },
    {
      field: "weight",
      headerName: "Weight (g)",
      flex: 0.3,
    },
    {
      field: "unitPrice",
      headerName: "Unit Price",
      flex: 0.3,
    },
    {
      field: "isSerialNumberRequired",
      headerName: "Serial Number",
      flex: 0.3,
      valueGetter: (_value, row) =>
        row.isSerialNumberRequired ? "Required" : "Not Required",
    },
    {
      field: "referenceNumber",
      headerName: "Old Part Number",
      flex: 0.4,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">BOM</p>
          </div>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={BOMData}
            loading={loadingBomData || loadingData}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "bomColumnVisibility",
                JSON.stringify(newModel)
              );
            }}
            columns={columns}
            onRowClick={(params) => {
              setSelectedPart(params.row);
              setEditBOMDrawerStatus(true);
            }}
            className="DataGrid"
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={editBOMDrawerStatus}
          onClose={handleCloseClick}
          defaultWidth={75}
        >
          <EditPart
            setMainPartsLoadingData={setLoadingData}
            selectedPartNumberSuffix={selectedPart?.partNumberSuffix}
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            uomData={uomData}
            defaultTab={"2"}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={createBOMDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewBOM
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default BOM;
