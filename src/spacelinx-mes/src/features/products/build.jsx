import React, { useEffect, useState, useContext } from "react";
import {
  createBuild,
  fetchBuildWithProductId,
} from "../../services/buildService";
import { TextField, Button, Accordion, AccordionDetails } from "@mui/material";
import dayjs from "dayjs";
import "./product.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { fetchGetBuildWorkOrders } from "../../services/WorkOrderPackage";
import Cliploader from "../../Components/Loaders/Cliploader";
import { fetchPartWithPartId } from "../../services/partService";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { useLocation } from "react-router-dom";

const Build = ({ selectedProductId, selectedProductPartId }) => {
  const Location = useLocation();
  const { Alert } = useContext(AlertsContext);
  const [buildData, setBuildData] = useState([]);
  const [filteredBuildData, setFilteredBuildData] = useState([]);
  const [buildName, setBuildName] = useState("");
  const [buildQuantity, setBuildQuantity] = useState("");
  const [partData, setPartData] = useState(null);
  const [startDate, setStartDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs());
  const [workOrderData, setWorkOrderData] = useState([]);
  const [guideId, setGuideId] = useState("");
  const [expandedRows, setExpandedRows] = useState([]);
  const [isCreateBuildOpen, setIsCreateBuildOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [buildLoadingData, setBuildLoadingData] = useState(true);
  const [buildNameError, setbuildNameError] = useState("");
  const [buildQuantityError, setbuildQuantityError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const toggleCreateBuildAccordion = () => {
    setIsCreateBuildOpen(!isCreateBuildOpen);
  };

  useEffect(() => {
    if (selectedProductPartId) {
      fetchPartsData();
    }
  }, [selectedProductPartId]);

  useEffect(() => {
    if (selectedProductId) {
      setLoadingData(true);
      fetchBuildData();
    }
  }, [partData, selectedProductId]);

  useEffect(() => {
    setFilteredBuildData(
      buildData.filter((build) => {
        const buildNumber = build.number
          ? build.number.toString().toLowerCase()
          : "";
        const buildName = build.name ? build.name.toLowerCase() : "";
        const partName =
          build.partRef && build.partRef.name
            ? build.partRef.name.toLowerCase()
            : "";
        const partNumber =
          build.partRef && build.partRef.number
            ? build.partRef.number.toLowerCase()
            : "";
        const status = build.status ? build.status.toLowerCase() : "";
        const technician = build.technician
          ? build.technician.toLowerCase()
          : "";
        const quantity = build.quantity
          ? build.quantity.toString().toLowerCase()
          : "";
        const dueDate = build.endDate
          ? dayjs(build.endDate).format("YYYY-MM-DD").toLowerCase()
          : "";

        const searchValue = searchQuery.toLowerCase();

        return (
          buildNumber.includes(searchValue) ||
          buildName.includes(searchValue) ||
          partName.includes(searchValue) ||
          partNumber.includes(searchValue) ||
          status.includes(searchValue) ||
          technician.includes(searchValue) ||
          quantity.includes(searchValue) ||
          dueDate.includes(searchValue)
        );
      })
    );
  }, [searchQuery, buildData]);

  const fetchBuildData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchBuildWithProductId(selectedProductId);
      if (data) {
        const buildsWithData = data.map((build) => {
          const partRef = partData
            ? { id: partData.id, name: partData.name, number: partData.number }
            : null;
          return { ...build, partRef };
        });
        setBuildData(buildsWithData);
      }
    } catch (error) {
      console.log(error);
      Alert("Couldn't fetch Build data...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPartsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPartWithPartId(selectedProductPartId);
      if (data) {
        setPartData(data);
        setGuideId(data.guideId);
      }
    } catch (error) {
      console.log(error);
      Alert("Couldn't fetch Part Data...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchWorkOrderData = async (id) => {
    setBuildLoadingData(true);
    try {
      const fetchData = await fetchGetBuildWorkOrders(id);
      if (fetchData) {
        setWorkOrderData(fetchData);
        setBuildLoadingData(false);
      }
    } catch (error) {
      console.log(error);
      Alert("Couldn't fetch Workorders...!", "error");
    } finally {
      setBuildLoadingData(false);
    }
  };

  const validateCreatebuildFields = () => {
    let valid = true;

    if (buildName) {
      if (!buildName) {
        setbuildNameError(
          "Build name should only contain letters, spaces, and numbers."
        );
        valid = false;
      } else {
        setbuildNameError("");
      }
    }

    if (!buildQuantity) {
      setbuildQuantityError("Build quantity is required.");
      valid = false;
    } else if (!/^\d+$/.test(buildQuantity)) {
      setbuildQuantityError("Only numbers are allowed for build quantity.");
      valid = false;
    } else {
      setbuildQuantityError("");
    }

    return valid;
  };

  const handleCancelClick = () => {
    setBuildName("");
    setBuildQuantity("");
    setStartDate(dayjs());
    setDueDate(dayjs());
    setbuildNameError("");
    setbuildQuantityError("");
    toggleCreateBuildAccordion();
  };

  const handleBuildButtonClick = async () => {
    if (!buildName || !buildQuantity) {
      console.error("Please fill in all required fields.");
      setbuildNameError("Build name is required ");
      setbuildQuantityError("Build quantity is required.");
      return;
    }

    if (!startDate) {
      console.error("Please enter the start date.");
      return;
    }
    if (!validateCreatebuildFields()) {
      return;
    }
    setbuildNameError("");
    setbuildQuantityError("");
    setLoadingData(true);
    toggleCreateBuildAccordion();
    const newBuild = {
      name: buildName,
      quantity: parseInt(buildQuantity),
      startDate: startDate.format(),
      endDate: dueDate.format(),
      productId: selectedProductId,
      partId: selectedProductPartId,
    };

    try {
      const createdBuild = await createBuild(newBuild);
      fetchBuildData();
      setBuildName("");
      setBuildQuantity("");
      setStartDate(dayjs());
      setDueDate(dayjs());
      Alert("Created Build Successfully..!", "success");
    } catch (error) {
      Alert("Couldn't Create Build...!", "error");
      console.error("Error creating build:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const toggleRowAccordion = (rowId) => {
    setExpandedRows((prevExpandedRows) => {
      if (prevExpandedRows.includes(rowId)) {
        return prevExpandedRows.filter((id) => id !== rowId);
      } else {
        return [rowId];
      }
    });
  };

  return (
    <div className="BuildFlyoutBody">
      <Accordion
        expanded={isCreateBuildOpen}
        sx={{ margin: "0px", boxShadow: "none" }}
      >
        <div className="BuildTaskBodyHeader">
          <input
            type="search"
            className="SearchBar"
            placeholder="Search Here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {Location?.pathname === "/product" ? (
            loadingData ? null : (
              <ion-icon
                name={
                  isCreateBuildOpen
                    ? "remove-circle-outline"
                    : "add-circle-outline"
                }
                onClick={() => {
                  if (!guideId) {
                    Alert("Selected Part Guide Not Available..!", "error");
                  } else {
                    toggleCreateBuildAccordion();
                  }
                }}
              ></ion-icon>
            )
          ) : null}
        </div>
        <AccordionDetails className="accordion">
          <p className="CreateBuild">Create Build</p>{" "}
          <div className="builddata">
            <TextField
              label="Build Name"
              variant="standard"
              value={buildName}
              sx={{ width: 200 }}
              onChange={(e) => {
                setBuildName(e.target.value);
                setbuildNameError("");
              }}
              error={!!buildNameError && !buildName}
              helperText={buildNameError}
            />
            <TextField
              label="Build Quantity"
              variant="standard"
              sx={{ width: 200 }}
              value={buildQuantity}
              onChange={(e) => {
                setBuildQuantity(e.target.value);
                setbuildQuantityError("");
              }}
              error={!!buildQuantityError}
              helperText={buildQuantityError}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(date) => setStartDate(date)}
              />
              <DatePicker
                label="Due Date"
                value={dueDate}
                minDate={startDate}
                onChange={(date) => setDueDate(date)}
              />
            </LocalizationProvider>
          </div>
          <div className="CreateBuildButton">
            <Button variant="outlined" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button
              variant="contained"
              className="AddButton"
              onClick={handleBuildButtonClick}
              disabled={loadingData}
            >
              Create
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      <div className="build">
        {loadingData ? (
          <div className="Build-loader-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Number</th>
                <th>Name</th>
                <th>Part Name</th>
                <th>Part Number</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Technician</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuildData.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => {
                      toggleRowAccordion(row.id);
                      fetchWorkOrderData(row.id);
                    }}
                  >
                    <td>
                      <ion-icon
                        name={
                          expandedRows.includes(row.id)
                            ? "chevron-down-outline"
                            : "chevron-forward-outline"
                        }
                      ></ion-icon>
                    </td>
                    <td>{row.number}</td>
                    <td>{row.name}</td>
                    <td>{row.partRef ? row.partRef.name : ""}</td>
                    <td>{row.partRef ? row.partRef.number : ""}</td>
                    <td>{row.status}</td>
                    <td>{row.quantity}</td>
                    <td>{row.technician ? row.technician : "N/A"}</td>
                    <td>{dayjs(row.endDate).format("YYYY-MM-DD")}</td>
                  </tr>
                  {expandedRows.includes(row.id) && (
                    <>
                      {buildLoadingData ? (
                        <tr key={row.id}>
                          <td colSpan={9} style={{ textAlign: "center" }}>
                            <ClipLoader
                              color={"#4F46E5"}
                              loading={buildLoadingData}
                              size={30}
                              aria-label="Loading Spinner"
                              data-testid="loader"
                            />
                          </td>
                        </tr>
                      ) : (
                        workOrderData.map((workOrder) => (
                          <tr key={workOrder.id}>
                            <td></td>
                            <td>
                              <a
                                href={`manufacturingOrderDetails/${workOrder.id}`}
                              >
                                {workOrder.number}
                              </a>
                            </td>
                            <td>{workOrder.name}</td>
                            <td>{workOrder.part ? workOrder.part.name : ""}</td>
                            <td>
                              {workOrder.part ? workOrder.part.number : ""}
                            </td>
                            <td>{workOrder.status}</td>
                            <td>{workOrder.quantity}</td>
                            <td className="left-aligned-cell">
                              {workOrder.technician
                                ? `${workOrder.technician.firstName} ${workOrder.technician.lastName}`
                                : "N/A"}
                            </td>
                            <td>
                              {dayjs(workOrder.endDate).format("YYYY-MM-DD")}
                            </td>
                          </tr>
                        ))
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default Build;
