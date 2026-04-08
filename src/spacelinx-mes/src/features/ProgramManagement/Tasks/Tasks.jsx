import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add,
  Search,
  ViewList,
  AccountTree,
  Person,
} from "@mui/icons-material";
import {
  fetchTasks,
  fetchTasksByProject,
  fetchMyTasks,
} from "../../../services/taskService";
import { fetchProjectsLookup } from "../../../services/projectService";
import { fetchUsers } from "../../../services/userService";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import NewTask from "./NewTask";
import EditTask from "./EditTask";
import TaskDetails from "./TaskDetails";
import TaskHierarchy from "./TaskHierarchy";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import "./Tasks.css";

const Tasks = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [tasksData, setTasksData] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [createTaskDrawerStatus, setCreateTaskDrawerStatus] = useState(false);
  const [editTaskDrawerStatus, setEditTaskDrawerStatus] = useState(false);
  const [detailsDrawerStatus, setDetailsDrawerStatus] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Lookup data
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Filters
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list, hierarchy, my-tasks

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("tasksColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          description: false,
          startDate: false,
          estimatedHours: false,
          actualHours: false,
        };
  });

  useEffect(() => {
    fetchLookupData();
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasksData, projectFilter, statusFilter, priorityFilter, searchTerm]);

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
      if (viewMode === "my-tasks") {
        response = await fetchMyTasks();
      } else if (projectFilter) {
        response = await fetchTasksByProject(projectFilter);
      } else {
        response = await fetchTasks();
      }

      if (response) {
        const sortedData = response.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setTasksData(sortedData);
      }
    } catch (error) {
      Alert("Error fetching tasks", "error");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasksData];

    if (statusFilter) {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter) {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(term) ||
          t.taskCode?.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term),
      );
    }

    setFilteredTasks(filtered);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if (newMode === "my-tasks") {
        fetchMyTasks().then((data) => {
          setTasksData(data || []);
          setLoadingData(false);
        });
      } else {
        fetchData();
      }
    }
  };

  const getStatusChipClass = (status) => {
    const statusMap = {
      Completed: "completed",
      "In Progress": "in-progress",
      "To Do": "to-do",
      Logged: "logged",
    };
    return statusMap[status] || "to-do";
  };

  const getPriorityChipClass = (priority) => {
    return priority?.toLowerCase() || "medium";
  };

  const columns = [
    {
      field: "taskCode",
      headerName: "Task Code",
      flex: 0.4,
    },
    {
      field: "name",
      headerName: "Task Name",
      flex: 0.6,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.4,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          className={`TaskStatusChip ${getStatusChipClass(params.value)}`}
        />
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.3,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          className={`TaskPriorityChip ${getPriorityChipClass(params.value)}`}
        />
      ),
    },
    {
      field: "progressPercent",
      headerName: "Progress",
      flex: 0.4,
      renderCell: (params) => (
        <div className="TaskProgressBar">
          <LinearProgress
            variant="determinate"
            value={params.value || 0}
            color={params.value >= 100 ? "success" : "primary"}
          />
          <span className="TaskProgressText">{params.value || 0}%</span>
        </div>
      ),
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 0.5,
      valueGetter: (_value, row) =>
        row.assignedTo
          ? `${row.assignedTo.firstName || ""} ${row.assignedTo.lastName || ""}`
          : "",
    },
    {
      field: "project",
      headerName: "Project",
      flex: 0.5,
      valueGetter: (_value, row) => row.project?.name || "",
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 0.4,
      valueGetter: (_value, row) => {
        const date = row.dueDate;
        return date ? new Date(date).toLocaleDateString() : "";
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 0.4,
      valueGetter: (_value, row) => {
        const date = row.startDate;
        return date ? new Date(date).toLocaleDateString() : "";
      },
    },
    {
      field: "estimatedHours",
      headerName: "Est. Hours",
      flex: 0.3,
      valueGetter: (_value, row) => row.estimatedHours || "-",
    },
    {
      field: "actualHours",
      headerName: "Actual Hours",
      flex: 0.3,
      valueGetter: (_value, row) => row.actualHours || "-",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 0.6,
    },
  ];

  return (
    <>
      <div className="AdminChildren TasksContainer">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Tasks</p>
          </div>
          <div className="AdminChildrenHeaderButtons">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="hierarchy" aria-label="hierarchy view">
                <AccountTree />
              </ToggleButton>
              <ToggleButton value="my-tasks" aria-label="my tasks">
                <Person />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              onClick={() => setCreateTaskDrawerStatus(true)}
              startIcon={<Add />}
            >
              Add New
            </Button>
          </div>
        </div>

        <div className="TasksFilters">
          <TextField
            size="small"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={projectFilter}
              label="Project"
              onChange={(e) => {
                setProjectFilter(e.target.value);
                if (e.target.value) {
                  fetchTasksByProject(e.target.value).then((data) => {
                    setTasksData(data || []);
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
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Logged">Logged</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </div>

        {viewMode === "hierarchy" && projectFilter ? (
          <TaskHierarchy
            projectId={projectFilter}
            onTaskClick={(task) => {
              setSelectedTask(task);
              setDetailsDrawerStatus(true);
            }}
          />
        ) : (
          <div className="MasterDataDataGridDiv">
            <StyledDataGrid
              rows={filteredTasks}
              columns={columns}
              loading={loadingData}
              pageSize={10}
              className="DataGrid"
              columnVisibilityModel={columnVisibilityModel}
              onColumnVisibilityModelChange={(newModel) => {
                setColumnVisibilityModel(newModel);
                localStorage.setItem(
                  "tasksColumnVisibility",
                  JSON.stringify(newModel),
                );
              }}
              onRowClick={(params) => {
                setSelectedTask(params.row);
                setDetailsDrawerStatus(true);
              }}
            />
          </div>
        )}

        {/* Create Task Drawer */}
        <ResizableDrawer
          anchor="right"
          open={createTaskDrawerStatus}
          onClose={() => setCreateTaskDrawerStatus(false)}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          <NewTask
            handleCloseClick={() => setCreateTaskDrawerStatus(false)}
            handleRefresh={handleRefresh}
            projects={projects}
            staff={staff}
            loadingLookups={loadingLookups}
            selectedProjectId={projectFilter}
          />
        </ResizableDrawer>

        {/* Edit Task Drawer */}
        <ResizableDrawer
          anchor="right"
          open={editTaskDrawerStatus}
          onClose={() => setEditTaskDrawerStatus(false)}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          {selectedTask && (
            <EditTask
              handleCloseClick={() => setEditTaskDrawerStatus(false)}
              handleRefresh={handleRefresh}
              selectedTask={selectedTask}
              projects={projects}
              staff={staff}
              loadingLookups={loadingLookups}
            />
          )}
        </ResizableDrawer>

        {/* Task Details Drawer */}
        <ResizableDrawer
          anchor="right"
          open={detailsDrawerStatus}
          onClose={() => setDetailsDrawerStatus(false)}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              handleCloseClick={() => setDetailsDrawerStatus(false)}
              handleEdit={() => {
                setDetailsDrawerStatus(false);
                setEditTaskDrawerStatus(true);
              }}
              handleRefresh={handleRefresh}
              staff={staff}
            />
          )}
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Tasks;
