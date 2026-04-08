import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Tab } from "@mui/material";
import "../../ProgramManagement/ProgramManagement.css";
import Autocomplete from "@mui/material/Autocomplete";
import { AlertsContext } from "../../AlertsContext/Context";
import { updateProgram } from "../../../services/programService";
import { fetchCustomerLookUp } from "../../../services/customerService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { createProgram } from "../../../services/programService";
import { MenuItem } from "@mui/material";
import { fetchLinkedProjects } from "../../../services/programService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const EditProgram = ({
  handleCloseClick,
  handleRefresh,
  selectedProgram,
  loadingStaff,
  staffList,
  customers,
  loadingCustomers,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [startDate, setStartDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs());
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [linkedProjects, setLinkedProjects] = useState([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("programColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          description: false,
          startDate: false,
          endDate: false,
        };
  });

  const [formData, setFormData] = useState({
    programCode: "",
    name: "",
    description: "",
    customerId: "",
    programManagerId: "",
    supplyChainManagerId: "",
    buyerId: "",
    startDate: "",
    endDate: "",
    goals: "",
    budget: "",
    actualSpend: "",
    status: "",
  });

  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedProgram) {
      const data = {
        programCode: selectedProgram.programCode || "",
        name: selectedProgram.name || "",
        description: selectedProgram.description || "",
        customerId: selectedProgram.customerId || "",
        programManagerId: selectedProgram.programManagerId || "",
        supplyChainManagerId: selectedProgram.supplyChainManagerId || "",
        buyerId: selectedProgram.buyerId || "",
        goals: selectedProgram.goals || "",
        budget: selectedProgram.budget || 0,
        actualSpend: selectedProgram.actualSpend || 0,
        status: selectedProgram.status || "",
        startDate: startDate ? startDate.toISOString() : null,
        endDate: dueDate ? dueDate.toISOString() : null,
      };

      setFormData(data);
      setInitialData(data);

      const matchingCustomer = customers.find(
        (c) => c.id === selectedProgram.customerId,
      );
      setSelectedCustomer(matchingCustomer || null);

      setLoadingData(false);
    }
  }, [selectedProgram, customers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateFields = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.programCode.trim()) {
      newErrors.programCode = "Program Code is required";
      valid = false;
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const hasFormChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    if (!hasFormChanged()) {
      Alert("No changes detected", "warning");
      return;
    }

    if (!selectedProgram?.id) {
      Alert("Missing Program ID", "error");
      return;
    }

    try {
      setLoadingData(true);
      await updateProgram(selectedProgram.id, formData);
      Alert("Program updated successfully!", "success");
      handleCloseClick();
      await handleRefresh();
    } catch (error) {
      console.error("Error updating program:", error);
      Alert("Failed to update program. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
  };

  const projectColumns = [
    {
      field: "projectCode",
      headerName: "Project Code",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleDateString() : "",
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      valueFormatter: ({ value }) =>
        value ? new Date(value).toLocaleDateString() : "",
    },
    {
      field: "programName",
      headerName: "Program Name",
      flex: 1,
      valueGetter: (_value, row) => row?.name || "",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "budget",
      headerName: "Budget",
      flex: 1,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProgram?.id) return;

      try {
        const response = await fetchLinkedProjects(selectedProgram.id);
        setLinkedProjects(response.projects || []);
      } catch (error) {
        console.error("Failed to fetch linked projects", error);
      }
    };

    fetchData();
  }, [selectedProgram]);

  const editFlyoutTabChange = (event, newValue) => {
    setEditFlyOutTabsValue(newValue);
    if (newValue === "1") {
      setReadOnlyMode(true);
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>Edit Program</h3>
        <div className="EditFlyoutHeaderIcons">
          {editFlyOutTabsValue === "1" && (
            <button onClick={() => setReadOnlyMode(false)}>
              <ion-icon name="create-outline"></ion-icon>
            </button>
          )}

          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      <TabContext value={editFlyOutTabsValue}>
        <div className="EditFlyoutTabsPanel">
          <TabList
            centered
            onChange={editFlyoutTabChange}
            aria-label="lab API tabs example"
            variant="fullWidth"
          >
            <Tab label="Details" value="1" />
            <Tab label="Linked Projects" value="2" />
            <Tab label="Milestones" value="3" />
          </TabList>
        </div>
        <TabPanel value="1" sx={{ padding: "0px" }}>
          {loadingData ? (
            <div className="loader-container">
              <Cliploader loading={loadingData} />
            </div>
          ) : (
            <div
              className={
                !readOnlyMode
                  ? "EditFlyoutContentWithProgram"
                  : "EditFlyoutBody"
              }
            >
              <div className="TwoColumnGrid2">
                <TextField
                  label="Program Code"
                  name="programCode"
                  value={formData.programCode}
                  onChange={handleInputChange}
                  error={!!errors.programCode}
                  helperText={errors.programCode}
                  InputProps={{ readOnly: true }}
                  className="AdminTextFeilds"
                />

                <TextField
                  label="Program Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{ readOnly: readOnlyMode }}
                  className="AdminTextFeilds"
                />

                <Autocomplete
                  options={customers}
                  loading={loadingCustomers}
                  loadingText="Loading Customers ..."
                  getOptionLabel={(option) => option.name || ""}
                  value={selectedCustomer}
                  onChange={(event, newValue) => {
                    setSelectedCustomer(newValue);
                    setFormData({
                      ...formData,
                      customerId: newValue?.id || "",
                    });
                    setErrors({ ...errors, customerId: "" });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer Name"
                      error={!!errors.customerId}
                      helperText={errors.customerId}
                      className="AdminTextFeilds"
                    />
                  )}
                  readOnly={readOnlyMode}
                />

                <Autocomplete
                  options={staffList}
                  loading={loadingStaff}
                  loadingText="Loading Program Manager ..."
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}` || ""
                  }
                  value={
                    staffList.find((s) => s.id === formData.programManagerId) ||
                    null
                  }
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      programManagerId: newValue?.id || "",
                    });
                    setErrors({ ...errors, programManagerId: "" });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Program Manager"
                      error={!!errors.programManagerId}
                      helperText={errors.programManagerId}
                      className="AdminTextFeilds"
                    />
                  )}
                  readOnly={readOnlyMode}
                />

                <Autocomplete
                  options={staffList}
                  loading={loadingStaff}
                  loadingText="Loading Supply Chain Manager ..."
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}` || ""
                  }
                  value={
                    staffList.find(
                      (s) => s.id === formData.supplyChainManagerId,
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      supplyChainManagerId: newValue?.id || "",
                    });
                    setErrors({ ...errors, supplyChainManagerId: "" });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supply Chain Manager"
                      error={!!errors.supplyChainManagerId}
                      helperText={errors.supplyChainManagerId}
                      className="AdminTextFeilds"
                    />
                  )}
                  readOnly={readOnlyMode}
                />

                <Autocomplete
                  options={staffList}
                  loading={loadingStaff}
                  loadingText="Loading Buyer ..."
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}` || ""
                  }
                  value={
                    staffList.find((s) => s.id === formData.buyerId) || null
                  }
                  onChange={(event, newValue) => {
                    setFormData({
                      ...formData,
                      buyerId: newValue?.id || "",
                    });
                    setErrors({ ...errors, buyerId: "" });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buyer"
                      error={!!errors.buyerId}
                      helperText={errors.buyerId}
                      className="AdminTextFeilds"
                    />
                  )}
                  readOnly={readOnlyMode}
                />

                <TextField
                  label="Budget (in ₹)"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                  error={!!errors.budget}
                  helperText={errors.budget}
                  InputProps={{
                    readOnly: readOnlyMode,
                    inputProps: { min: 0 },
                  }}
                  className="AdminTextFeilds"
                />

                <TextField
                  label="Actual Spend (in ₹)"
                  name="actualSpend"
                  type="number"
                  value={formData.actualSpend}
                  onChange={handleInputChange}
                  error={!!errors.actualSpend}
                  helperText={errors.actualSpend}
                  InputProps={{
                    readOnly: readOnlyMode,
                    inputProps: { min: 0 },
                  }}
                  className="AdminTextFeilds"
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    readOnly={readOnlyMode}
                  />
                  <DatePicker
                    label="Due Date"
                    value={dueDate}
                    minDate={startDate}
                    onChange={(newValue) => setDueDate(newValue)}
                    readOnly={readOnlyMode}
                  />
                </LocalizationProvider>

                <TextField
                  select
                  label="Status"
                  className="AdminTextFeilds"
                  fullWidth
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    });
                    setErrors({ ...errors, status: "" });
                  }}
                  value={formData.status}
                  error={!!errors.status}
                  InputProps={{ readOnly: readOnlyMode }}
                >
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>

                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  InputProps={{ readOnly: readOnlyMode }}
                  className="AdminTextFeilds"
                />

                <div className="description">
                  <TextField
                    label="Goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleInputChange}
                    error={!!errors.goals}
                    helperText={errors.goals}
                    InputProps={{ readOnly: readOnlyMode }}
                    multiline
                    rows={3}
                    className="AdminTextFeilds"
                  />
                </div>
              </div>
            </div>
          )}

          {!readOnlyMode && (
            <div className="CreateFlyoutFooter">
              <div className="update-reset">
                <Button className="CancelButton" onClick={handleReset}>
                  Reset
                </Button>
                <Button onClick={handleSubmit}>Update</Button>
              </div>
            </div>
          )}
        </TabPanel>
        <TabPanel value="2" sx={{ padding: "1rem" }}>
          <div style={{ height: 400, width: "100%" }}>
            <StyledDataGrid
              rows={linkedProjects}
              columns={projectColumns}
              getRowId={(row) => row.id}
              pageSize={5}
              rowsPerPageOptions={[5]}
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => {
                setColumnVisibilityModel(newModel);
                localStorage.setItem(
                  "programColumnVisibility",
                  JSON.stringify(newModel),
                );
              }}
            />
          </div>
        </TabPanel>

        <TabPanel value="3" sx={{ padding: "1rem" }}>
          <p>Milestones content goes here.</p>
        </TabPanel>
      </TabContext>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditProgram;
