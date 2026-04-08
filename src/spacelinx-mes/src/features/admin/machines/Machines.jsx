import React, { useState, useEffect, useContext } from "react";
import "../../../features/features.css";
import { fetchMachines } from "../../../services/machineService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import NewMachine from "./NewMachine";
import EditMachine from "./EditMachine";
import Cliploader from "../../../Components/Loaders/Cliploader";
import ImportComponent from "../ImportComponent";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Machines = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingMachinesData, setLoadingMachinesData] = useState(true);
  const [machinesData, setMachinesData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [createMachineDrawerStatus, setCreateMachineDrawerStatus] =
    useState(false);
  const [editMachineDrawerStatus, setEditMachineDrawerStatus] = useState(false);
  const [machinesNumbersData, setMachinesNumbersData] = useState([]);

  const handleCloseClick = () => {
    setCreateMachineDrawerStatus(false);
    setEditMachineDrawerStatus(false);
  };

  const handleRefresh = () => {
    setLoadingMachinesData(true);
    fetchData();
  };
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingMachinesData(true);
    try {
      const data = await fetchMachines();
      if (data) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMachinesData(data);
        setMachinesNumbersData(data.map((machine) => machine.number));
      }
    } catch (error) {
      Alert("Error fetching Machines data", "error");
      console.error("Error fetching Machines data:", error);
    } finally {
      setLoadingMachinesData(false);
    }
  };

  const columns = [
    {
      field: "number",
      headerName: "Number",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "MachineType",
      headerName: "Type",
      flex: 1,
      valueGetter: (_value, row) =>
        row.machineType ? row.machineType.name : "",
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Machines</p>
          </div>
          <ImportComponent
            entityName="Machine"
            uploadKey="machine"
            setCreateDrawerStatus={setCreateMachineDrawerStatus}
            handleRefresh={handleRefresh}
          />
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={machinesData}
            columns={columns}
            loading={loadingMachinesData}
            onRowClick={(params) => {
              setSelectedId(params.row.id);
              setSelectedRowData(params.row);
              setEditMachineDrawerStatus(true);
            }}
            className="DataGrid"
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createMachineDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewMachine
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            MachinesData={machinesData}
            setCreateMachineDrawerStatus={setCreateMachineDrawerStatus}
          />{" "}
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editMachineDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
        >
          <EditMachine
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedId={selectedId}
            selectedRowData={selectedRowData}
            machinesNumbersData={machinesNumbersData}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Machines;
