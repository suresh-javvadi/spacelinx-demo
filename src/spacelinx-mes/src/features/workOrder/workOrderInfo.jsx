import {
  Autocomplete,
  Tab,
  Button,
  Divider,
  MenuItem,
  TextField,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import dayjs from "dayjs";
import React, { useContext, useEffect, useState } from "react";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { fetchKits, updateConfirmKit } from "../../services/childKitService";
import { fetchUsers } from "../../services/userService";
import {
  completeWorkOrder,
  updateWorkOrder,
} from "../../services/WOrderService";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Link } from "react-router-dom";
import { fetchProductsLookup } from "../../services/productService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import Documents from "../../Components/Documents/Documents";

const WorkOrderInfo = ({
  workOrderDetailsDrawerStatus,
  assignKit,
  assignProduct,
  assignManager,
  assignTechnician,
  handleCloseClick,
  workOrderData,
  handleRefresh,
  showComplete,
}) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [kitOptions, setKitOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [editKitData, setEditKitData] = useState(workOrderData?.kit);
  const [editManagerData, setEditManagerData] = useState(
    workOrderData?.manager
  );
  const [editTechnicianData, setEditTechnicianData] = useState(
    workOrderData?.technician
  );
  const [editProductData, setEditProductData] = useState(
    workOrderData?.product
  );
  const [startDate, setStartDate] = useState(
    workOrderData.startDate ? dayjs(workOrderData.startDate) : null
  );
  const [dueDate, setDueDate] = useState(
    workOrderData.endDate ? dayjs(workOrderData.endDate) : null
  );
  const [productsData, setProductsData] = useState([]);
  const [openKitDropdown, setOpenKitDropdown] = useState(false);
  const [openProductDropdown, setOpenProductDropdown] = useState(false);
  const [openManagerDropdown, setOpenManagerDropdown] = useState(false);
  const [openTechnicianDropdown, setOpenTechnicianDropdown] = useState();
  const [workOrderTabValue, setWorkOrderTabValue] = useState("1");

  const handleWorkOrderTabChange = (event, newValue) => {
    setWorkOrderTabValue(newValue);
  };

  const handleCompleteWO = async () => {
    setLoadingData(true);
    try {
      await completeWorkOrder(workOrderData?.id);
      Alert("Work Order completed successfully!", "success");
      handleRefresh();
    } catch (error) {
      console.error("Error completing work order:", error);
      Alert("Error completing Work Order", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    setOpenKitDropdown(assignKit);
    setOpenProductDropdown(assignProduct);
    setOpenManagerDropdown(assignManager);
    setOpenTechnicianDropdown(assignTechnician);
  }, [assignKit, assignProduct, assignManager, assignTechnician]);

  useEffect(() => {
    const fetchProductsData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchProductsLookup();
        setProductsData(data);
      } catch (error) {
        console.error("Error fetching products data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchProductsData();
  }, []);

  useEffect(() => {
    allKitsData();
  }, [workOrderData]);

  const allKitsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchKits();
      if (data?.length > 0) {
        const filteredData = data.filter(
          (kit) => kit.part.id === workOrderData?.partId
        );
        const sortedData = filteredData.sort((a, b) => {
          if (a.workOrder && !b.workOrder) return 1;
          if (!a.workOrder && b.workOrder) return -1;
          return 0;
        });

        let availableKits = sortedData.filter(
          (item) => item.workOrder === null
        );

        if (workOrderData?.kit) {
          const assignedKit = filteredData.find(
            (kit) => kit.id === workOrderData.kit.id
          );

          if (assignedKit) {
            availableKits = [assignedKit, ...availableKits];
          }
        }

        setKitOptions(availableKits);
      } else {
        setKitOptions([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };
  useEffect(() => {
    if (workOrderData?.kit) {
      setEditKitData(workOrderData.kit);
    }
  }, [workOrderData]);

  useEffect(() => {
    const fetchTechniciansData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchUsers();
        if (data) {
          const filterTechnicians = data.filter((user) =>
            user.roles.some((role) => role.roleName === "Engineer/Technician")
          );
          const filterManagers = data.filter((user) =>
            user.roles.some((role) => role.roleName === "Project Manager")
          );
          setTechnicianOptions(filterTechnicians);
          setManagerOptions(filterManagers);
        } else {
          return;
        }
        setLoadingData(false);
      } catch (error) {
        Alert("Error Fetching Technicians Data", "error");
        console.error("Error fetching technicians data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchTechniciansData();
  }, [workOrderDetailsDrawerStatus]);

  const handleUpdate = async () => {
    setLoadingData(true);
    const updateWO = {
      id: workOrderData.id,
      kitId: editKitData?.id || null,
      productId: editProductData?.id || null,
      technicianId: editTechnicianData?.id || null,
      managerId: editManagerData?.id || null,
      startDate: startDate.toISOString(),
      endDate: dueDate.toISOString(),
    };
    try {
      const update = await updateWorkOrder(workOrderData.id, updateWO);
      Alert(`Updated ${workOrderData.number} Package Successfully `, "success");
      handleCloseClick();
      handleRefresh();
    } catch (error) {
      Alert("Couldn't update the WorkOrder Details..", "error");
      console.error(error);
    }
  };
  const handleConfirmKit = async () => {
    setLoadingData(true);
    try {
      await updateConfirmKit(editKitData.id);
      Alert(`${editKitData.number} is Confirmed...`, "success");
      allKitsData();
      setEditKitData((prevKitData) => ({
        ...prevKitData,
        status: "Confirmed",
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "4%" }}>{workOrderData?.number} Details</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <TabContext value={workOrderTabValue}>
        <div className="EditFlyoutTabsPanel">
          <TabList
            centered
            onChange={handleWorkOrderTabChange}
            variant="fullWidth"
          >
            <Tab label="Details" value="1" />
            {hasPermission(PERMISSIONS.WORKORDERS.DOCUMENTS.VIEW) && (
              <Tab label="Documents" value="2" />
            )}
          </TabList>
        </div>

        <TabPanel value="1" className="EditFlyoutTabPanel">
          {loadingData ? (
            <div className="loader-container">
              <Cliploader loading={loadingData} />
            </div>
          ) : (
            <>
              <div className="CreateFlyoutWoBody">
                <div className="WorkOrderFlyoutDetails">
                  <div>
                    <h2>Part Number :</h2>
                    <p>{workOrderData?.part?.partNumber}</p>
                  </div>
                  <div>
                    <h2>Part Name :</h2>
                    <p>{workOrderData?.part?.name}</p>
                  </div>
                </div>
                <Divider orientation="horizontal" flexItem />
                {workOrderData?.guideId && workOrderData?.guide ? (
                  <>
                    <div className="WorkOrderFlyoutDetails">
                      <div>
                        <h2>Guide Number :</h2>
                        <p>{workOrderData?.guide?.number}</p>
                      </div>
                      <div>
                        <h2>Guide Name :</h2>
                        <p>{workOrderData?.guide?.name}</p>
                      </div>
                    </div>
                    <Divider orientation="horizontal" flexItem />
                  </>
                ) : workOrderData?.status !== "Completed" ? (
                  <>
                    <Button
                      className="WOCompleteBtn"
                      onClick={handleCompleteWO}
                    >
                      Complete W.O
                    </Button>
                    <Divider orientation="horizontal" flexItem />
                  </>
                ) : null}

                {workOrderData.status === "Pending" ? (
                  kitOptions.length > 0 ? (
                    <Autocomplete
                      id="kit-autocomplete"
                      options={kitOptions}
                      open={openKitDropdown}
                      onOpen={() => setOpenKitDropdown(true)}
                      onClose={() => setOpenKitDropdown(false)}
                      disablePortal
                      getOptionLabel={(option) =>
                        `${option?.number || "Unknown"} - ${
                          option?.name || "No Name"
                        }`
                      }
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      renderOption={(props, option) => (
                        <MenuItem {...props}>
                          {option?.name || "No Name"} -{" "}
                          {option?.number || "Unknown"}
                        </MenuItem>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Kit"
                          variant="outlined"
                          className="AdminTextFields"
                        />
                      )}
                      value={editKitData}
                      onChange={(event, newValue) => {
                        if (newValue?.status === "Pending") {
                          Alert(
                            `This Kit is not Confirmed. Please confirm below.`,
                            "error"
                          );
                          setEditKitData(newValue);
                        } else if (
                          newValue?.workOrder === null ||
                          newValue?.workOrder?.id === workOrderData?.id
                        ) {
                          setEditKitData(newValue);
                        } else {
                          setEditKitData(null);
                          Alert(
                            `This Kit is already assigned to ${newValue.workOrder?.number}`,
                            "error"
                          );
                        }
                      }}
                    />
                  ) : (
                    <div className="NoKitAvailable">
                      <p>
                        No Kit available...
                        {hasPermission(PERMISSIONS.WORKORDERS.ASSIGN_KIT) ? (
                          <Link to="/materialkits">Create one?</Link>
                        ) : (
                          <span>
                            (You don't have permission to create a kit)
                          </span>
                        )}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="WorkOrderFlyoutDetails">
                    <div>
                      <h2>Kit Number:</h2>
                      <p>{workOrderData?.kit?.number || "N/A"}</p>
                    </div>
                    <div>
                      <h2>Kit Name:</h2>
                      <p>{workOrderData?.kit?.name || "N/A"}</p>
                    </div>
                  </div>
                )}

                {editKitData?.status === "Pending" ? (
                  <Button
                    className="MaterialKitsConfirmButton"
                    onClick={handleConfirmKit}
                    disabled={loadingData}
                  >
                    Confirm Kit
                  </Button>
                ) : null}
                {hasPermission(PERMISSIONS.WORKORDERS.ASSIGN_PRODUCT) ? (
                  <Autocomplete
                    value={editProductData || null}
                    fullWidth
                    options={productsData}
                    open={openProductDropdown}
                    onOpen={() => setOpenProductDropdown(true)}
                    onClose={() => setOpenProductDropdown(false)}
                    disablePortal
                    getOptionLabel={(option) =>
                      `${option?.number} - ${option?.name}`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => (
                      <MenuItem {...props}>
                        {option?.number} - {option?.name}
                      </MenuItem>
                    )}
                    onChange={(event, newValue) => {
                      setEditProductData(newValue);
                    }}
                    disableClearable={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        className="AdminTextFields"
                        label="Product"
                      />
                    )}
                  />
                ) : (
                  <Autocomplete
                    value={editProductData || null}
                    fullWidth
                    options={productsData}
                    open={openProductDropdown}
                    onOpen={() => setOpenProductDropdown(true)}
                    onClose={() => setOpenProductDropdown(false)}
                    disablePortal
                    getOptionLabel={(option) =>
                      `${option?.number} - ${option?.name}`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderOption={(props, option) => (
                      <MenuItem {...props}>
                        {option?.number} - {option?.name}
                      </MenuItem>
                    )}
                    onChange={() => {}}
                    disableClearable={true}
                    disabled={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        className="AdminTextFields"
                        label="Product"
                        disabled
                      />
                    )}
                  />
                )}
                {workOrderData.status === "Pending" ? (
                  <Autocomplete
                    value={editManagerData}
                    disabled={workOrderData.status !== "Pending"}
                    id="manager-autocomplete"
                    options={managerOptions}
                    open={openManagerDropdown}
                    onOpen={() => setOpenManagerDropdown(true)}
                    onClose={() => setOpenManagerDropdown(false)}
                    disablePortal
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    getOptionLabel={(option) =>
                      `${option.firstName} ${option.lastName}`
                    }
                    renderOption={(props, option) => (
                      <MenuItem {...props}>
                        {option.firstName} - {option.lastName}
                      </MenuItem>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Manager"
                        variant="outlined"
                        className="AdminTextFeilds"
                      />
                    )}
                    onChange={(event, newValue) => {
                      setEditManagerData(newValue);
                    }}
                  />
                ) : (
                  <>
                    <Divider orientation="horizontal" flexItem />
                    <div className="WorkOrderFlyoutDetails">
                      <div>
                        <h2>Manager Name :</h2>
                        <p>
                          {workOrderData?.manager?.firstName}
                          {workOrderData?.manager?.lastName}
                        </p>
                      </div>
                      <div>
                        <h2> Email :</h2>
                        <p>{workOrderData?.manager?.email}</p>
                      </div>
                    </div>
                  </>
                )}

                {workOrderData.status === "Pending" ? (
                  hasPermission(PERMISSIONS.WORKORDERS.ASSIGN_TECHNICIAN) ? (
                    <Autocomplete
                      value={editTechnicianData}
                      fullWidth
                      options={technicianOptions}
                      open={openTechnicianDropdown}
                      onOpen={() => setOpenTechnicianDropdown(true)}
                      onClose={() => setOpenTechnicianDropdown(false)}
                      disablePortal
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      getOptionLabel={(option) =>
                        `${option?.firstName || ""} ${
                          option?.lastName || ""
                        }`.trim()
                      }
                      renderOption={(props, option) => (
                        <MenuItem {...props} key={option.id}>
                          {option?.firstName || ""} {option?.lastName || ""}
                        </MenuItem>
                      )}
                      onChange={(event, newValue) => {
                        setEditTechnicianData(newValue);
                      }}
                      disableClearable={true}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          className="AdminTextFields"
                          label="Technician"
                        />
                      )}
                    />
                  ) : (
                    <Autocomplete
                      value={editTechnicianData}
                      fullWidth
                      options={technicianOptions}
                      disablePortal
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      getOptionLabel={(option) =>
                        `${option?.firstName || ""} ${
                          option?.lastName || ""
                        }`.trim()
                      }
                      renderOption={(props, option) => (
                        <MenuItem {...props} key={option.id}>
                          {option?.firstName || ""} {option?.lastName || ""}
                        </MenuItem>
                      )}
                      onChange={() => {}} // blocked
                      disableClearable={true}
                      disabled
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          className="AdminTextFields"
                          label="Technician"
                          disabled
                        />
                      )}
                    />
                  )
                ) : null}

                <>
                  <Divider orientation="horizontal" flexItem />
                  <div className="WorkOrderFlyoutDetails">
                    <div>
                      <h2>Technician Name :</h2>
                      <p>
                        {`${workOrderData?.technician?.firstName || ""} ${
                          workOrderData?.technician?.lastName || ""
                        }`.trim()}
                      </p>
                    </div>
                    <div>
                      <h2>Email :</h2>
                      <p>{workOrderData?.technician?.email || "N/A"}</p>
                    </div>
                  </div>
                </>

                <Divider orientation="horizontal" flexItem />
                <div className="WorkOrderFlyoutDetails">
                  <div>
                    <h2>Started On:</h2>
                    <p>
                      {workOrderData?.actualStartDate
                        ? dayjs(workOrderData.actualStartDate).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h2>Completed On:</h2>
                    <p>
                      {workOrderData?.actualEndDate
                        ? dayjs(workOrderData.actualEndDate).format(
                            "MMM D, YYYY h:mm A"
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <Divider orientation="horizontal" flexItem />
                <div className="WorkOrderFlyoutDetails">
                  {workOrderData.status === "Pending" ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(date) => {
                          setStartDate(date);
                        }}
                        minDate={dayjs().startOf("day")}
                        renderInput={(params) => <TextField {...params} />}
                      />
                      <DatePicker
                        label="Due Date"
                        value={dueDate}
                        onChange={(date) => {
                          setDueDate(date);
                        }}
                        minDate={dayjs().startOf("day")}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  ) : (
                    <>
                      <div>
                        <h2>Planned Start Date:</h2>
                        <p>
                          {workOrderData?.startDate
                            ? dayjs(workOrderData.startDate).format(
                                "MMM D, YYYY h:mm A"
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h2>Due Date:</h2>
                        <p>
                          {workOrderData?.endDate
                            ? dayjs(workOrderData.endDate).format(
                                "MMM D, YYYY h:mm A"
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="CreateFlyoutFooter">
                <Button
                  variant="outlined"
                  className="CancelButton"
                  onClick={handleCloseClick}
                >
                  Cancel
                </Button>
                <Button
                  className="CreateButton"
                  onClick={handleUpdate}
                  disabled={!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)}
                >
                  Update
                </Button>
              </div>
            </>
          )}
        </TabPanel>

        <TabPanel value="2" className="EditFlyoutTabPanel">
          <Documents
            entityId={workOrderData?.id}
            entityType="Workorder"
            canEdit={hasPermission(PERMISSIONS.WORKORDERS.DOCUMENTS.MODIFY)}
            canDelete={
              hasPermission(PERMISSIONS.WORKORDERS.DOCUMENTS.DELETE) &&
              workOrderData?.status !== "Completed"
            }
          />
        </TabPanel>
      </TabContext>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default WorkOrderInfo;
