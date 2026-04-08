import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Drawer } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import { AlertsContext } from "../../AlertsContext/Context";
import { fetchProgram } from "../../../services/programService";
import NewProgram from "./NewProgram";
import EditProgram from "./EditProgram";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchUsers } from "../../../services/userService";
import { fetchCustomerLookUp } from "../../../services/customerService";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

export const Program = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [programsData, setProgramsData] = useState([]);
  const [createProgramDrawerStatus, setCreateProgramDrawerStatus] =
    useState(false);
  const [editProgramsDrawerStatus, setEditProgramsDrawerStatus] =
    useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffData, setStaffData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("programColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          description: false,
          actualSpend: false,
          buyerName: false,
          supplyChainManagerName: false,
        };
  });
  const handleCloseDrawer = () => setCreateProgramDrawerStatus(false);
  const handleCloseClick = () => setEditProgramsDrawerStatus(false);

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoadingCustomers(true);
      try {
        const data = await fetchCustomerLookUp();

        const activeCustomers = data.filter((customer) => customer.name);

        setCustomers(activeCustomers);
      } catch (error) {
        Alert("Error fetching customer data", "error");
        console.error("Error fetching customers:", error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomerData();
  }, []);

  useEffect(() => {
    const fetchManagerData = async () => {
      setLoadingStaff(true);
      try {
        const data = await fetchUsers();

        const activeStaff = data.filter((user) => user.isActive);

        setStaffData(activeStaff);
      } catch (error) {
        Alert("Error fetching staff data", "error");
        console.error("Error fetching staff:", error);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchManagerData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const response = await fetchProgram();
      if (response) {
        const sortedData = response.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setProgramsData(sortedData);
      }
    } catch (error) {
      Alert("Error fetching program data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProgram = () => {
    setCreateProgramDrawerStatus(true);
  };

  const columns = [
    {
      field: "programCode",
      headerName: "Program Code",
      flex: 0.5,
    },
    {
      field: "name",
      headerName: "Program Name",
      flex: 0.5,
    },
    {
      field: "programManagerFirstName",
      headerName: "Program Manager",
      flex: 0.5,
      valueGetter: (_value, row) => row.programManager?.firstName || "",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      valueGetter: (_value, row) => row.status ?? "Not Started",
    },
    {
      field: "customerName",
      headerName: "Customer Name",
      flex: 0.5,
      valueGetter: (_value, row) => row.customer?.name ?? "",
    },
    {
      field: "budget",
      headerName: "Budget (in ₹)",
      flex: 0.5,
      valueGetter: (_value, row) => row.budget || 0,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 0.5,
    },
    {
      field: "actualSpend",
      headerName: "Actual Spend",
      flex: 0.5,
    },
    {
      field: "buyerName",
      headerName: "Buyer Name",
      flex: 0.5,
      valueGetter: (_value, row) => row.buyer?.firstName || "",
    },
    {
      field: "supplyChainManagerName",
      headerName: "Supply Chain Manager",
      flex: 0.5,
      valueGetter: (_value, row) => row.supplyChainManager?.firstName || "",
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Program</p>
          <div className="AdminChildrenHeaderButtons">
            <Button onClick={handleCreateProgram} startIcon={<Add />}>
              ADD NEW
            </Button>
          </div>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={programsData}
            columns={columns}
            loading={loadingData}
            className="DataGrid"
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "programColumnVisibility",
                JSON.stringify(newModel),
              );
            }}
            onRowClick={(params) => {
              setSelectedProgram(params.row);
              setEditProgramsDrawerStatus(true);
            }}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={createProgramDrawerStatus}
          onClose={handleCloseDrawer}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          <NewProgram
            handleCloseClick={handleCloseDrawer}
            handleRefresh={handleRefresh}
            loadingStaff={loadingStaff}
            staffData={staffData}
            customers={customers}
            loadingCustomers={loadingCustomers}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editProgramsDrawerStatus}
          onClose={handleCloseClick}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          {selectedProgram && (
            <EditProgram
              handleCloseClick={handleCloseClick}
              handleRefresh={fetchData}
              selectedProgram={selectedProgram}
              loadingStaff={loadingStaff}
              staffList={staffData}
              customers={customers}
              loadingCustomers={loadingCustomers}
            />
          )}
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Program;
