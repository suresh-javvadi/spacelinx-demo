import { useState, useEffect, useContext, useCallback } from "react";
import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import {
  Add,
  Search,
  AccessTime,
  Person,
  Assessment,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  fetchTimeEntries,
  fetchTimeEntriesByProject,
  fetchTimeEntriesByStaff,
  fetchMyTimeEntries,
} from "../../../services/timeEntryService";
import { fetchProjectsLookup } from "../../../services/projectService";
import { fetchUsers } from "../../../services/userService";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import TimeEntryForm from "./TimeEntryForm";
import TimeReport from "./TimeReport";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import "./TimeTracking.css";

const TimeEntryList = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [entriesData, setEntriesData] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [createEntryDrawerStatus, setCreateEntryDrawerStatus] = useState(false);
  const [editEntryDrawerStatus, setEditEntryDrawerStatus] = useState(false);
  const [reportDrawerStatus, setReportDrawerStatus] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Lookup data
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Filters
  const [projectFilter, setProjectFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [billableFilter, setBillableFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // all, my-entries

  // Summary stats
  const [summary, setSummary] = useState({
    totalHours: 0,
    billableHours: 0,
    nonBillableHours: 0,
    entryCount: 0,
  });

  const workTypes = [
    "Development",
    "Design",
    "Testing",
    "Documentation",
    "Meeting",
    "Review",
    "Research",
    "Support",
    "Other",
  ];

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("timeEntriesColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          description: false,
        };
  });

  useEffect(() => {
    fetchLookupData();
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    entriesData,
    projectFilter,
    staffFilter,
    billableFilter,
    workTypeFilter,
    startDateFilter,
    endDateFilter,
    searchTerm,
  ]);

  const fetchLookupData = async () => {
    setLoadingLookups(true);
    try {
      const [projectsData, staffData] = await Promise.all([
        fetchProjectsLookup(),
        fetchUsers(),
      ]);
      setProjects(projectsData.filter((p) => p.name));
      setStaff(staffData.filter((s) => s.isActive));
    } catch (error) {
      console.error("Error fetching lookup data:", error);
    } finally {
      setLoadingLookups(false);
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      let response;
      if (viewMode === "my-entries") {
        const start = startDateFilter
          ? dayjs(startDateFilter).format("YYYY-MM-DD")
          : null;
        const end = endDateFilter
          ? dayjs(endDateFilter).format("YYYY-MM-DD")
          : null;
        response = await fetchMyTimeEntries(start, end);
      } else if (projectFilter) {
        response = await fetchTimeEntriesByProject(projectFilter);
      } else if (staffFilter) {
        response = await fetchTimeEntriesByStaff(staffFilter);
      } else {
        response = await fetchTimeEntries();
      }

      if (response) {
        const sortedData = response.sort(
          (a, b) => new Date(b.entryDate) - new Date(a.entryDate),
        );
        setEntriesData(sortedData);
      }
    } catch (error) {
      Alert("Error fetching time entries", "error");
      console.error("Error fetching time entries:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entriesData];

    if (billableFilter !== "") {
      const isBillable = billableFilter === "true";
      filtered = filtered.filter((e) => e.billable === isBillable);
    }
    if (workTypeFilter) {
      filtered = filtered.filter((e) => e.workType === workTypeFilter);
    }
    if (startDateFilter) {
      const start = dayjs(startDateFilter).startOf("day");
      filtered = filtered.filter(
        (e) =>
          dayjs(e.entryDate).isAfter(start) ||
          dayjs(e.entryDate).isSame(start, "day"),
      );
    }
    if (endDateFilter) {
      const end = dayjs(endDateFilter).endOf("day");
      filtered = filtered.filter(
        (e) =>
          dayjs(e.entryDate).isBefore(end) ||
          dayjs(e.entryDate).isSame(end, "day"),
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.task?.name?.toLowerCase().includes(term) ||
          e.staff?.firstName?.toLowerCase().includes(term) ||
          e.staff?.lastName?.toLowerCase().includes(term) ||
          e.description?.toLowerCase().includes(term),
      );
    }

    setFilteredEntries(filtered);

    // Calculate summary
    const totalHours = filtered.reduce(
      (sum, e) => sum + (e.hoursWorked || 0),
      0,
    );
    const billableHours = filtered
      .filter((e) => e.billable)
      .reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
    setSummary({
      totalHours: totalHours.toFixed(2),
      billableHours: billableHours.toFixed(2),
      nonBillableHours: (totalHours - billableHours).toFixed(2),
      entryCount: filtered.length,
    });
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleViewModeChange = async (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      setLoadingData(true);
      try {
        let response;
        if (newMode === "my-entries") {
          response = await fetchMyTimeEntries();
        } else {
          response = await fetchTimeEntries();
        }
        setEntriesData(response || []);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setLoadingData(false);
      }
    }
  };

  const columns = [
    {
      field: "entryDate",
      headerName: "Date",
      flex: 0.4,
      valueGetter: (_value, row) => {
        const date = row.entryDate;
        return date ? new Date(date).toLocaleDateString() : "";
      },
    },
    {
      field: "task",
      headerName: "Task",
      flex: 0.6,
      valueGetter: (_value, row) => row.task?.name || "",
    },
    {
      field: "staff",
      headerName: "Staff",
      flex: 0.5,
      valueGetter: (_value, row) =>
        row.staff
          ? `${row.staff.firstName || ""} ${row.staff.lastName || ""}`
          : "",
    },
    {
      field: "hoursWorked",
      headerName: "Hours",
      flex: 0.3,
      renderCell: (params) => (
        <Typography fontWeight="bold" color="primary">
          {params.value?.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "workType",
      headerName: "Work Type",
      flex: 0.4,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
    {
      field: "billable",
      headerName: "Billable",
      flex: 0.3,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
          size="small"
          color={params.value ? "success" : "default"}
          variant={params.value ? "filled" : "outlined"}
        />
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 0.6,
    },
    {
      field: "createdBy",
      headerName: "Logged By",
      flex: 0.4,
    },
  ];

  return (
    <>
      <div className="AdminChildren TimeTrackingContainer">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Time Tracking</p>
          </div>
          <div className="AdminChildrenHeaderButtons">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="all" aria-label="all entries">
                <AccessTime />
              </ToggleButton>
              <ToggleButton value="my-entries" aria-label="my entries">
                <Person />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              onClick={() => setReportDrawerStatus(true)}
              startIcon={<Assessment />}
              sx={{ mr: 1 }}
            >
              Report
            </Button>
            <Button
              variant="contained"
              onClick={() => setCreateEntryDrawerStatus(true)}
              startIcon={<Add />}
            >
              Log Time
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <Box className="TimeTrackingSummary">
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Total Hours
            </Typography>
            <Typography variant="h5" color="primary">
              {summary.totalHours}
            </Typography>
          </Paper>
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Billable Hours
            </Typography>
            <Typography variant="h5" color="success.main">
              {summary.billableHours}
            </Typography>
          </Paper>
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Non-Billable Hours
            </Typography>
            <Typography variant="h5" color="text.secondary">
              {summary.nonBillableHours}
            </Typography>
          </Paper>
          <Paper className="SummaryCard">
            <Typography variant="caption" color="textSecondary">
              Entries
            </Typography>
            <Typography variant="h5">{summary.entryCount}</Typography>
          </Paper>
        </Box>

        <div className="TimeTrackingFilters">
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={projectFilter}
              label="Project"
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setStaffFilter("");
                if (e.target.value) {
                  fetchTimeEntriesByProject(e.target.value).then((data) => {
                    setEntriesData(data || []);
                  });
                } else {
                  fetchData();
                }
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Staff</InputLabel>
            <Select
              value={staffFilter}
              label="Staff"
              onChange={(e) => {
                setStaffFilter(e.target.value);
                setProjectFilter("");
                if (e.target.value) {
                  fetchTimeEntriesByStaff(e.target.value).then((data) => {
                    setEntriesData(data || []);
                  });
                } else {
                  fetchData();
                }
              }}
            >
              <MenuItem value="">All Staff</MenuItem>
              {staff.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {`${s.firstName} ${s.lastName}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Billable</InputLabel>
            <Select
              value={billableFilter}
              label="Billable"
              onChange={(e) => setBillableFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Billable</MenuItem>
              <MenuItem value="false">Non-Billable</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Work Type</InputLabel>
            <Select
              value={workTypeFilter}
              label="Work Type"
              onChange={(e) => setWorkTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {workTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              value={startDateFilter}
              onChange={(date) => setStartDateFilter(date)}
              slotProps={{
                textField: { size: "small", sx: { width: 150 } },
              }}
            />
            <DatePicker
              label="To"
              value={endDateFilter}
              onChange={(date) => setEndDateFilter(date)}
              slotProps={{
                textField: { size: "small", sx: { width: 150 } },
              }}
            />
          </LocalizationProvider>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={filteredEntries}
            columns={columns}
            loading={loadingData}
            pageSize={10}
            className="DataGrid"
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "timeEntriesColumnVisibility",
                JSON.stringify(newModel),
              );
            }}
            onRowClick={(params) => {
              setSelectedEntry(params.row);
              setEditEntryDrawerStatus(true);
            }}
          />
        </div>

        {/* Create Time Entry Drawer */}
        <ResizableDrawer
          anchor="right"
          open={createEntryDrawerStatus}
          onClose={() => setCreateEntryDrawerStatus(false)}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          <TimeEntryForm
            handleCloseClick={() => setCreateEntryDrawerStatus(false)}
            handleRefresh={handleRefresh}
            projects={projects}
            staff={staff}
            workTypes={workTypes}
            loadingLookups={loadingLookups}
          />
        </ResizableDrawer>

        {/* Edit Time Entry Drawer */}
        <ResizableDrawer
          anchor="right"
          open={editEntryDrawerStatus}
          onClose={() => setEditEntryDrawerStatus(false)}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          {selectedEntry && (
            <TimeEntryForm
              handleCloseClick={() => setEditEntryDrawerStatus(false)}
              handleRefresh={handleRefresh}
              projects={projects}
              staff={staff}
              workTypes={workTypes}
              loadingLookups={loadingLookups}
              selectedEntry={selectedEntry}
              isEdit={true}
            />
          )}
        </ResizableDrawer>

        {/* Time Report Drawer */}
        <ResizableDrawer
          anchor="right"
          open={reportDrawerStatus}
          onClose={() => setReportDrawerStatus(false)}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          <TimeReport
            handleCloseClick={() => setReportDrawerStatus(false)}
            projects={projects}
            staff={staff}
            workTypes={workTypes}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default TimeEntryList;
