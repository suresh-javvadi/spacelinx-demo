import React, { useContext, useEffect, useState } from "react";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchFullBOMConsolidated } from "../../../services/childPartService";
import { Autocomplete, TextField } from "@mui/material";
import { fetchHasBomPartsLookUp } from "../../../services/partService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { usePartDetailsDrawer } from "./PartDetailsContext";

const ConsolidatedBOMView = ({
  selectedId,
  canEdit = false,
  bomView = false,
  setSelectedChildPartId,
  setEditMode,
  setSelectedEBomId,
  setFormValues,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [bomData, setBomData] = useState([]);
  const [loadingBomData, setLoadingBomData] = useState(true);
  const [bomParts, setBomParts] = useState([]);
  const [loadingBomParts, setLoadingBomParts] = useState(false);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("consolidatedBOMViewColumnVisibility");
    const defaultModel = {
      trl: false,
      spaceQualified: false,
      referenceNumber: false,
      weight: false,
      partNumber: true,
      name: true,
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
    if (selectedId) fetchFullBOMConsolidatedData(selectedId);
  }, [selectedId]);

  useEffect(() => {
    fetchHasBomPartsData();
  }, []);

  const fetchHasBomPartsData = async () => {
    setLoadingBomParts(true);
    try {
      const data = await fetchHasBomPartsLookUp();
      setBomParts(data);
    } catch (error) {
      console.error("Error fetching BOM parts data:", error);
      Alert("Failed to fetch BOM parts data.", "error");
    } finally {
      setLoadingBomParts(false);
    }
  };

  const fetchFullBOMConsolidatedData = async (id) => {
    setLoadingBomData(true);

    try {
      const data = await fetchFullBOMConsolidated(id);

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
    { field: "shortDescription", headerName: "Short Description", flex: 1 },

    {
      field: "totalQuantity",
      headerName: "Quantity",
      type: "number",
      flex: 0.7,
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

  const handleRowEdit = (record) => {
    if (!canEdit) return;

    if (!hasPermission(PERMISSIONS.PARTS.BOM.MODIFY)) {
      Alert("You don't have permission to modify BOMs.", "warning");
      return;
    }

    setSelectedChildPartId(record.id);
    setSelectedEBomId(record.ebomId || record.id);
    setEditMode(true);

    setFormValues({
      childPartData: record,
      quantity: record.quantity,
      assemblyLocationId: record?.assemblyLocationId,
    });

    setEditingRowKey(record.key);
    setEditingValue(record.quantity);
  };

  return (
    <>
      {bomView === true ? (
        <div
          className={
            canEdit ? "ChildPartDataGrid" : "ChildPartDataGridReadonly"
          }
        >
          <StyledDataGrid
            columns={columns}
            rows={bomData}
            loading={loadingBomData}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "consolidatedBOMViewColumnVisibility",
                JSON.stringify(newModel)
              );
            }}
          />
        </div>
      ) : (
        <div className="AdminChildren">
          <div className="AdminChildrenHeader">
            <p className="PageHeader">Consolidated BOM</p>
          </div>
          <div className="ConsolidatedBomHeader">
            <Autocomplete
              options={bomParts}
              getOptionLabel={(option) =>
                `${option.partNumber} - ${option.name}`
              }
              loading={loadingBomParts}
              onChange={(event, newValue) => {
                if (newValue) {
                  fetchFullBOMConsolidatedData(newValue.id);
                }
              }}
              className="AdminTextFields"
              fullWidth
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Part to View BOM"
                  fullWidth
                />
              )}
            />
          </div>

          <div className="ConsolidatedBomGrid">
            <StyledDataGrid
              columns={columns}
              rows={bomData}
              getRowClassName={(params) => {
                if (params.row.makeBuy === 1) return "buy-part-row";
                if (params.row.makeBuy === 0) return "make-part-row";
                return "";
              }}
              loading={loadingBomData}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => {
                setColumnVisibilityModel(newModel);
                localStorage.setItem(
                  "consolidatedBOMViewColumnVisibility",
                  JSON.stringify(newModel)
                );
              }}
              className="DataGrid"
            />
          </div>
        </div>
      )}
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </>
  );
};

export default ConsolidatedBOMView;
