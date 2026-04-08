import React, { useState, useEffect, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Divider } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { fetchParentPartWithPartId } from "../../../services/partService";
import { AlertsContext } from "../../AlertsContext/Context";
import { usePartDetailsDrawer } from "./PartDetailsContext";
import WhereUsedHierarchy from "./WhereUsedHierarchy";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const PartUsedIn = ({ selectedPartId }) => {
  const { Alert } = useContext(AlertsContext);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [loadingData, setLoadingData] = useState(true);
  const [parentPartData, setParentPartData] = useState(null);
  const [viewOption, setViewOption] = useState(2);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("whereUsedColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          material: true,
          partNumber: true,
          name: true,
          status: true,
          partType: true,
          category: false,
          makeBuy: true,
          unitOfMeasure: false,
          manufacturingPartNumber: true,
          manufacturerName: true,
          weight: false,
          isSerialNumberRequired: false,
          trl: false,
          spaceQualified: false,
          referenceNumber: false,
        };
  });

  const fetchParentPartData = async () => {
    try {
      const data = await fetchParentPartWithPartId(selectedPartId);
      if (data) setParentPartData(data);
    } catch (error) {
      Alert("Error fetching parent part data", "error");
      console.error("Error fetching parent part:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchParentPartData();
  }, [selectedPartId]);

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 0.5,
      renderCell: ({ row }) => (
        <div
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            openPartDetailsDrawer({
              partNumberSuffix: row.partNumberSuffix,
            });
          }}
        >
          {row.partNumber || "--"}
        </div>
      ),
      valueGetter: (_value, row) => row.partNumber ?? "---",
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
      renderCell: ({ value }) => (value === "Draft" ? " " : value),
    },
    {
      field: "partType",
      headerName: "Type",
      flex: 0.5,
      valueGetter: (_value, row) => row.partType?.name ?? "---",
    },
    {
      field: "category",
      headerName: "Category",
      flex: 0.5,
      valueGetter: (_value, row) => row.partType?.category ?? "---",
    },
    {
      field: "makeBuy",
      headerName: "Make/Buy",
      flex: 0.3,
      valueGetter: (_value, row) => (row.makeBuy ? "Buy" : "Make"),
    },
    {
      field: "unitOfMeasure",
      headerName: "Unit of Measure",
      flex: 0.5,
      valueGetter: (_value, row) => row.unitOfMeasure?.name ?? "---",
    },
    {
      field: "manufacturingPartNumber",
      headerName: "Manufacturing Part Number",
      flex: 0.7,
      valueGetter: (_value, row) => row.manufacturingPartNumber ?? "---",
    },
    {
      field: "manufacturerName",
      headerName: "Manufacturer",
      flex: 0.7,
      valueGetter: (_value, row) => row.manufacturerName ?? "---",
    },
    {
      field: "weight",
      headerName: "Weight",
      flex: 0.4,
      valueGetter: (_value, row) => row.weight ?? "---",
    },
    {
      field: "isSerialNumberRequired",
      headerName: "Serial Number Required",
      flex: 0.6,
      valueGetter: (_value, row) => (row.isSerialNumberRequired ? "Yes" : "No"),
    },
    {
      field: "trl",
      headerName: "TRL #",
      flex: 0.4,
      valueGetter: (_value, row) => row.trl ?? "---",
    },
    {
      field: "material",
      headerName: "Material",
      flex: 0.5,
      valueGetter: (_value, row) => row.material ?? "---",
    },
    {
      field: "spaceQualified",
      headerName: "Space Qualified",
      flex: 0.5,
      valueGetter: (_value, row) => (row.spaceQualified ? "Yes" : "No"),
    },
  ];

  return (
    <div className="MasterDataDataGridDiv">
      {/* Header Section */}
      {/* <div className="PartBomHierarchyHeaderDiv PartViewContainer">
        <div className="PartBomHierarchyHeaderDivInner">
          <button
            className={viewOption === 2 ? "AddOrUpdateButton" : "DimButton"}
            onClick={() => setViewOption(2)}
          >
            <AccountTreeIcon sx={{ fontSize: "16px" }} />
          </button>
          <Divider orientation="vertical" flexItem />
          <button
            className={viewOption === 1 ? "AddOrUpdateButton" : "DimButton"}
            onClick={() => setViewOption(1)}
          >
            <TableChartIcon sx={{ fontSize: "16px" }} />
          </button>
        </div>
      </div> */}

      {/* Data View Section */}
      <div className="PartBomHierarchyDataGridDiv">
        {viewOption === 1 ? (
          // TABLE VIEW
          <StyledDataGrid
            columns={columns}
            rows={parentPartData || []}
            loading={loadingData}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "whereUsedColumnVisibility",
                JSON.stringify(newModel)
              );
            }}
          />
        ) : (
          // HIERARCHICAL VIEW
          <div className="HierarchyContainer">
            <WhereUsedHierarchy selectedPartId={selectedPartId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PartUsedIn;
