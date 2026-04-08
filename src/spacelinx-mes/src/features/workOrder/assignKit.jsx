import React, { useEffect, useState, useContext } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {
  fetchChildkitofParts,
  fetchKits,
  updateConfirmKit,
} from "../../services/childKitService";
import { updateAssignKit } from "../../services/WOrderService";
import { fetchWorkPackage } from "../../services/WorkOrderPackage";
import { Link } from "react-router-dom";
import { AlertsContext } from "../AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import { HomeAlerts } from "../AlertsContext/Alerts";
import Cliploader from "../../Components/Loaders/Cliploader";

const AssignKit = ({
  handleCloseClick,
  workOrderData,
  handleRefresh,
  setMainMOrderLoadingData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [kitsData, setKitsData] = useState([]);
  const [editKitData, setEditKitData] = useState([]);
  const [selectedKit, setSelectedKit] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  useEffect(() => {
    allKitsData();
  }, [workOrderData]);
  const allKitsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchKits();
      if (data?.length > 0) {
        const filteredData = data?.filter(
          (kit) => kit.part.id === workOrderData?.partId
        );
        const sortedData = filteredData.sort((a, b) => {
          if (a.workOrder && !b.workOrder) return 1;
          if (!a.workOrder && b.workOrder) return -1;
          return 0;
        });
        setKitsData(sortedData.filter((item) => item.workOrder === null));
        if (workOrderData.kit) {
          setEditKitData(
            sortedData.find((kit) => kit.id === workOrderData.kit.id)
          );
        }
      } else {
        setKitsData([]);
      }
      setLoadingData(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };
  const handleAssign = async () => {
    setLoadingData(true);
    try {
      if (selectedChildKit) {
        await updateAssignKit(workOrderData.id, selectedChildKit.id);
        handleCloseClick();
        Alert("Kit Assigned Successfully...!", "success");
        fetchWorkOrderData();
      } else {
        console.warn("No kit selected");
      }
    } catch (error) {
      Alert("Couldn't Assigned Kit - Please Try Again...!", "error");
      console.error("Error assigning kit:", error);
    } finally {
      setLoadingData(false);
    }
  };
  const handleConfirmKit = async () => {
    setLoadingData(true);
    try {
      await updateConfirmKit(editKitData.id);
      Alert(`${editKitData.number} is Confirmed...`, "success");
      allKitsData();
      setSelectedKit((prevKitData) => ({
        ...prevKitData,
        status: "Confirmed",
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };
  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "5px" }}>
          {selectedKit ? <p>Edit Kit</p> : "Assign Kit"}
        </h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="add-outline" style={{ rotate: "45deg" }}></ion-icon>
        </button>
      </div>
      <div className="CreateFlyoutBody">
        <h2>Kits:</h2>
        {loadingData ? (
          <Cliploader loading={loadingData} />
        ) : kitsData.length >= 1 ? (
          <>
            <Autocomplete
              options={kitsData}
              getOptionLabel={(option) => option.number}
              value={selectedKit || selectedKit}
              onChange={(event, newValue) => {
                if (newValue.status === "Open") {
                  setSelectedKit(null);
                  Alert("The Selected Kit is not Confirmed Yet..!", "error");
                } else {
                  setSelectedKit(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Assign Kit" variant="outlined" />
              )}
              renderOption={(props, option) => (
                <MenuItem
                  {...props}
                  sx={{
                    color: option.status === "Open" ? "grey" : "blue",
                  }}
                >
                  {`${option.number} - ${option.name}`}
                </MenuItem>
              )}
            />
            {selectedKit?.status === "Pending" ? (
              <Button
                className="MaterialKitsConfirmButton"
                onClick={handleConfirmKit}
                disabled={loadingData}
              >
                Confirm Kit
              </Button>
            ) : null}
          </>
        ) : (
          <p style={{ color: "red" }}>
            No Kits Available with this Part...{" "}
            <Link to="/materialkits" style={{ color: "blue" }}>
              Click to Navigate
            </Link>
          </p>
        )}
      </div>
      <div className="CreateFlyoutFooter">
        <Button
          onClick={handleCloseClick}
          color="error"
          variant="contained"
          className="CancelButton"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          className="CreateButton"
          color="primary"
          disabled={loadingData}
        >
          Assign
        </Button>
      </div>{" "}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default AssignKit;
