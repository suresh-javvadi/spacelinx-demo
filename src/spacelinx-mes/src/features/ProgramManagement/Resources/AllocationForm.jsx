import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { createResourceAllocation } from "../../../services/resourceService";
import { AlertsContext } from "../../AlertsContext/Context";

const allocationTypes = ["Project", "Task", "Overhead", "Leave", "Training"];

const AllocationForm = ({ handleCloseClick, handleRefresh, projects, selectedStaff }) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    staffId: selectedStaff?.staffId || "",
    projectId: "",
    taskId: null,
    startDate: dayjs(),
    endDate: dayjs().add(7, "day"),
    allocatedHoursPerDay: 8,
    allocationPercent: 100,
    allocationType: "Project",
    notes: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createResourceAllocation({
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      });

      Alert("Allocation created successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("Error creating allocation:", error);
      Alert("Error creating allocation", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="DrawerContent" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {selectedStaff
          ? `New Allocation for ${selectedStaff.firstName} ${selectedStaff.lastName}`
          : "New Resource Allocation"}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Project</InputLabel>
          <Select
            value={formData.projectId}
            label="Project"
            onChange={(e) => handleChange("projectId", e.target.value)}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Allocation Type</InputLabel>
          <Select
            value={formData.allocationType}
            label="Allocation Type"
            onChange={(e) => handleChange("allocationType", e.target.value)}
          >
            {allocationTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <DatePicker
              label="Start Date"
              value={formData.startDate}
              onChange={(date) => handleChange("startDate", date)}
              slotProps={{
                textField: { fullWidth: true, required: true },
              }}
            />
            <DatePicker
              label="End Date"
              value={formData.endDate}
              onChange={(date) => handleChange("endDate", date)}
              slotProps={{
                textField: { fullWidth: true, required: true },
              }}
            />
          </Box>
        </LocalizationProvider>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>
            Allocation Percentage: {formData.allocationPercent}%
          </Typography>
          <Slider
            value={formData.allocationPercent}
            onChange={(_, value) => handleChange("allocationPercent", value)}
            valueLabelDisplay="auto"
            step={10}
            marks
            min={10}
            max={100}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>
            Hours Per Day: {formData.allocatedHoursPerDay}h
          </Typography>
          <Slider
            value={formData.allocatedHoursPerDay}
            onChange={(_, value) => handleChange("allocatedHoursPerDay", value)}
            valueLabelDisplay="auto"
            step={0.5}
            marks
            min={1}
            max={12}
          />
        </Box>

        <TextField
          fullWidth
          margin="normal"
          label="Notes"
          multiline
          rows={3}
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
        />

        <Box sx={{ display: "flex", gap: 2, mt: 3, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={handleCloseClick}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.projectId}
          >
            {loading ? <CircularProgress size={20} /> : "Create Allocation"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AllocationForm;
