import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { fetchCapacity } from "../../../services/resourceService";
import { fetchProjectsLookup } from "../../../services/projectService";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import "./Resources.css";

const CapacityPlanning = () => {
  const { Alert: showAlert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(true);
  const [capacityData, setCapacityData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");

  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(30, "day"));

  useEffect(() => {
    loadData();
    loadProjects();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCapacity(
        startDate.startOf("day").toISOString(),
        endDate.endOf("day").toISOString(),
        projectFilter || null,
      );
      setCapacityData(data);
    } catch (error) {
      console.error("Error loading capacity:", error);
      showAlert("Error loading capacity data", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await fetchProjectsLookup();
      setProjects(data.filter((p) => p.name));
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const chartData =
    capacityData?.dailyCapacity?.map((day) => ({
      date: dayjs(day.date).format("MMM D"),
      allocated: parseFloat(day.allocatedHours.toFixed(1)),
      available: parseFloat(day.availableHours.toFixed(1)),
      capacity: parseFloat(day.totalCapacityHours.toFixed(1)),
      utilization: parseFloat(day.allocationPercent.toFixed(1)),
    })) || [];

  return (
    <div className="AdminChildren CapacityContainer">
      <div className="AdminChildrenHeader">
        <div>
          <p className="PageHeader">Capacity Planning</p>
        </div>
        <div className="AdminChildrenHeaderButtons">
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="CapacityFilters">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From"
            value={startDate}
            onChange={(date) => setStartDate(date)}
            slotProps={{
              textField: { size: "small", sx: { width: 150 } },
            }}
          />
          <DatePicker
            label="To"
            value={endDate}
            onChange={(date) => setEndDate(date)}
            slotProps={{
              textField: { size: "small", sx: { width: 150 } },
            }}
          />
        </LocalizationProvider>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Project</InputLabel>
          <Select
            value={projectFilter}
            label="Filter by Project"
            onChange={(e) => {
              setProjectFilter(e.target.value);
              loadData();
            }}
          >
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={loadData}>
          Apply
        </Button>
      </div>

      {/* Summary Cards */}
      {capacityData && (
        <Box className="CapacitySummary">
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Total Team Members
            </Typography>
            <Typography variant="h5" color="primary">
              {capacityData.totalStaff}
            </Typography>
          </Paper>
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Total Capacity (hours)
            </Typography>
            <Typography variant="h5" color="primary">
              {capacityData.summary?.totalCapacityHours?.toFixed(0) || 0}
            </Typography>
          </Paper>
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Allocated Hours
            </Typography>
            <Typography variant="h5" color="warning.main">
              {capacityData.summary?.totalAllocatedHours?.toFixed(0) || 0}
            </Typography>
          </Paper>
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Available Hours
            </Typography>
            <Typography variant="h5" color="success.main">
              {capacityData.summary?.totalAvailableHours?.toFixed(0) || 0}
            </Typography>
          </Paper>
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Avg. Utilization
            </Typography>
            <Typography variant="h5" color="info.main">
              {capacityData.summary?.averageUtilization?.toFixed(0) || 0}%
            </Typography>
          </Paper>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : chartData.length === 0 ? (
        <Alert severity="info">No capacity data for the selected period</Alert>
      ) : (
        <Paper className="CapacityChart">
          <Typography variant="h6" gutterBottom>
            Daily Capacity Overview
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis
                yAxisId="right"
                orientation="right"
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="allocated"
                name="Allocated Hours"
                fill="#ff9800"
                stackId="hours"
              />
              <Bar
                yAxisId="left"
                dataKey="available"
                name="Available Hours"
                fill="#4caf50"
                stackId="hours"
              />
              <ReferenceLine
                yAxisId="right"
                y={80}
                stroke="#f44336"
                strokeDasharray="5 5"
                label="80% Target"
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default CapacityPlanning;
