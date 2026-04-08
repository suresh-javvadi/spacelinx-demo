import { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  Autocomplete,
  CircularProgress,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Close, Save, AccessTime } from "@mui/icons-material";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  logTime,
  updateTimeEntry,
  deleteTimeEntry,
} from "../../../services/timeEntryService";
import { fetchTasksByProject } from "../../../services/taskService";
import "./TimeTracking.css";

const TimeEntryForm = ({
  handleCloseClick,
  handleRefresh,
  projects = [],
  staff = [],
  workTypes = [],
  loadingLookups,
  selectedEntry = null,
  isEdit = false,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [formData, setFormData] = useState({
    taskId: "",
    staffId: "",
    entryDate: dayjs(),
    hoursWorked: "",
    description: "",
    billable: true,
    workType: "Development",
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    if (isEdit && selectedEntry) {
      setFormData({
        taskId: selectedEntry.taskId || "",
        staffId: selectedEntry.staffId || "",
        entryDate: selectedEntry.entryDate
          ? dayjs(selectedEntry.entryDate)
          : dayjs(),
        hoursWorked: selectedEntry.hoursWorked || "",
        description: selectedEntry.description || "",
        billable: selectedEntry.billable ?? true,
        workType: selectedEntry.workType || "Development",
      });

      // Set selected task and staff for autocomplete
      if (selectedEntry.task) {
        setSelectedTask(selectedEntry.task);
        // Find the project for this task
        const project = projects.find(
          (p) => p.id === selectedEntry.task.projectId
        );
        if (project) {
          setSelectedProject(project);
          fetchTasksForProject(project.id);
        }
      }

      if (selectedEntry.staff) {
        setSelectedStaff(selectedEntry.staff);
      }
    }
  }, [isEdit, selectedEntry, projects]);

  const fetchTasksForProject = async (projectId) => {
    setLoadingTasks(true);
    try {
      const response = await fetchTasksByProject(projectId);
      setTasks(response || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleProjectChange = (event, newValue) => {
    setSelectedProject(newValue);
    setSelectedTask(null);
    setFormData((prev) => ({ ...prev, taskId: "" }));
    if (newValue) {
      fetchTasksForProject(newValue.id);
    } else {
      setTasks([]);
    }
  };

  const handleTaskChange = (event, newValue) => {
    setSelectedTask(newValue);
    setFormData((prev) => ({
      ...prev,
      taskId: newValue?.id || "",
    }));
  };

  const handleStaffChange = (event, newValue) => {
    setSelectedStaff(newValue);
    setFormData((prev) => ({
      ...prev,
      staffId: newValue?.id || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.taskId) {
      Alert("Please select a task", "error");
      return;
    }

    if (!formData.staffId) {
      Alert("Please select a staff member", "error");
      return;
    }

    if (!formData.hoursWorked || formData.hoursWorked <= 0) {
      Alert("Please enter valid hours worked", "error");
      return;
    }

    if (formData.hoursWorked > 24) {
      Alert("Hours worked cannot exceed 24", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        taskId: formData.taskId,
        staffId: formData.staffId,
        entryDate: dayjs(formData.entryDate).format("YYYY-MM-DD"),
        hoursWorked: parseFloat(formData.hoursWorked),
        description: formData.description,
        billable: formData.billable,
        workType: formData.workType,
      };

      if (isEdit) {
        await updateTimeEntry(selectedEntry.id, payload);
        Alert("Time entry updated successfully", "success");
      } else {
        await logTime(payload);
        Alert("Time logged successfully", "success");
      }

      handleRefresh();
      handleCloseClick();
    } catch (error) {
      Alert(
        `Error ${isEdit ? "updating" : "logging"} time: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      console.error("Error saving time entry:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this time entry?")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTimeEntry(selectedEntry.id);
      Alert("Time entry deleted successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      Alert(
        `Error deleting time entry: ${
          error.response?.data?.message || error.message
        }`,
        "error"
      );
      console.error("Error deleting time entry:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box className="TimeEntryFormContainer">
      <Box className="DrawerHeader">
        <Box display="flex" alignItems="center" gap={1}>
          <AccessTime />
          <Typography variant="h6">
            {isEdit ? "Edit Time Entry" : "Log Time"}
          </Typography>
        </Box>
        <Button onClick={handleCloseClick} startIcon={<Close />}>
          Close
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <form onSubmit={handleSubmit}>
        <Box className="FormContent">
          {/* Project Selection */}
          <Autocomplete
            options={projects}
            getOptionLabel={(option) => option.name || ""}
            value={selectedProject}
            onChange={handleProjectChange}
            loading={loadingLookups}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Project"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingLookups ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Task Selection */}
          <Autocomplete
            options={tasks}
            getOptionLabel={(option) =>
              option.taskCode
                ? `${option.taskCode} - ${option.name}`
                : option.name || ""
            }
            value={selectedTask}
            onChange={handleTaskChange}
            loading={loadingTasks}
            disabled={!selectedProject}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Task"
                required
                helperText={
                  !selectedProject ? "Select a project first" : ""
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingTasks ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Staff Selection */}
          <Autocomplete
            options={staff}
            getOptionLabel={(option) =>
              `${option.firstName || ""} ${option.lastName || ""}`
            }
            value={selectedStaff}
            onChange={handleStaffChange}
            loading={loadingLookups}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Staff Member"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingLookups ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Entry Date */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Entry Date"
              value={formData.entryDate}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, entryDate: date }))
              }
              slotProps={{
                textField: { required: true, fullWidth: true },
              }}
            />
          </LocalizationProvider>

          {/* Hours Worked */}
          <TextField
            label="Hours Worked"
            name="hoursWorked"
            type="number"
            value={formData.hoursWorked}
            onChange={handleChange}
            required
            inputProps={{ min: 0.01, max: 24, step: 0.25 }}
            helperText="Enter hours between 0.01 and 24"
          />

          {/* Work Type */}
          <FormControl fullWidth>
            <InputLabel>Work Type</InputLabel>
            <Select
              name="workType"
              value={formData.workType}
              label="Work Type"
              onChange={handleChange}
            >
              {workTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Billable Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.billable}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    billable: e.target.checked,
                  }))
                }
                color="success"
              />
            }
            label="Billable"
          />

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            placeholder="Describe what you worked on..."
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box className="FormActions">
          {isEdit && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" onClick={handleCloseClick}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={saving}
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Log Time"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default TimeEntryForm;
