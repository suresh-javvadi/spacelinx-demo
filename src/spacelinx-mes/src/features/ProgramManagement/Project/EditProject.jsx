import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { AlertsContext } from "../../AlertsContext/Context";
import { updateProject } from "../../../services/projectService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const EditProject = ({
  handleCloseClick,
  handleRefresh,
  selectedProject,
  programs,
  loadingOptionSets,
  managerRoles,
  loadingProgram,
}) => {
  const { Alert } = useContext(AlertsContext);

  const [startDate, setStartDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs());
  const [loadingData, setLoadingData] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({
    projectCode: "",
    name: "",
    description: "",
    programId: "",
    projectManagerId: "",
    startDate: "",
    endDate: "",
    budget: 0,
    status: "Not Started",
  });
  const [initialData, setInitialData] = useState({});
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (selectedProject) {
      const data = {
        projectCode: selectedProject.projectCode || "",
        name: selectedProject.name || "",
        description: selectedProject.description || "",
        programId: selectedProject.programId || "",
        projectManagerId: selectedProject.projectManagerId || "",
        startDate: startDate ? startDate.toISOString() : null,
        endDate: dueDate ? dueDate.toISOString() : null,
        budget: selectedProject.budget || 0,
        status: selectedProject.status || "Not Started",
      };

      setFormData(data);
      setInitialData(data);

      const matchingProgram = programs.find(
        (c) => c.id === selectedProject.programId,
      );
      setSelectedProgram(matchingProgram || null);

      setLoadingData(false);
    }
  }, [selectedProject, programs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateFields = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.projectCode.trim()) {
      newErrors.projectCode = "Project Code is required";
      valid = false;
    }
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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

    if (!selectedProject?.id) {
      Alert("Missing Project ID", "error");
      return;
    }

    try {
      setLoadingData(true);
      await updateProject(selectedProject.id, formData);
      Alert("Project updated successfully!", "success");
      handleCloseClick();
      await handleRefresh();
    } catch (error) {
      console.error("Error updating project:", error);
      Alert("Failed to update project. Please try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>Edit {formData.name}</h3>
        <div>
          <button onClick={() => setReadOnlyMode(false)}>
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="CreateFlyoutBody">
          <div className="GrnNewFlyoutContentTop">
            <TextField
              label="Project Code"
              name="projectCode"
              value={formData.projectCode}
              onChange={handleInputChange}
              error={!!errors.projectCode}
              helperText={errors.projectCode}
              disabled
              className="AdminTextFeilds"
            />

            <TextField
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={readOnlyMode}
              className="AdminTextFeilds"
              required
            />
          </div>

          <div className="GrnNewFlyoutContentTop">
            <Autocomplete
              options={programs}
              loading={loadingProgram}
              loadingText="Loading Program Names...."
              getOptionLabel={(option) => option.name || ""}
              value={selectedProgram}
              onChange={(e, newValue) => {
                setSelectedProgram(newValue);
                setFormData({ ...formData, programId: newValue?.id || "" });
                setErrors({ ...errors, programId: "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Program Name"
                  error={!!errors.programId}
                  helperText={errors.programId}
                  disabled={readOnlyMode}
                  className="AdminTextFeilds"
                />
              )}
              disabled={readOnlyMode}
            />

            <Autocomplete
              options={managerRoles}
              loading={loadingOptionSets}
              loadingText="Loading Project Managers...."
              value={
                managerRoles.find((s) => s.id === formData.projectManagerId) ||
                null
              }
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName}`
              }
              renderOption={(props, option) => (
                <MenuItem {...props}>
                  {`${option.firstName} ${option.lastName}`}
                </MenuItem>
              )}
              onChange={(e, newValue) => {
                setFormData({
                  ...formData,
                  projectManagerId: newValue?.id || "",
                });
                setErrors({ ...errors, projectManagerId: "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Project Manager"
                  error={!!errors.projectManagerId}
                  helperText={errors.projectManagerId}
                  disabled={readOnlyMode}
                  className="AdminTextFeilds"
                />
              )}
              disabled={readOnlyMode}
            />
          </div>
          <div className="TwoColumnGrid2">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                disabled={readOnlyMode}
                onChange={(newValue) => setStartDate(newValue)}
              />
              <DatePicker
                label="Due Date"
                value={dueDate}
                disabled={readOnlyMode}
                minDate={startDate}
                onChange={(newValue) => setDueDate(newValue)}
              />
            </LocalizationProvider>
          </div>
          <div className="GrnNewFlyoutContentTop">
            <TextField
              select
              label="Status"
              className="AdminTextFeilds"
              fullWidth
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              value={formData.status}
              error={!!errors.status}
              disabled={readOnlyMode}
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="On Hold">On Hold</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>

            <TextField
              label="Budget (in ₹)"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              error={!!errors.budget}
              helperText={errors.budget}
              disabled={readOnlyMode}
              className="AdminTextFeilds"
            />
          </div>

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
            disabled={readOnlyMode}
            multiline
            rows={3}
            className="AdminTextFeilds"
          />
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

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditProject;
