import React, { useState, useEffect, useContext } from "react";
import Cliploader from "../../Components/Loaders/Cliploader";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { fetchChildParts } from "../../services/childPartService";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import { useUserContext } from "../../features/userContext/UserContext";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const BOM = ({ partId, setAllDataIsFetched }) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [childPartsData, setChildPartsData] = useState([]);
  const { openPartDetailsDrawer } = usePartDetailsDrawer() || {};
  useEffect(() => {
    if (partId) {
      fetchPartData();
    }
  }, [partId]);

  const fetchPartData = async () => {
    setLoadingData(true);
    setAllDataIsFetched(true);
    try {
      const childPart = await fetchChildParts(partId);
      if (childPart) {
        setChildPartsData(childPart);
      }
    } catch (error) {
      console.error("Error fetching part data:", error);
    } finally {
      setLoadingData(false);
      setAllDataIsFetched(false);
    }
  };
  const initialGridState = {
    columns: {
      columnVisibilityModel: {
        weight: false,
      },
    },
  };
  const columns = [
    {
      field: "number",
      headerName: "Part Number",
      flex: 1,
      minWidth: 50,
      renderCell: ({ row }) => (
        <div
          className={`AppHyperLink ${
            !hasPermission(PERMISSIONS.PARTS.VIEW) ? "disabled-link" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (
              hasPermission(PERMISSIONS.PARTS.VIEW) &&
              row.childPart &&
              openPartDetailsDrawer
            ) {
              openPartDetailsDrawer({
                partNumberSuffix: row.childPart.partNumberSuffix,
              });
            } else if (!hasPermission(PERMISSIONS.PARTS.VIEW)) {
              Alert("You do not have access to view part details!", "warning");
            }
          }}
          title={
            !hasPermission(PERMISSIONS.PARTS.VIEW)
              ? "You do not have permission to view part details"
              : ""
          }
        >
          {row.childPart?.partNumber || "---"}
        </div>
      ),
      valueGetter: (_value, row) => row.childPart?.partNumber || "---",
    },

    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 50,
      renderCell: ({ row }) => row.childPart?.name || "---",
    },

    {
      field: "quantity",
      headerName: "Quantity (E)",
      flex: 1,
      minWidth: 50,
      type: "number",
    },

    {
      field: "makeBuy",
      headerName: "Make / Buy",
      flex: 1,
      renderCell: ({ row, value }) => {
        const makeBuyValue = row.childPart?.makeBuy ?? value;
        return makeBuyValue === 0 ? "Make" : makeBuyValue === 1 ? "Buy" : "---";
      },
    },

    {
      field: "weight",
      headerName: "Weight (g)",
      flex: 1,
      minWidth: 50,
      renderCell: ({ row }) =>
        row.childPart?.weight != null ? row.childPart.weight : "---",
    },
  ];

  if (!hasPermission(PERMISSIONS.PRODUCTS.BOM.VIEW)) {
    return (
      <div className="ProductDataGridDiv">
        <p>You do not have permission to view Bill of Materials.</p>
      </div>
    );
  }

  return (
    <div className="ProductDataGridDiv">
      {loadingData ? (
        <div className="productLoader">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <StyledDataGrid
          rows={childPartsData}
          initialState={initialGridState}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
        />
      )}
    </div>
  );
};

export default BOM;
