import React, { useState, useEffect, useContext } from "react";
import { Drawer, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import NewGuide from "./NewGuide";
import { deleteGuide, fetchUniqueGuides } from "../../services/guideService";
import { Link } from "react-router-dom";
import { HomeAlerts } from "../../features/AlertsContext/Alerts";
import { AlertsContext } from "../../features/AlertsContext/Context";
import "../../features/features.css";
import Cliploader from "../../Components/Loaders/Cliploader";
import {
  showAlert,
  showConfirmation,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../userContext/UserContext";
import { useNavigate } from "react-router-dom";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const Guide = () => {
  const { hasPermission } = useUserContext();
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const { Alert } = useContext(AlertsContext);
  const [guideData, setGuideData] = useState([]);
  const [createGuideDrawerStatus, setCreateGuideDrawerStatus] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();
  const handleCloseClick = () => {
    setCreateGuideDrawerStatus(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchUniqueGuides();
      const sortedGuides = data.sort((a, b) => {
        const numA = parseInt(a.number.match(/\d+/)[0], 10);
        const numB = parseInt(b.number.match(/\d+/)[0], 10);
        return numB - numA;
      });

      setGuideData(sortedGuides);
    } catch (error) {
      Alert("Couldn't fetch guide Types...!", "error");
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "platform",
      headerName: "Platform",
      flex: 1,
      valueGetter: (_value, row) => (row.platform ? row.platform.name : ""),
    },

    {
      field: "number",
      headerName: "Number",
      flex: 1,
      renderCell: ({ row, value }) => (
        <p
          className="AppHyperLink"
          onClick={() => {
            if (hasPermission(PERMISSIONS.GUIDES.VIEW)) {
              navigate(`/guides/${row.id}`);
            } else {
              Alert("You do not have access to view this..! ", "warning");
            }
          }}
        >
          {value}
        </p>
      ),
    },

    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },

    {
      field: "part.number",
      headerName: "Part Number",
      flex: 1,
      valueGetter: (_value, row) => (row.part ? row.part.partNumber : ""),
      renderCell: ({ row }) => {
        const part = row.part;
        return (
          <div
            className="AppHyperLink"
            onClick={(e) => {
              e.stopPropagation();

              if (!hasPermission(PERMISSIONS.PARTS.VIEW)) {
                Alert(
                  "You don’t have permission to view Part details.",
                  "error"
                );
                return;
              }

              if (part) {
                openPartDetailsDrawer({
                  partNumberSuffix: part.partNumberSuffix,
                });
              }
            }}
          >
            {part?.partNumber || ""}
          </div>
        );
      },
    },

    {
      field: "part.name",
      headerName: "Part Name",
      flex: 1,
      valueGetter: (_value, row) => (row.part ? row.part.name : ""),
    },

    {
      field: "type",
      headerName: "Type",
      flex: 1,
      valueGetter: (_value, row) => (row.guideType ? row.guideType.name : ""),
    },

    {
      field: "category",
      headerName: "Category",
      flex: 1,
    },

    {
      field: "version",
      headerName: "Version",
      flex: 1,
    },

    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },

    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 1,
      valueFormatter: ({ value }) => {
        if (!value) return "";
        const date = new Date(value);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
    },

    {
      field: "actions",
      headerName: " ",
      width: 50,
      sortable: false,
      renderCell: ({ row }) => {
        const handleDelete = async () => {
          const confirmed = await showConfirmation(
            "Delete Guide?",
            "Are you sure you want to delete this guide?"
          );

          if (!confirmed) return;

          try {
            await deleteGuide(row.id);
            showAlert("success", "Deleted!", "Guide deleted successfully.");
            await fetchData();
          } catch (error) {
            console.error("Delete error:", error);
            showAlert(
              "error",
              "Failed!",
              "Couldn't delete the guide. Try again."
            );
          }
        };

        return (
          <ion-icon
            name="trash-outline"
            onClick={(e) => {
              e.stopPropagation();
              if (!hasPermission(PERMISSIONS.GUIDES.DELETE))
                return Alert(
                  "You do not have access to delete this..! ",
                  "warning"
                );
              handleDelete();
            }}
            class={
              !hasPermission(PERMISSIONS.GUIDES.DELETE)
                ? "IonIconDisabled"
                : undefined
            }
          />
        );
      },
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Guides</p>
          <Button
            onClick={() => setCreateGuideDrawerStatus(true)}
            disabled={!hasPermission(PERMISSIONS.GUIDES.MODIFY)}
          >
            + Add New
          </Button>
        </div>
        <div className="DataGridDiv">
          <StyledDataGrid
            rows={guideData}
            columns={columns}
            loading={loadingData}
            className="DataGrid"
            pageSize={5}
            getRowId={(row) => row.id}
            onRowClick={(params) => {
              navigate(`/guides/${params.row.id}`);
            }}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createGuideDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewGuide
            setMainGuideLoadingData={setLoadingData}
            handleCloseClick={handleCloseClick}
            handleRefresh={fetchData}
            GuideData={guideData}
            setCreateGuideDrawerStatus={setCreateGuideDrawerStatus}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Guide;
