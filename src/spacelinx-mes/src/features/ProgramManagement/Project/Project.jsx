import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Drawer, IconButton, Tooltip } from "@mui/material";
import { Add, ViewTimeline, Dashboard } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchProject } from "../../../services/projectService";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import NewProject from "./NewProject";
import EditProject from "./EditProject";
import { fetchUsers } from "../../../services/userService";
import { fetchProgramLookup } from "../../../services/programService";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Project = () => {
  const navigate = useNavigate();
  const [loadingData, setLoadingData] = useState(true);
  const [projectsData, setProjectsData] = useState([]);
  const [createProjectDrawerStatus, setCreateProjectDrawerStatus] =
    useState(false);
  const [editProjectsDrawerStatus, setEditProjectsDrawerStatus] =
    useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingOptionSets, setLoadingOptionSets] = useState(true);
  const [managerRoles, setManagerRoles] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingProgram, setLoadingProgram] = useState(true);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("projectColumnVisibility");
    return saved
      ? JSON.parse(saved)
      : {
          startDate: false,
          endDate: false,
          description: false,
        };
  });

  const handleCloseDrawer = () => setCreateProjectDrawerStatus(false);
  const handleCloseClick = () => setEditProjectsDrawerStatus(false);

  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };

  useEffect(() => {
    fetchManagerData();
    fetchProgramData();
  }, []);

  const fetchManagerData = async () => {
    setLoadingOptionSets(true);
    try {
      const data = await fetchUsers();
      const activeStaff = data.filter((user) => user.isActive);
      setManagerRoles(activeStaff);
    } catch (error) {
      Alert("Error fetching staff data", "error");
      console.error("Error fetching staff:", error);
    } finally {
      setLoadingOptionSets(true);
    }
  };

  const fetchProgramData = async () => {
    setLoadingProgram(true);
    try {
      const data = await fetchProgramLookup();
      const activePrograms = data.filter((program) => program.name);
      setPrograms(activePrograms);
    } catch (error) {
      Alert("Error fetching program data", "error");
      console.error("Error fetching programs:", error);
    } finally {
      setLoadingProgram(false);
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const response = await fetchProject();
      if (response) {
        const sortedData = response.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setProjectsData(sortedData);
      }
    } catch (error) {
      Alert("Error fetching project data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = () => {
    setCreateProjectDrawerStatus(true);
  };

  const columns = [
    {
      field: "projectCode",
      headerName: "Project Code",
      flex: 0.5,
    },
    {
      field: "name",
      headerName: "Project Name",
      flex: 0.5,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
    },
    {
      field: "projectManagerFirstName",
      headerName: "Project Manager",
      flex: 0.5,
      valueGetter: (_value, row) =>
        `${row.projectManager?.firstName || ""} ${
          row.projectManager?.lastName || ""
        }`,
    },
    {
      field: "programName",
      headerName: "Linked Program",
      flex: 0.5,
      valueGetter: (_value, row) => row.program?.name ?? "",
    },
    {
      field: "budget",
      headerName: "Budget (in ₹)",
      flex: 0.5,
      valueGetter: (_value, row) => row.budget || 0,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 0.5,
      valueGetter: (_value, row) => {
        const date = row.startDate;
        return date ? new Date(date).toISOString().split("T")[0] : "";
      },
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 0.5,
      valueGetter: (_value, row) => {
        const date = row.endDate;
        return date ? new Date(date).toISOString().split("T")[0] : "";
      },
    },
    {
      field: "description",
      headerName: "Description",
      flex: 0.5,
      valueGetter: (_value, row) => row.description || "",
    },
    {
      field: "actions",
      headerName: "Views",
      flex: 0.4,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Gantt Chart">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/programmanagement/gantt/${params.row.id}`);
              }}
            >
              <ViewTimeline fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Kanban Board">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/programmanagement/kanban/${params.row.id}`);
              }}
            >
              <Dashboard fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Project</p>
          </div>
          <div className="AdminChildrenHeaderButtons">
            <Button
              variant="contained"
              onClick={handleCreateProject}
              startIcon={<Add />}
            >
              Add New
            </Button>
          </div>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={projectsData}
            columns={columns}
            loading={loadingData}
            pageSize={5}
            className="DataGrid"
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => {
              setColumnVisibilityModel(newModel);
              localStorage.setItem(
                "projectColumnVisibility",
                JSON.stringify(newModel),
              );
            }}
            onRowClick={(params) => {
              setSelectedProject(params.row);
              setEditProjectsDrawerStatus(true);
            }}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={createProjectDrawerStatus}
          onClose={handleCloseDrawer}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          <NewProject
            handleCloseClick={handleCloseDrawer}
            handleRefresh={handleRefresh}
            managerRoles={managerRoles}
            programs={programs}
            loadingOptionSets={loadingOptionSets}
            loadingProgram={loadingProgram}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editProjectsDrawerStatus}
          onClose={handleCloseClick}
          PaperProps={{ className: "ECODrawerStyles" }}
        >
          {selectedProject && (
            <EditProject
              handleCloseClick={handleCloseClick}
              handleRefresh={fetchData}
              selectedProject={selectedProject}
              managerRoles={managerRoles}
              programs={programs}
              loadingOptionSets={loadingOptionSets}
              loadingProgram={loadingProgram}
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

export default Project;
