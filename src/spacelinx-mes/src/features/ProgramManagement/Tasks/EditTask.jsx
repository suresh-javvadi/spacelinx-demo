import React, { useState, useEffect, useContext } from "react";
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
  Slider,
  Typography,
  Box,
} from "@mui/material";
import { Close, Save, Edit, Refresh } from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { updateTask } from "../../../services/taskService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";

const EditTask = ({
  handleCloseClick,
  handleRefresh,
  selectedTask,
  projects,
  staff,
  loadingLookups,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [saving, setSaving] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [formValues, setFormValues] = useState({});
  const [initialData, setInitialData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (selectedTask) {
      const data = {
        name: selectedTask.name || "",
        description: selectedTask.description || "",
        projectId: selectedTask.projectId || selectedTask.project?.id || "",
        assignedToId:
          selectedTask.assignedToId || selectedTask.assignedTo?.id || "",
        status: selectedTask.status || "To Do",
        priority: selectedTask.priority || "Medium",
        dueDate: selectedTask.dueDate || null,
        startDate: selectedTask.startDate || null,
        estimatedHours: selectedTask.estimatedHours || "",
        actualHours: selectedTask.actualHours || "",
        progressPercent: selectedTask.progressPercent || 0,
        taskType: selectedTask.taskType || "Task",
        parentTaskId: selectedTask.parentTaskId || "",
        milestoneId: selectedTask.milestoneId || "",
      };
      setFormValues(data);
      setInitialData(data);
    }
  }, [selectedTask]);

  const handleChange = (field) => (event) => {
    const value = event?.target?.value ?? event;
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const hasFormChanged = () => {
    return JSON.stringify(formValues) !== JSON.stringify(initialData);
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

  const handleReset = () => {
    setFormValues(initialData);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert("Please fill all required fields", "error");
      return;
    }

    if (!hasFormChanged()) {
      Alert("No changes to save", "info");
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
        actualHours: formValues.actualHours
          ? parseFloat(formValues.actualHours)
          : null,
        progressPercent: formValues.progressPercent,
        taskType: formValues.taskType,
        parentTaskId: formValues.parentTaskId || null,
        milestoneId: formValues.milestoneId || null,
      };

      await updateTask(selectedTask.id, payload);
      Alert("Task updated successfully!", "success");
      handleRefresh();
      setReadOnlyMode(true);
      setInitialData(formValues);
      handleCloseClick();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert("Failed to update task", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <div className="EditFlyoutHeader1">
          <h3>Edit Task</h3>
          <span className="EditTaskHeaderMeta">{selectedTask?.taskCode}</span>
        </div>
        <div className="EditTaskActions">
          {readOnlyMode && (
            <IconButton onClick={() => setReadOnlyMode(false)} title="Edit">
              <Edit />
            </IconButton>
          )}
          <IconButton onClick={handleCloseClick}>
            <Close />
          </IconButton>
        </div>
      </div>

      <div className="CreateFlyoutBody">
        <TextField
          fullWidth
          label="Task Code"
          value={selectedTask?.taskCode || ""}
          disabled
          margin="normal"
        />

        <TextField
          fullWidth
          label="Task Name"
          value={formValues.name}
          onChange={handleChange("name")}
          error={!!formErrors.name}
          helperText={formErrors.name}
          required
          disabled={readOnlyMode}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Description"
          value={formValues.description}
          onChange={handleChange("description")}
          multiline
          rows={3}
          disabled={readOnlyMode}
          margin="normal"
        />

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
          disabled={readOnlyMode}
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
          disabled={readOnlyMode}
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

        <div className="EditTaskRow">
          <FormControl
            fullWidth
            margin="normal"
            error={!!formErrors.status}
            disabled={readOnlyMode}
          >
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

          <FormControl
            fullWidth
            margin="normal"
            error={!!formErrors.priority}
            disabled={readOnlyMode}
          >
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

        <Box sx={{ mt: 2, mb: 1, ml: 2 }}>
          <Typography gutterBottom>
            Progress: {formValues.progressPercent}%
          </Typography>
          <Slider
            value={formValues.progressPercent}
            onChange={(e, value) =>
              setFormValues((prev) => ({ ...prev, progressPercent: value }))
            }
            disabled={readOnlyMode}
            valueLabelDisplay="auto"
            step={5}
            marks
            min={0}
            max={100}
          />
        </Box>

        <FormControl fullWidth margin="normal" disabled={readOnlyMode}>
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

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="EditTaskRow">
            <DatePicker
              label="Start Date"
              value={formValues.startDate ? dayjs(formValues.startDate) : null}
              onChange={(newValue) =>
                setFormValues((prev) => ({
                  ...prev,
                  startDate: newValue,
                }))
              }
              disabled={readOnlyMode}
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
              disabled={readOnlyMode}
              slotProps={{
                textField: { fullWidth: true, margin: "normal" },
              }}
            />
          </div>
        </LocalizationProvider>

        <div className="EditTaskRow">
          <TextField
            fullWidth
            label="Estimated Hours"
            type="number"
            value={formValues.estimatedHours}
            onChange={handleChange("estimatedHours")}
            disabled={readOnlyMode}
            margin="normal"
            inputProps={{ min: 0, step: 0.5 }}
          />
          <TextField
            fullWidth
            label="Actual Hours"
            type="number"
            value={formValues.actualHours}
            onChange={handleChange("actualHours")}
            disabled={readOnlyMode}
            margin="normal"
            inputProps={{ min: 0, step: 0.5 }}
          />
        </div>
      </div>

      {!readOnlyMode && (
        <div className="EditFlyoutFooter">
          <Button
            variant="outlined"
            onClick={handleReset}
            disabled={!hasFormChanged()}
            startIcon={<Refresh />}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !hasFormChanged()}
            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}

      <FlyoutAlerts />
    </div>
  );
};

export default EditTask;
