import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Alert, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import {
  fetchProjectGanttData,
  updateTaskDates,
  updateTaskProgress,
} from "../../../services/ganttService";
import { fetchProjectById } from "../../../services/projectService";
import { AlertsContext } from "../../AlertsContext/Context";
import GanttToolbar from "./GanttToolbar";
import "./Gantt.css";

const GanttView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { Alert: showAlert } = useContext(AlertsContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ganttData, setGanttData] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState(ViewMode.Day);
  const [showTaskList, setShowTaskList] = useState(true);
  const [ready, setReady] = useState(false);

  const [taskListWidth, setTaskListWidth] = useState(155);
  const [isResizeEnabled, setIsResizeEnabled] = useState(false);
  const isResizing = React.useRef(false);

  useEffect(() => {
    if (projectId) {
      loadGanttData();
    }
  }, [projectId]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      setTaskListWidth((prevWidth) => {
        const newWidth = prevWidth + e.movementX;
        return Math.max(50, Math.min(800, newWidth)); // Min 50px, Max 800px
      });
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const startResize = () => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
  };

  const loadGanttData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ganttResponse, projectResponse] = await Promise.all([
        fetchProjectGanttData(projectId),
        fetchProjectById(projectId),
      ]);

      setGanttData(ganttResponse);
      setProject(projectResponse);

      // Convert API data to gantt-task-react format
      const ganttTasks = convertToGanttTasks(ganttResponse.tasks);
      setTasks(ganttTasks);
    } catch (err) {
      console.error("Error loading Gantt data:", err);
      setError("Failed to load Gantt chart data. Please try again.");
    } finally {
      setLoading(false);
      // Delay to ensure DOM is painted and container has dimensions
      setTimeout(() => {
        setReady(true);
      }, 100);
    }
  };

  const convertToGanttTasks = (apiTasks) => {
    return apiTasks
      .filter((task) => task.startDate && task.dueDate)
      .map((task) => ({
        id: task.id,
        name: task.name,
        start: new Date(task.startDate),
        end: new Date(task.dueDate),
        progress: task.progress || 0,
        type: task.taskType === "Milestone" ? "milestone" : "task",
        project: task.parentTaskId || undefined,
        dependencies:
          task.dependencies
            ?.filter(
              (d) =>
                d.dependencyType === "FinishToStart" ||
                d.dependencyType === "FS",
            )
            .map((d) => d.predecessorTaskId) || [],
        styles: {
          backgroundColor: getTaskColor(task.status, task.priority),
          progressColor: getProgressColor(task.progress),
        },
        // Custom data for display
        taskCode: task.taskCode,
        status: task.status,
        priority: task.priority,
        assignedToName: task.assignedToName,
      }));
  };

  const getTaskColor = (status, priority) => {
    if (status === "Completed") return "#4caf50";
    if (priority === "High") return "#f44336";
    if (priority === "Low") return "#9e9e9e";
    return "#2196f3";
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "#2e7d32";
    if (progress >= 50) return "#1976d2";
    return "#ed6c02";
  };

  const handleTaskChange = async (task) => {
    try {
      await updateTaskDates(
        task.id,
        task.start.toISOString(),
        task.end.toISOString(),
      );
      showAlert("Task dates updated successfully", "success");

      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, start: task.start, end: task.end } : t,
        ),
      );
    } catch (err) {
      console.error("Error updating task dates:", err);
      showAlert("Failed to update task dates", "error");
      // Reload data to restore previous state
      loadGanttData();
    }
  };

  const handleProgressChange = async (task) => {
    try {
      await updateTaskProgress(task.id, Math.round(task.progress));
      showAlert("Task progress updated successfully", "success");

      // Update local state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, progress: task.progress } : t,
        ),
      );
    } catch (err) {
      console.error("Error updating task progress:", err);
      showAlert("Failed to update task progress", "error");
      loadGanttData();
    }
  };

  const handleDoubleClick = (task) => {
    // Navigate to task details or open edit drawer
    navigate(`/programmanagement/tasks?taskId=${task.id}`);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleToggleTaskList = () => {
    setShowTaskList(!showTaskList);
  };

  if (loading) {
    return (
      <Box className="GanttLoading">
        <CircularProgress />
        <p>Loading Gantt chart...</p>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="GanttError">
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadGanttData} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <div className="GanttContainer">
      <div className="AdminChildrenHeader">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/programmanagement/projects")}
          >
            Back to Projects
          </Button>
          <p className="PageHeader">
            Gantt Chart: {project?.name || "Project"}
          </p>
        </div>
      </div>

      <GanttToolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        showTaskList={showTaskList}
        onToggleTaskList={handleToggleTaskList}
        onRefresh={loadGanttData}
        projectId={projectId}
        isResizeEnabled={isResizeEnabled}
        onToggleResize={() => setIsResizeEnabled(!isResizeEnabled)}
      />

      {tasks.length === 0 ? (
        <Box className="GanttEmpty">
          <Alert severity="info">
            No tasks with dates found for this project. Add tasks with start and
            due dates to see them on the Gantt chart.
          </Alert>
        </Box>
      ) : (
        <div className="GanttChartWrapper">
          {ready && (
            <>
              <Gantt
                key={`${projectId}-${viewMode}-${tasks.length}`}
                tasks={tasks}
                viewMode={viewMode}
                onDateChange={handleTaskChange}
                onProgressChange={handleProgressChange}
                onDoubleClick={handleDoubleClick}
                listCellWidth={showTaskList ? `${taskListWidth}px` : ""}
                columnWidth={
                  viewMode === ViewMode.Month
                    ? 300
                    : viewMode === ViewMode.Week
                      ? 250
                      : 60
                }
                ganttHeight={500}
                TooltipContent={({ task }) => (
                  <div className="GanttTooltip">
                    <strong>{task.name}</strong>
                    {task.taskCode && <p>Code: {task.taskCode}</p>}
                    <p>Status: {task.status}</p>
                    <p>Priority: {task.priority}</p>
                    <p>Progress: {task.progress}%</p>
                    {task.assignedToName && (
                      <p>Assigned: {task.assignedToName}</p>
                    )}
                    <p>
                      {task.start.toLocaleDateString()} -{" "}
                      {task.end.toLocaleDateString()}
                    </p>
                  </div>
                )}
              />
              {showTaskList && isResizeEnabled && (
                <div
                  className="GanttResizeHandle"
                  onMouseDown={startResize}
                  style={{ left: taskListWidth }}
                  title="Drag to resize column"
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GanttView;
