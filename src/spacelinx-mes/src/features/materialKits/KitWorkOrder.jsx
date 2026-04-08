import React, { useEffect, useState, useContext } from "react";
import { Button, TextField, Autocomplete, MenuItem } from "@mui/material";
import Cliploader from "../../Components/Loaders/Cliploader";
import { Link } from "react-router-dom";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { assignWorkOrder } from "../../services/childKitService";
import { fetchWorkOrderWithPart } from "../../services/WOrderService";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";

const KitWorkOrder = ({
  editWorkOrder,
  fetchMaterialKitData,
  setWorkOrderDrawerStatus,
  selectedKitData,
}) => {
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [workOrder, setWorkOrder] = useState(null);
  const [workOrderData, setWorkOrderData] = useState([]);
  const { Alert } = useContext(AlertsContext);
  const canAssignWorkOrder = hasPermission(
    PERMISSIONS.MATERIALKITS.ASSIGN_WORKORDER
  );
  const canViewWorkOrders = hasPermission(PERMISSIONS.WORKORDERS.VIEW);

  useEffect(() => {
    if (selectedKitData) {
      fetchWorkOrderData();
    }
  }, [selectedKitData]);
  const fetchWorkOrderData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchWorkOrderWithPart(selectedKitData.partId);
      if (data) {
        const sortedData = data.sort(
          (a, b) => new Date(a.number) - new Date(b.number)
        );
        if (editWorkOrder) {
          setWorkOrder(sortedData.find((item) => item.id === editWorkOrder.id));
        }
        setWorkOrderData(sortedData);
      }
    } catch (error) {
      Alert("Error Fetching Workorder Data", "error");
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };
  const updateChildKit = async () => {
    if (!canAssignWorkOrder) {
      Alert(
        "You do not have permission to assign or modify work orders.",
        "warning"
      );
      return;
    }
    setLoadingData(true);
    try {
      await assignWorkOrder(workOrder.id, selectedKitData.id);
      Alert("Kit Assigned Successfully", "success");
      setWorkOrderDrawerStatus(false);
      fetchMaterialKitData();
    } catch (error) {
      Alert("Error Updating Assigned Work Order", "error");
      console.error("Error updating AssignWorkOrder:", error);
    } finally {
      setLoadingData(false);
    }
  };
  return (
    <div>
      <div className="EditFlyoutHeader">
        <h3>{editWorkOrder ? "Re" : ""}Assign WorkOrder</h3>
        <button
          onClick={() => {
            setWorkOrderDrawerStatus(false);
          }}
        >
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="Kitbody">
          {workOrderData?.length > 0 ? (
            <Autocomplete
              value={workOrder}
              options={workOrderData.filter(
                (option) => !option.kitId || option.kitId === selectedKitData.id
              )}
              className="AdminTextFeilds"
              onChange={(event, newValue) => {
                setWorkOrder(newValue);
              }}
              renderOption={(props, option) => (
                <MenuItem {...props}>
                  {`${option.number} - ${option.name}`}
                </MenuItem>
              )}
              getOptionLabel={(option) => `${option.number} - ${option.name}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`WorkOrder `}
                  className="AdminTextFeilds"
                  variant="standard"
                  disabled={!canAssignWorkOrder}
                />
              )}
            />
          ) : (
            <p className="NoWorkOrderMessage">
              Work Order Unavailable for the Part...
              <Link
                className={`AppHyperLink ${
                  !canViewWorkOrders ? "disabled-link" : ""
                }`}
                to={canViewWorkOrders ? "/WorkOrders" : "#"}
                onClick={(e) => {
                  if (!canViewWorkOrders) {
                    e.preventDefault();
                    Alert(
                      "You do not have permission to view work orders!",
                      "warning"
                    );
                  }
                }}
              >
                Create One.?
              </Link>
            </p>
          )}
        </div>
      )}
      <div className="KitFooter">
        <Button
          variant="outlined"
          onClick={updateChildKit}
          disabled={loadingData || !canAssignWorkOrder}
        >
          {editWorkOrder ? "Update" : "Move"}
        </Button>
      </div>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default KitWorkOrder;
