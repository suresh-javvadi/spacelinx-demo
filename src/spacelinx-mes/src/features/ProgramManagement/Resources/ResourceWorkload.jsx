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
  Avatar,
  Chip,
  LinearProgress,
  Typography,
  Paper,
} from "@mui/material";
import { Add, Refresh } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { fetchWorkload } from "../../../services/resourceService";
import { fetchProjectsLookup } from "../../../services/projectService";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import AllocationForm from "./AllocationForm";
import "./Resources.css";

const ResourceWorkload = () => {
  const { Alert: showAlert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [createDrawerStatus, setCreateDrawerStatus] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs().add(30, "day"));

  useEffect(() => {
    loadData();
    loadProjects();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkload(
        startDate.startOf("day").toISOString(),
        endDate.endOf("day").toISOString(),
      );
      setWorkloadData(data);
    } catch (error) {
      console.error("Error loading workload:", error);
      showAlert("Error loading workload data", "error");
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

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getAllocationColor = (percent) => {
    if (percent >= 100) return "error";
    if (percent >= 80) return "warning";
    return "success";
  };

  const columns = [
    {
      field: "staffName",
      headerName: "Team Member",
      flex: 0.6,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={params.row.imageUrl}
            sx={{ width: 32, height: 32, fontSize: 12 }}
          >
            {getInitials(params.row.firstName, params.row.lastName)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.firstName} {params.row.lastName}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {params.row.jobTitle}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "department",
      headerName: "Department",
      flex: 0.4,
    },
    {
      field: "todayAllocationPercent",
      headerName: "Today's Allocation",
      flex: 0.4,
      renderCell: (params) => (
        <Box sx={{ width: "100%" }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography variant="caption">{params.value}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(params.value, 100)}
            color={getAllocationColor(params.value)}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      ),
    },
    {
      field: "activeTasksCount",
      headerName: "Active Tasks",
      flex: 0.3,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: "hoursLoggedThisWeek",
      headerName: "Hours This Week",
      flex: 0.3,
      valueGetter: (_value, row) =>
        `${(row.hoursLoggedThisWeek || 0).toFixed(1)}h`,
    },
    {
      field: "allocations",
      headerName: "Current Projects",
      flex: 0.5,
      renderCell: (params) => {
        const allocations = params.value || [];
        const uniqueProjects = [
          ...new Set(allocations.map((a) => a.projectName)),
        ];
        return (
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {uniqueProjects.slice(0, 2).map((project, index) => (
              <Chip
                key={index}
                label={project}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10 }}
              />
            ))}
            {uniqueProjects.length > 2 && (
              <Chip
                label={`+${uniqueProjects.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: 10 }}
              />
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <div className="AdminChildren ResourceWorkloadContainer">
      <div className="AdminChildrenHeader">
        <div>
          <p className="PageHeader">Resource Workload</p>
        </div>
        <div className="AdminChildrenHeaderButtons">
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
                textField: { size: "small", sx: { width: 150, ml: 1, mr: 2 } },
              }}
            />
          </LocalizationProvider>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<Refresh />}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            onClick={() => setCreateDrawerStatus(true)}
            startIcon={<Add />}
          >
            New Allocation
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Box className="WorkloadSummary">
        <Paper className="SummaryCard">
          <Typography variant="caption" color="textSecondary">
            Total Team Members
          </Typography>
          <Typography variant="h5" color="primary">
            {workloadData.length}
          </Typography>
        </Paper>
        <Paper className="SummaryCard">
          <Typography variant="caption" color="textSecondary">
            Fully Allocated
          </Typography>
          <Typography variant="h5" color="error.main">
            {workloadData.filter((w) => w.todayAllocationPercent >= 100).length}
          </Typography>
        </Paper>
        <Paper className="SummaryCard">
          <Typography variant="caption" color="textSecondary">
            Partially Allocated
          </Typography>
          <Typography variant="h5" color="warning.main">
            {
              workloadData.filter(
                (w) =>
                  w.todayAllocationPercent > 0 &&
                  w.todayAllocationPercent < 100,
              ).length
            }
          </Typography>
        </Paper>
        <Paper className="SummaryCard">
          <Typography variant="caption" color="textSecondary">
            Available
          </Typography>
          <Typography variant="h5" color="success.main">
            {workloadData.filter((w) => w.todayAllocationPercent === 0).length}
          </Typography>
        </Paper>
      </Box>

      <div className="MasterDataDataGridDiv">
        <StyledDataGrid
          rows={workloadData}
          columns={columns}
          loading={loading}
          pageSize={10}
          className="DataGrid"
          getRowId={(row) => row.userId}
          onRowClick={(params) => {
            setSelectedStaff(params.row);
            setCreateDrawerStatus(true);
          }}
        />
      </div>

      <ResizableDrawer
        anchor="right"
        open={createDrawerStatus}
        onClose={() => {
          setCreateDrawerStatus(false);
          setSelectedStaff(null);
        }}
        PaperProps={{ className: "ECODrawerStyles" }}
      >
        <AllocationForm
          handleCloseClick={() => {
            setCreateDrawerStatus(false);
            setSelectedStaff(null);
          }}
          handleRefresh={handleRefresh}
          projects={projects}
          selectedStaff={selectedStaff}
        />
      </ResizableDrawer>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default ResourceWorkload;
