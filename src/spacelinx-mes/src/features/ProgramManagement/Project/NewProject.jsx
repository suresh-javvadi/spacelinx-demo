import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormHelperText,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import ClipLoader from "react-spinners/ClipLoader";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { createProject } from "../../../services/projectService";

const filter = createFilterOptions();

const NewProject = ({
  handleCloseClick,
  handleRefresh,
  managerRoles,
  programs,
  loadingOptionSets,
  loadingProgram,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [startDate, setStartDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs());

  const [managerRole, setManagerRole] = useState(null);
  const [technicianRole, setTechnicianRole] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    programId: "",
    programManagerId: "",
    budget: 0,
    status: "Not Started",
  });

  const [formErrors, setFormErrors] = useState({});

  const validateCreateProjectFields = () => {
    let valid = true;
    const errors = {
      name: "",
    };

    if (!formValues.name.trim()) {
      errors.name = "Name is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleCreate = async () => {
    if (!validateCreateProjectFields()) {
      Alert("Please fill all required fields correctly", "error");
      return;
    }

    const payload = {
      name: formValues.name,
      description: formValues.description || null,
      programId: selectedProgram?.id || null,
      projectManagerId: managerRole?.id || null,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: dueDate ? dueDate.toISOString() : null,
      budget: parseFloat(formValues.budget) || 0,
      status: formValues.status || "Planning",
    };

    try {
      await createProject(payload);
      Alert("Project Created Successfully!", "success");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("Error creating project:", error);
      Alert("Failed to create project!", "error");
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Project</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <ClipLoader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>
            <div className="GrnNewFlyoutContentTop">
              <div>
                <TextField
                  label="Name"
                  className="AdminTextFeilds"
                  fullWidth
                  onChange={(e) => {
                    setFormValues({ ...formValues, name: e.target.value });
                    setFormErrors({ ...formErrors, name: "" });
                  }}
                  value={formValues.name}
                  error={!!formErrors.name}
                  required
                />
                <FormHelperText error={!!formErrors.name}>
                  {formErrors.name}
                </FormHelperText>
              </div>
              <div>
                <Autocomplete
                  id="manager-autocomplete"
                  options={
                    technicianRole
                      ? managerRoles.filter(
                          (item) => item.id !== technicianRole.id,
                        )
                      : managerRoles
                  }
                  loading={loadingOptionSets}
                  loadingText="Loading Programs Manager...."
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}`
                  }
                  renderOption={(props, option) => (
                    <MenuItem {...props}>
                      {`${option.firstName} ${option.lastName}`}
                    </MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Project Manager"
                      className="AdminTextFeilds"
                      error={!!formErrors.managerRole}
                      helperText={formErrors.managerRole}
                    />
                  )}
                  value={managerRole}
                  onChange={(event, newValue) => {
                    setManagerRole(newValue);
                    setFormErrors((errors) => ({
                      ...errors,
                      managerRole: "",
                    }));
                  }}
                />
              </div>
            </div>

            <div className="GrnNewFlyoutContentTop">
              <Autocomplete
                id="program-autocomplete"
                options={programs}
                loading={loadingProgram}
                loadingText="Loading Programs...."
                getOptionLabel={(option) => option.name}
                renderOption={(props, option) => (
                  <MenuItem {...props}>{option.name}</MenuItem>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Program"
                    className="AdminTextFeilds"
                    error={!!formErrors.programId}
                    helperText={formErrors.programId}
                  />
                )}
                value={selectedProgram}
                onChange={(event, newValue) => {
                  setSelectedProgram(newValue);
                  setFormValues((prev) => ({
                    ...prev,
                    programId: newValue?.id || "",
                  }));
                  setFormErrors((prev) => ({
                    ...prev,
                    programId: "",
                  }));
                }}
              />
              <FormControl
                className="AdminTextFeilds"
                fullWidth
                error={!!formErrors.status}
              >
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  label="Status"
                  value={formValues.status || "Not Started"}
                  onChange={(e) => {
                    setFormValues({ ...formValues, status: e.target.value });
                    setFormErrors({ ...formErrors, status: "" });
                  }}
                >
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
                <FormHelperText error={!!formErrors.status}>
                  {formErrors.status}
                </FormHelperText>
              </FormControl>
            </div>

            <div className="TwoColumnGrid2">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                />
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  minDate={startDate}
                  onChange={(newValue) => setDueDate(newValue)}
                />
              </LocalizationProvider>
            </div>

            <div className="GrnNewFlyoutContentTop">
              <TextField
                label="Budget (in ₹)"
                type="number"
                fullWidth
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({
                    ...formValues,
                    budget: parseFloat(e.target.value),
                  });
                  setFormErrors({ ...formErrors, budget: "" });
                }}
                value={formValues.budget}
                error={!!formErrors.budget}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <FormHelperText error={!!formErrors.budget}>
                {formErrors.budget}
              </FormHelperText>
            </div>
            <div>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({ ...formValues, description: e.target.value });
                  setFormErrors({ ...formErrors, description: "" });
                }}
                value={formValues.description}
                error={!!formErrors.description}
              />
              <FormHelperText error={!!formErrors.description}>
                {formErrors.description}
              </FormHelperText>
            </div>
          </div>
          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button
              disabled={loadingData || !!formErrors.name}
              onClick={handleCreate}
            >
              Create
            </Button>
          </div>
        </>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewProject;
