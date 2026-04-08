import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Refresh,
  Settings,
  Close,
  DeleteOutline,
  RestartAlt,
  Edit,
  Check,
  Save,
} from "@mui/icons-material";
import GridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  fetchMyDashboard,
  bulkUpdatePositions,
  createDefaultDashboard,
} from "../../../services/dashboardWidgetService";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { fetchProjectsLookup } from "../../../services/projectService";
import { AlertsContext } from "../../AlertsContext/Context";
import { useUserContext } from "../../userContext/UserContext";
import { WIDGET_TYPES } from "../../ProgramManagement/config/widgetConfig.jsx";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";

import "./Dashboard.css";

const DASHBOARD_STORAGE_KEY = "pgm_dashboard_layout";

const ProjectDashboard = () => {
  const { Alert: showAlert } = useContext(AlertsContext);
  const { user } = useUserContext();
  const { width: dashboardWidth, containerRef, mounted } = useContainerWidth();

  const [loading, setLoading] = useState(true);
  const [widgets, setWidgets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  useEffect(() => {
    loadDashboard();
    loadProjects();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const savedLayout = localStorage.getItem(DASHBOARD_STORAGE_KEY);

      if (savedLayout) {
        setWidgets(JSON.parse(savedLayout));
      } else {
        // Default Layout
        const defaultWidgets = [
          // Row 1: Summary & Visual Charts
          {
            id: "1",
            widgetType: "TaskSummary",
            positionX: 0,
            positionY: 0,
            width: 4,
            height: 4,
          },
          {
            id: "2",
            widgetType: "StatusDistribution",
            positionX: 4,
            positionY: 0,
            width: 4,
            height: 4,
          },
          {
            id: "3",
            widgetType: "PriorityBreakdown",
            positionX: 8,
            positionY: 0,
            width: 4,
            height: 4,
          },

          // Row 2: Progress & Lists
          {
            id: "4",
            widgetType: "ProjectProgress",
            positionX: 0,
            positionY: 4,
            width: 4,
            height: 4,
          },
          {
            id: "5",
            widgetType: "OverdueTasks",
            positionX: 4,
            positionY: 4,
            width: 4,
            height: 4,
          },
          {
            id: "6",
            widgetType: "MyTasks",
            positionX: 8,
            positionY: 4,
            width: 4,
            height: 4,
          },
        ];
        setWidgets(defaultWidgets);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      showAlert("Error loading dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveDashboard = (newWidgets) => {
    setWidgets(newWidgets);
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(newWidgets));
  };

  const handleResetLayout = async () => {
    const isConfirmed = await showConfirmation(
      "Reset Layout?",
      "Are you sure you want to reset the dashboard layout to default?",
      "Yes, Reset it!",
    );

    if (isConfirmed) {
      localStorage.removeItem(DASHBOARD_STORAGE_KEY);
      loadDashboard();
      showAlert("Dashboard layout reset", "success");
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await fetchProjectsLookup();
      setProjects(projectsData.filter((p) => p.name));
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleLayoutChange = useCallback(
    (layout) => {
      const newWidgets = widgets.map((widget) => {
        const layoutItem = layout.find((l) => l.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            positionX: layoutItem.x,
            positionY: layoutItem.y,
            width: layoutItem.w,
            height: layoutItem.h,
          };
        }
        return widget;
      });
      if (isEditing) {
        saveDashboard(newWidgets);
      }
    },
    [widgets, isEditing],
  );

  const handleAddWidget = (widgetTypeKey) => {
    const widgetConfig = WIDGET_TYPES[widgetTypeKey];
    // Calculate smart position
    let positionX = 0;
    if (widgets.length > 0) {
      const lastWidget = widgets[widgets.length - 1];
      const nextX = (lastWidget.positionX || 0) + (lastWidget.width || 0);
      if (nextX + widgetConfig.defaultWidth <= 12) {
        positionX = nextX;
      }
    }

    const newWidget = {
      id: `widget-${Date.now()}`,
      widgetType: widgetTypeKey,
      positionX: positionX,
      positionY: Infinity,
      width: widgetConfig.defaultWidth,
      height: widgetConfig.defaultHeight,
    };

    saveDashboard([...widgets, newWidget]);
    setShowAddWidget(false);
    showAlert(`${widgetConfig.label} added`, "success");
  };

  const handleRemoveWidget = (widgetId) => {
    const newWidgets = widgets.filter((w) => w.id !== widgetId);
    saveDashboard(newWidgets);
  };

  const renderWidget = (widget) => {
    const widgetConfig = WIDGET_TYPES[widget.widgetType];

    if (!widgetConfig) {
      return (
        <Box className="DashboardWidget DashboardWidgetError">
          <Alert severity="warning">Unknown widget: {widget.widgetType}</Alert>
          {isEditing && (
            <IconButton
              size="small"
              onClick={() => handleRemoveWidget(widget.id)}
              sx={{ position: "absolute", top: 5, right: 5 }}
            >
              <DeleteOutline />
            </IconButton>
          )}
        </Box>
      );
    }

    const WidgetComponent = widgetConfig.component;

    return (
      <div className="WidgetWrapper">
        {isEditing && (
          <div className="WidgetEditOverlay">
            <IconButton
              size="small"
              onClick={() => handleRemoveWidget(widget.id)}
              color="error"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </div>
        )}
        <WidgetComponent
          key={widget.id}
          widget={widget}
          projectId={projectFilter || widget.projectId}
        />
      </div>
    );
  };

  const layout = widgets.map((widget) => ({
    i: widget.id,
    x: widget.positionX,
    y: widget.positionY,
    w: widget.width,
    h: widget.height,
    minW: 2,
    minH: 2,
  }));

  if (loading) {
    return (
      <Box className="DashboardLoading">
        <CircularProgress />
        <p>Loading dashboard...</p>
      </Box>
    );
  }

  return (
    <div className="AdminChildren DashboardContainer">
      <div className="AdminChildrenHeader">
        <div>
          <p className="PageHeader">Project Dashboard</p>
        </div>
        <div className="AdminChildrenHeaderButtons">
          <FormControl size="small" sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Filter by Project</InputLabel>
            <Select
              value={projectFilter}
              label="Filter by Project"
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="Reset Layout">
            <IconButton onClick={handleResetLayout}>
              <RestartAlt />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Refresh">
            <IconButton onClick={loadDashboard}>
              <Refresh />
            </IconButton>
          </Tooltip> */}

          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setIsEditing(true)}
              size="small"
            >
              Edit Layout
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowAddWidget(true)}
                size="small"
                sx={{ ml: 2, mr: 1 }}
              >
                Add Widget
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<Check />}
                onClick={() => setIsEditing(false)}
                size="small"
              >
                Save Layout
              </Button>
            </>
          )}
        </div>
      </div>

      {widgets.length === 0 ? (
        <Box className="DashboardEmpty">
          <Alert severity="info">
            No dashboard widgets configured. Click below to create a default
            dashboard.
          </Alert>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              user?.id && createDefaultDashboard(user.id).then(loadDashboard)
            }
            sx={{ mt: 2 }}
          >
            Create Default Dashboard
          </Button>
        </Box>
      ) : (
        <div className="DashboardGrid" ref={containerRef}>
          {mounted && (
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={100}
              width={dashboardWidth}
              isDraggable={isEditing}
              isResizable={isEditing}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".WidgetHeader"
              margin={[16, 16]}
            >
              {widgets.map((widget) => (
                <div key={widget.id} className="DashboardWidgetWrapper">
                  {renderWidget(widget)}
                </div>
              ))}
            </GridLayout>
          )}
        </div>
      )}

      {/* Add Widget Drawer */}
      <ResizableDrawer
        open={showAddWidget}
        onClose={() => setShowAddWidget(false)}
        title="Add Widget"
        width={400}
      >
        <Box className="AddWidgetList">
          {Object.values(WIDGET_TYPES).map((type) => (
            <Box
              key={type.id}
              className="AddWidgetListItem"
              onClick={() => handleAddWidget(type.id)}
            >
              <div className="AddWidgetIconWrapper">{type.icon}</div>
              <div className="AddWidgetText">
                <p className="AddWidgetTitle">{type.label}</p>
                <p className="AddWidgetDesc">{type.description}</p>
              </div>
            </Box>
          ))}
        </Box>
      </ResizableDrawer>
    </div>
  );
};

export default ProjectDashboard;
