import React, { useState, useContext } from "react";
import {
  TextField,
  Button,
  IconButton,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { createTask } from "../../../services/taskService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";

const NewTask = ({
  handleCloseClick,
  handleRefresh,
  projects,
  staff,
  loadingLookups,
  selectedProjectId,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    projectId: selectedProjectId || "",
    assignedToId: "",
    status: "To Do",
    priority: "Medium",
    dueDate: null,
    startDate: null,
    estimatedHours: "",
    taskType: "Task",
    parentTaskId: "",
    milestoneId: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.name?.trim()) {
      errors.name = "Task name is required";
    }
    if (!formValues.status) {
      errors.status = "Status is required";
    }
    if (!formValues.priority) {
      errors.priority = "Priority is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formValues.name,
        description: formValues.description || null,
        projectId: formValues.projectId || null,
        assignedToId: formValues.assignedToId || null,
        status: formValues.status,
        priority: formValues.priority,
        dueDate: formValues.dueDate
          ? dayjs(formValues.dueDate).toISOString()
          : null,
        startDate: formValues.startDate
          ? dayjs(formValues.startDate).toISOString()
          : null,
        estimatedHours: formValues.estimatedHours
          ? parseFloat(formValues.estimatedHours)
          : null,
        taskType: formValues.taskType,
        parentTaskId: formValues.parentTaskId || null,
        milestoneId: formValues.milestoneId || null,
      };

      await createTask(payload);
      Alert("Task created successfully!", "success");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("Error creating task:", error);
      Alert("Failed to create task", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create New Task</h2>

        <IconButton onClick={handleCloseClick}>
          <Close />
        </IconButton>
      </div>

      <div className="CreateFlyoutBody">
        <div className="GrnNewFlyoutContentTop">
          <TextField
            fullWidth
            label="Task Name"
            value={formValues.name}
            onChange={handleChange("name")}
            error={!!formErrors.name}
            helperText={formErrors.name}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="Estimated Hours"
            type="number"
            value={formValues.estimatedHours}
            onChange={handleChange("estimatedHours")}
            margin="normal"
            inputProps={{ min: 0, step: 0.5 }}
          />
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <FormControl fullWidth margin="normal" error={!!formErrors.status}>
            <InputLabel>Status *</InputLabel>
            <Select
              value={formValues.status}
              label="Status *"
              onChange={handleChange("status")}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Logged">Logged</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" error={!!formErrors.priority}>
            <InputLabel>Priority *</InputLabel>
            <Select
              value={formValues.priority}
              label="Priority *"
              onChange={handleChange("priority")}
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="GrnNewFlyoutContentTop">
          <Autocomplete
            options={projects}
            getOptionLabel={(option) => option.name || ""}
            value={projects.find((p) => p.id === formValues.projectId) || null}
            onChange={(event, newValue) => {
              setFormValues((prev) => ({
                ...prev,
                projectId: newValue?.id || "",
              }));
            }}
            loading={loadingLookups}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Project"
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingLookups ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Task Type</InputLabel>
            <Select
              value={formValues.taskType}
              label="Task Type"
              onChange={handleChange("taskType")}
            >
              <MenuItem value="Task">Task</MenuItem>
              <MenuItem value="Milestone">Milestone</MenuItem>
              <MenuItem value="SubTask">SubTask</MenuItem>
            </Select>
          </FormControl>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div style={{ display: "flex", gap: 16 }}>
            <DatePicker
              label="Start Date"
              value={formValues.startDate ? dayjs(formValues.startDate) : null}
              onChange={(newValue) =>
                setFormValues((prev) => ({
                  ...prev,
                  startDate: newValue,
                }))
              }
              slotProps={{
                textField: { fullWidth: true, margin: "normal" },
              }}
            />
            <DatePicker
              label="Due Date"
              value={formValues.dueDate ? dayjs(formValues.dueDate) : null}
              onChange={(newValue) =>
                setFormValues((prev) => ({
                  ...prev,
                  dueDate: newValue,
                }))
              }
              slotProps={{
                textField: { fullWidth: true, margin: "normal" },
              }}
            />
          </div>
        </LocalizationProvider>

        <div className="GrnNewFlyoutContentTop">
          <Autocomplete
            options={staff}
            getOptionLabel={(option) =>
              option ? `${option.firstName || ""} ${option.lastName || ""}` : ""
            }
            value={staff.find((s) => s.id === formValues.assignedToId) || null}
            onChange={(event, newValue) => {
              setFormValues((prev) => ({
                ...prev,
                assignedToId: newValue?.id || "",
              }));
            }}
            loading={loadingLookups}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assigned To"
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingLookups ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <TextField
            fullWidth
            label="Description"
            value={formValues.description}
            onChange={handleChange("description")}
            multiline
            minRows={1}
            maxRows={5}
            margin="normal"
          />
        </div>
      </div>

      <div className="EditFlyoutFooter">
        <Button variant="outlined" onClick={handleCloseClick}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
        >
          {saving ? "Saving..." : "Create Task"}
        </Button>
      </div>

      <FlyoutAlerts />
    </div>
  );
};

export default NewTask;
