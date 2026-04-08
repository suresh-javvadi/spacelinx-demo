import React, { useContext, useEffect, useState } from "react";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchLocationViewBOM } from "../../../services/childPartService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { usePartDetailsDrawer } from "./PartDetailsContext";

const LocationBOMView = ({ selectedId, canEdit = false, bomView = false }) => {
  const { Alert } = useContext(AlertsContext);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [bomData, setBomData] = useState([]);
  const [loadingBomData, setLoadingBomData] = useState(true);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("locationBOMViewColumnVisibility");
    const defaultModel = {
      trl: false,
      spaceQualified: false,
      referenceNumber: false,
      weight: false,
      partNumber: true,
      name: true,
      shortDescriptio: true,
      quantity: true,
      status: true,
      partType: true,
      partTypeCategory: false,
      makeBuy: true,
      manufacturingPartNumber: true,
      manufacturer: true,
      material: true,
      countryOfOrigin: false,
      partLevelName: false,
      subsystemName: false,
      grade: false,
    };
    return saved ? { ...defaultModel, ...JSON.parse(saved) } : defaultModel;
  });

  useEffect(() => {
    if (selectedId) {
      fetchLocationViewBOMData(selectedId);
    }
  }, [selectedId]);

  const fetchLocationViewBOMData = async (id) => {
    setLoadingBomData(true);
    try {
      const data = await fetchLocationViewBOM(id);
      const filteredData = data.filter((item) => item.id !== id);

      setBomData(filteredData);
    } catch (error) {
      console.error("Error fetching BOM data:", error);
      Alert("Failed to fetch BOM data.", "error");
    } finally {
      setLoadingBomData(false);
    }
  };

  const columns = [
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

    { field: "name", headerName: "Name", flex: 1.5 },
    { field: "shortDescription", headerName: " Short Description", flex: 2 },

    {
      field: "quantity",
      headerName: "Quantity",
      type: "number",
      flex: 0.7,
    },
    {
      field: "assemblyLocationName",
      headerName: "Location",
      flex: 0.6,
    },

    {
      field: "status",
      headerName: "Status",
      flex: 1,
      valueGetter: (value) => (value === "Draft" ? "" : value),
    },

    { field: "partTypeName", headerName: "Type", flex: 1 },
    { field: "partTypeCategory", headerName: "Category", flex: 1 },

    {
      field: "makeBuy",
      headerName: "Make/Buy",
      flex: 0.3,
      renderCell: ({ row }) => {
        const makeBuy = row.makeBuy;
        const text = makeBuy === 1 ? "Buy" : "Make";
        return (
          <span className={`make-buy-cell ${makeBuy === 1 ? "buy" : "make"}`}>
            {text}
          </span>
        );
      },
      valueGetter: (_value, row) => (row.makeBuy === 1 ? "Buy" : "Make"),
    },

    {
      field: "manufacturingPartNumber",
      headerName: "Manufacturing Part Number",
      flex: 1,
    },

    { field: "manufacturerName", headerName: "Manufacturer Name", flex: 1 },

    { field: "weight", headerName: "Weight (g)", type: "number", flex: 0.8 },

    { field: "trl", headerName: "TRL #", type: "number", flex: 0.7 },

    { field: "material", headerName: "Material", flex: 1 },

    { field: "countryOfOriginName", headerName: "Country of Origin", flex: 1 },
    { field: "partLevelName", headerName: "Part Level", flex: 1 },
    { field: "subsystemName", headerName: "Subsystem", flex: 1 },
    { field: "grade", headerName: "Grade", flex: 0.3 },
    {
      field: "spaceQualified",
      headerName: "Space Qualified",
      type: "boolean",
      flex: 0.8,
    },
  ];

  return (
    <>
      <div
        className={canEdit ? "ChildPartDataGrid" : "ChildPartDataGridReadonly"}
      >
        <StyledDataGrid
          columns={columns}
          rows={bomData}
          loading={loadingBomData}
          getRowId={(row) => row?.ebomId}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => {
            setColumnVisibilityModel(newModel);
            localStorage.setItem(
              "locationBOMViewColumnVisibility",
              JSON.stringify(newModel)
            );
          }}
        />
      </div>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </>
  );
};

export default LocationBOMView;
