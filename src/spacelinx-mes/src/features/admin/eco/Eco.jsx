import React, { useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchEcoWithUser } from "../../../services/ecoService";
import { Button, Drawer } from "@mui/material";
import { Add } from "@mui/icons-material";
import NewEco from "./NewEco";
import EditEco from "./EditEco";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { discardEco } from "../../../services/ecoService";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { fetchUniquePartsWithOutobsolete } from "../../../services/partService";
import { useUserContext } from "../../userContext/UserContext";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { fetchUserLookup } from "../../../services/userService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { useDeepLink } from "../../../DeepLinkContext";

const Eco = () => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const { deepLinkInfo, clearDeepLink } = useDeepLink();
  const [loadingData, setLoadingData] = useState(true);
  const [ecoData, setEcoData] = useState([]);
  const [createEcoDrawerStatus, setCreateEcoDrawerStatus] = useState(false);
  const [editEcoDrawerStatus, setEditEcoDrawerStatus] = useState(false);
  const [selectedEco, setSelectedEco] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedParts, setSelectedParts] = useState([]);
  const [changeTypes, setChangeTypes] = useState([]);
  const [uniqueParts, setUniqueParts] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loadingUsersData, setLoadingUsersData] = useState(true);
  const [loadingUniqueParts, setLoadingUniqueParts] = useState(true);
  const [loadingChangeTypes, setLoadingChangeTypes] = useState(true);

  useEffect(() => {
    if (deepLinkInfo && deepLinkInfo.basePath === "/plm/eco") {
      const matchedEco = ecoData.find((eco) => eco.id === deepLinkInfo.id);

      if (matchedEco) {
        setSelectedEco(matchedEco);
        setEditEcoDrawerStatus(true);

        clearDeepLink();
      }
    }
  }, [deepLinkInfo, ecoData, clearDeepLink]);

  const fetchUserData = async () => {
    setLoadingUsersData(true);
    try {
      const data = await fetchUserLookup();
      setUserData(data);
    } catch (error) {
      Alert("Error fetching user data", "error");
      console.error("Error fetching user data:", error);
    } finally {
      setLoadingUsersData(false);
    }
  };

  useEffect(() => {
    fetchUniquePartsWithOutobsoleteData();
    fetchUserData();
  }, []);

  const fetchUniquePartsWithOutobsoleteData = async () => {
    setLoadingUniqueParts(true);
    try {
      const data = await fetchUniquePartsWithOutobsolete();
      setUniqueParts(
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
    } catch (error) {
      Alert("Error fetching parts data", "error");
      console.error(error);
    } finally {
      setLoadingUniqueParts(false);
    }
  };

  useEffect(() => {
    const fetchChangeTypes = async () => {
      setLoadingChangeTypes(true);
      try {
        const response = await fetchOptionSetByName("eco_change_type");
        setChangeTypes(response ? JSON.parse(response.values) : []);
      } catch (error) {
        Alert("Error fetching change types", "error");
        console.error("Error fetching change types:", error);
      } finally {
        setLoadingChangeTypes(false);
      }
    };
    fetchChangeTypes();
  }, []);

  useEffect(() => {
    if (location.state?.createEcoDrawerStatus) {
      setCreateEcoDrawerStatus(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.createEcoDrawerStatus]);

  useEffect(() => {
    if (location.state?.selectedPart) {
      setSelectedEco(location.state.selectedPart.eco);
      setEditEcoDrawerStatus(true);
    }
  }, [location.state?.selectedPart]);

  const handleCloseClick = () => {
    setCreateEcoDrawerStatus(false);
    setEditEcoDrawerStatus(false);
    setSelectedParts([]);
  };

  useEffect(() => {
    fetchEcoData();
  }, []);

  const fetchEcoData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchEcoWithUser();
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setEcoData(sortedData);
      return sortedData;
    } catch (error) {
      Alert("Error fetching ECO data", "error");
      console.error("Error fetching ECO data", error);
      return [];
    } finally {
      setLoadingData(false);
    }
  };

  const columns = [
    {
      field: "number",
      headerName: "ECO Number",
      flex: 1,
    },
    {
      field: "name",
      headerName: "ECO Name",
      flex: 1,
    },
    {
      field: "changeType",
      headerName: "Change Type",
      flex: 1,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.5,
    },
    {
      field: "requestorFullName",
      headerName: "Requestor",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      valueGetter: (_value, row) => (row.status === "Draft" ? "" : row.status),
    },
    {
      field: "delete",
      headerName: " ",
      width: 50,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: ({ row }) => {
        const handleDelete = async (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (!hasPermission(PERMISSIONS.ECO.DELETE)) {
            Alert("You don't have permission to discard an ECO.", "warning");
            return;
          }

          const isConfirmed = await showConfirmation(
            "Are you sure?",
            "You won’t be able to undo this!",
          );

          if (isConfirmed) {
            try {
              await discardEco(row.id);
              showAlert("success", "Discarded!", "ECO discarded successfully!");
              fetchEcoData();
            } catch (error) {
              showAlert("error", "Error", "Failed to discard ECO. Try again.");
              console.error("Discard error:", error);
            }
          }
        };

        return row.status === "Draft" ? (
          <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
        ) : null;
      },
    },
  ];

  useEffect(() => {
    if (selectedEco) {
      setEditEcoDrawerStatus(true);
    }
  }, [selectedEco]);

  const handleOpenEditDrawer = async () => {
    setLoadingData(true);
    try {
      const data = await fetchEcoData();
      if (!data || data.length === 0) {
        setSelectedEco(null);
        setEditEcoDrawerStatus(false);
        return;
      }

      const latestEco = Array.isArray(data) && data.length ? data[0] : null;
      if (!latestEco) {
        setSelectedEco(null);
        setEditEcoDrawerStatus(false);
        return;
      }
      setSelectedEco(latestEco);
      setEditEcoDrawerStatus(true);
    } catch (error) {
      console.error("Failed to refresh ECO data", error);
      setSelectedEco(null);
      setEditEcoDrawerStatus(false);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRefresh = async () => {
    setLoadingData(true);
    await fetchEcoData();
  };

  return (
    <div>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">ECO</p>
          </div>
          <Button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.ECO.MODIFY)) {
                Alert("You don't have permission to create an ECO.", "warning");
                return;
              }
              setCreateEcoDrawerStatus(true);
            }}
            startIcon={<Add />}
          >
            Add New
          </Button>
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={ecoData}
            columns={columns}
            onRowClick={(params) => {
              setSelectedEco(params.row);
              setEditEcoDrawerStatus(true);
            }}
            pageSize={5}
            className="DataGrid"
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createEcoDrawerStatus}
          onClose={handleCloseClick}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          <NewEco
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedPart={selectedParts}
            changeTypes={changeTypes}
            loadingChangeTypes={loadingChangeTypes}
            userData={userData}
            loadingUsersData={loadingUsersData}
            handleOpenEditDrawer={handleOpenEditDrawer}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editEcoDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
          defaultWidth={75}
        >
          <EditEco
            key={selectedEco?.id}
            handleCloseClick={handleCloseClick}
            selectedEco={selectedEco}
            ecoData={ecoData}
            handleRefresh={handleRefresh}
            changeTypes={changeTypes}
            uniqueParts={uniqueParts}
            userData={userData}
            loadingUsersData={loadingUsersData}
            loadingUniqueParts={loadingUniqueParts}
            setLoadingUniqueParts={setLoadingUniqueParts}
            loadingChangeTypes={loadingChangeTypes}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </div>
  );
};

export default Eco;
