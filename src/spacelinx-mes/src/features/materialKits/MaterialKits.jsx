import React, {
  useState,
  useEffect,
  useMemo,
  useContext,
  Children,
} from "react";
import {
  Button,
  Drawer,
  TextField,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { fetchMaterialKit } from "../../services/materialKitService";
import {
  unAssignWorkOrder,
  fetchKits,
  updateChildKitsLocation,
  updateKitLocation,
} from "../../services/childKitService";
import { Table } from "antd";
import { updateConfirmKit } from "../../services/childKitService";
import { fetchLocations } from "../../services/locationService";
import "./Kits.css";
import NewMaterialKit from "../materialKits/NewMaterialKit";
import KitWorkOrder from "./KitWorkOrder";
import Cliploader from "../../Components/Loaders/Cliploader";
import { ClipLoader } from "react-spinners";
import ChildKitData from "./ChildKitData";
import { Link } from "react-router-dom";
import { AlertsContext } from "../AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { useUserContext } from "../userContext/UserContext";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { PERMISSIONS } from "../../constants/PagePermissions";

const MaterialKits = () => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [materialKitsData, setMaterialKitsData] = useState([]);
  const [loadMaterialKitsData, setLoadMaterialKitsData] = useState(true);
  const [editWorkOrder, setEditWorkOrder] = useState([]);
  const [workOrderDrawerStatus, setWorkOrderDrawerStatus] = useState(false);
  const [selectedMaterialKitId, setSelectedMaterialKitID] = useState("");
  const [selectedKit, setSelectedKit] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createMaterialKitDrawerStatus, setCreateMaterialKitDrawerStatus] =
    useState(false);
  const [filteredMaterialKitsData, setFilteredMaterialKitsData] = useState([]);
  const [editLocation, setEditLocation] = useState(null);
  const [locationsData, setLocationsData] = useState([]);
  const [childKitDataDrawer, setChildKitDataDrawer] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingLocationData, setLoadingLocationData] = useState(true);
  const [loadingWorkOrderData, setLoadingWorkOrderData] = useState(false);
  const [normalMaterialKits, setNormalMaterialKits] = useState([]);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();

  const canViewMaterialKits = hasPermission(PERMISSIONS.MATERIALKITS.VIEW);
  const canModifyMaterialKits = hasPermission(PERMISSIONS.MATERIALKITS.MODIFY);
  const canAssignWorkOrder = hasPermission(
    PERMISSIONS.MATERIALKITS.ASSIGN_WORKORDER
  );
  const canModifyLocations = hasPermission(PERMISSIONS.LOCATIONS.MODIFY);
  const canViewParts = hasPermission(PERMISSIONS.PARTS.VIEW);
  const canViewWorkOrders = hasPermission(PERMISSIONS.WORKORDERS.VIEW);
  const canModifyWorkOrders = hasPermission(PERMISSIONS.WORKORDERS.MODIFY); // For unassigning WO

  const handleCloseClick = () => {
    setCreateMaterialKitDrawerStatus(false);
    setWorkOrderDrawerStatus(false);
  };

  const handleRefresh = () => {
    setLoadMaterialKitsData(true);
  };

  useEffect(() => {
    fetchMaterialKitData();
  }, [selectedMaterialKitId]);
  const fetchMaterialKitData = async () => {
    setLoadingData(true);
    try {
      const materialKitData = await fetchMaterialKit();
      const kitsData = await fetchKits();
      if (materialKitData) {
        materialKitData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const materialKitParentStatusData = materialKitData.map((kit) => ({
          ...kit,
          key: kit.id,
          isParent: true,
        }));
        const kitsWithParentStatus = kitsData.map((childKit) => ({
          ...childKit,
          key: childKit.id,
          isParent: false,
        }));
        kitsWithParentStatus.sort((a, b) => {
          if (a.number < b.number) return -1;
          if (a.number > b.number) return 1;
          return 0;
        });
        const updatedMaterialKitInfo = materialKitParentStatusData.map(
          (materialKit) => {
            const addedKitInfo = kitsWithParentStatus.filter(
              (kit) => kit.materialKitId === materialKit.id
            );
            return { ...materialKit, children: addedKitInfo || [] };
          }
        );
        setMaterialKitsData(updatedMaterialKitInfo);
      }
    } catch (error) {
      Alert("Error Fetching Material Kits Data", "error");
      console.error("Error fetching material kits data:", error);
    } finally {
      setLoadingData(false);
      setLoadMaterialKitsData(false);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchLocations();
        data.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        setLocationsData(data);
      } catch (error) {
        Alert("Error Fetching Data", "error");
        console.error("Error fetching data:", error);
      } finally {
        setLoadMaterialKitsData(false);
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleWorkOrder = (kit) => {
    if (!canAssignWorkOrder) {
      Alert(
        "You do not have permission to assign or modify work orders.",
        "warning"
      );
      return;
    }
    setWorkOrderDrawerStatus(true);
    if (kit.workOrder) {
      setSelectedKit(kit);
      setEditWorkOrder(kit.workOrder);
    } else {
      setSelectedKit(kit);
      setEditWorkOrder(null);
    }
  };

  useEffect(() => {
    handleLocationUpdate();
  }, [editLocation]);

  const handleLocationUpdate = async () => {
    setLoadingLocationData(true);
    try {
      if (!canModifyMaterialKits) {
        Alert(
          "You do not have permission to modify material kits locations.",
          "warning"
        );
        return;
      }
      if (editLocation && selectedKit) {
        const newLocation = {
          id: selectedKit.id,
          location: {
            id: editLocation.id,
            number: editLocation.number,
            name: editLocation.name,
          },
        };
        const response = await updateChildKitsLocation(
          selectedKit.id,
          newLocation
        );
        setLoadingData(false);
        fetchMaterialKitData();
        Alert("Location Updated Successfully...", "success");
      }
    } catch (error) {
      Alert("Error Updating Location", "error");
      console.error(error);
    } finally {
      setLoadingLocationData(false);
    }
  };

  const handleConfirmChildKit = async (childKitId) => {
    setLoadingData(true);
    try {
      if (!canModifyMaterialKits) {
        Alert("You do not have permission to confirm child kits.", "warning");
        return;
      }
      await updateConfirmKit(childKitId);
      fetchMaterialKitData();
      Alert("Kit Confirmed Successfully...", "success");
    } catch (error) {
      Alert("Error Confirming Child Kit", "error");
      console.error("Error confirming child kit:", error);
    } finally {
      setLoadingData(false);
    }
  };
  useEffect(() => {
    const filteredData = materialKitsData.filter((kit) => {
      const kitNumber = kit.number ? kit.number.toLowerCase() : "";
      const kitName = kit.name ? kit.name.toLowerCase() : "";
      const kitPartNumber = kit.part?.number
        ? kit.part.number.toLowerCase()
        : "";
      const kitLocationName = kit.location?.name
        ? kit.location.name?.toLowerCase()
        : "";
      const query = searchQuery.toLowerCase();

      return (
        kitNumber.includes(query) ||
        kitName.includes(query) ||
        kitPartNumber.includes(query) ||
        kitLocationName.includes(query)
      );
    });

    setFilteredMaterialKitsData(filteredData);
  }, [searchQuery, materialKitsData]);
  const handleRemoveWorkOrder = async (id) => {
    setLoadingWorkOrderData(true);
    try {
      if (!canModifyWorkOrders) {
        Alert("You do not have permission to unassign work orders.", "warning");
        return;
      }
      await unAssignWorkOrder(id);
      fetchMaterialKitData();
      setLoadingWorkOrderData(false);
    } catch (error) {
      console.error("Error Fetching Material Kit Data ", error);
      Alert("Error Fetching Material Kit Data ", "error");
    } finally {
      setLoadingWorkOrderData(false);
    }
  };
  const columns = [
    {
      title: "Kit Number",
      dataIndex: "number",
      width: 230,
      headerClassName: "DataGridColumn",
      render: (text, record) =>
        record.isParent ? (
          <p>{record.number}</p>
        ) : (
          <Link
            onClick={(e) => {
              if (!canViewMaterialKits) {
                e.preventDefault();
                Alert(
                  "You do not have permission to view kit details.",
                  "warning"
                );
                return;
              } else {
                e.preventDefault();
                setSelectedMaterialKitID(record.materialKitId);
                setSelectedKit(record);
                setChildKitDataDrawer(true);
              }
            }}
            className={`AppHyperLink ${
              !canViewMaterialKits ? "disabled-link" : ""
            }`}
            to="#"
          >
            {record.number}
          </Link>
        ),
    },
    {
      title: "Kit Name",
      dataIndex: "name",
      headerClassName: "DataGridColumn",
      width: 100,
    },
    {
      title: "Part Number",
      dataIndex: "partNumber",
      headerClassName: "DataGridColumn",
      width: 150,
      render: (text, record) => (
        <div
          className={`AppHyperLink ${!canViewParts ? "disabled-link" : ""}`}
          onClick={() => {
            if (canViewParts && record.part) {
              openPartDetailsDrawer(record?.part);
            } else if (!canViewParts) {
              Alert(
                "You do not have permission to view part details!",
                "warning"
              );
            }
          }}
        >
          {record.part?.partNumber || "---"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      headerClassName: "DataGridColumn",
      width: 140,
      render: (text, record) =>
        !record.isParent ? (
          record.status === "Pending" ? (
            <Button
              onClick={() => handleConfirmChildKit(record.id)}
              disabled={!canModifyMaterialKits}
            >
              Confirm
            </Button>
          ) : (
            <p style={{ color: "#6366F1" }}>{record.status}</p>
          )
        ) : null,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      headerClassName: "DataGridColumn",
      width: 100,
    },
    {
      title: "Location",
      dataIndex: "location",

      width: 140,
      render: (text, record) =>
        record.isParent ? (
          <p>{record.location.name}</p>
        ) : loadingLocationData ? (
          <Cliploader loading={loadingLocationData} />
        ) : (
          <Autocomplete
            value={record.location}
            onChange={async (event, newValue) => {
              if (!canModifyLocations) {
                Alert(
                  "You do not have permission to modify kit location.",
                  "warning"
                );
                return;
              }
              if (newValue && newValue.id !== record.location?.id) {
                try {
                  await updateKitLocation(record.id, newValue.id);
                  Alert("Location Updated Successfully..!", "success");
                  fetchMaterialKitData();
                } catch (error) {
                  Alert("Couldn't update Location.. Try Again", "error");
                  console.error("Error updating kit location:", error);
                }
              }
            }}
            openOnFocus
            options={locationsData}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option) => (
              <MenuItem {...props}>{option.name}</MenuItem>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                className="AdminTextFields"
                disabled={!canModifyLocations}
              />
            )}
          />
        ),
    },
    {
      title: "Assigned WO",
      dataIndex: "workOrder",
      width: 150,
      render: (text, record) =>
        record.isParent ? null : loadingWorkOrderData ? (
          <div className="loader-container">
            <Cliploader loading={loadingWorkOrderData} />
          </div>
        ) : (
          <div className="MKAssignedWO">
            <Link
              className={`AppHyperLink ${
                !canViewWorkOrders || !record?.workOrder?.id
                  ? "disabled-link"
                  : ""
              }`}
              to={
                canViewWorkOrders && record?.workOrder?.id
                  ? `/WorkOrders/${record?.workOrder?.number}/Details/${record?.workOrder?.id}`
                  : "#"
              }
              onClick={(e) => {
                if (!canViewWorkOrders || !record?.workOrder?.id) {
                  e.preventDefault();
                  Alert(
                    "You do not have permission to view work order details!",
                    "warning"
                  );
                }
              }}
            >
              {record?.workOrder?.number}
            </Link>
            {record.status === "Assigned" &&
            record?.workOrder?.status === "Pending" ? (
              <div>
                <ion-icon
                  name="pencil-outline"
                  onClick={() => {
                    if (!canAssignWorkOrder) {
                      Alert(
                        "You do not have permission to edit assigned work orders.",
                        "warning"
                      );
                      return;
                    }
                    handleWorkOrder(record);
                  }}
                  class={!canAssignWorkOrder ? "IonIconDisabled" : undefined}
                ></ion-icon>

                <ion-icon
                  name="trash-outline"
                  onClick={() => {
                    if (!canModifyWorkOrders) {
                      Alert(
                        "You do not have permission to unassign work orders.",
                        "warning"
                      );
                      return;
                    }
                    handleRemoveWorkOrder(record?.workOrder?.id);
                  }}
                  class={!canModifyWorkOrders ? "IonIconDisabled" : undefined}
                ></ion-icon>
              </div>
            ) : record.status === "Confirmed" ? (
              <Button
                onClick={() => handleWorkOrder(record)}
                disabled={!canAssignWorkOrder}
              >
                Assign
              </Button>
            ) : null}
          </div>
        ),
    },
  ];
  return (
    <div className="AdminChildren">
      <div className="AdminChildren">
        <p className="PageHeader">Material Kits</p>
        <div className="MaterialkitHeader">
          <input
            type="search"
            className="SearchBar"
            placeholder="Search Here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            onClick={() => {
              if (canModifyMaterialKits) {
                setCreateMaterialKitDrawerStatus(true);
              } else {
                Alert(
                  "You do not have permission to create new material kits.",
                  "warning"
                );
              }
            }}
            disabled={!canModifyMaterialKits}
          >
            + Add New
          </Button>
        </div>
        <div className="AntTableDiv">
          <Table
            className="AntTable"
            columns={columns}
            dataSource={filteredMaterialKitsData}
            expandable={{
              defaultExpandAllRows: false,
            }}
            pagination={false}
            loading={{
              spinning: loadingData,
              indicator: <ClipLoader color={"#4F46E5"}></ClipLoader>,
            }}
            scroll={{
              y: "calc(100vh - 220px)",
            }}
          />
        </div>
      </div>
      <ResizableDrawer
        anchor="right"
        open={createMaterialKitDrawerStatus}
        onClose={() => setCreateMaterialKitDrawerStatus(false)}
      >
        <NewMaterialKit
          setMainLocationLoadingData={setLoadingData}
          handleCloseClick={handleCloseClick}
          handleRefresh={handleRefresh}
          fetchMaterialKitData={fetchMaterialKitData}
          MaterialKitsData={materialKitsData}
          setCreateMaterialKitDrawerStatus={setCreateMaterialKitDrawerStatus}
        />
      </ResizableDrawer>
      <ResizableDrawer
        anchor="right"
        open={childKitDataDrawer}
        onClose={() => setChildKitDataDrawer(false)}
      >
        <ChildKitData
          childKitData={selectedKit}
          materialKitData={materialKitsData.find(
            (item) => item.id === selectedMaterialKitId
          )}
          setChildKitDataDrawer={setChildKitDataDrawer}
          fetchMaterialKitData={fetchMaterialKitData}
          openPartDetailsDrawer={openPartDetailsDrawer}
        />
      </ResizableDrawer>
      <ResizableDrawer
        anchor="right"
        open={workOrderDrawerStatus}
        onClose={() => setWorkOrderDrawerStatus(false)}
      >
        <KitWorkOrder
          editWorkOrder={editWorkOrder}
          fetchMaterialKitData={fetchMaterialKitData}
          setWorkOrderDrawerStatus={setWorkOrderDrawerStatus}
          selectedKitData={selectedKit}
        />
      </ResizableDrawer>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default MaterialKits;
