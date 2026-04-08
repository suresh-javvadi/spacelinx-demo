import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  MoreVert,
  Settings,
  Refresh,
  ViewTimeline,
} from "@mui/icons-material";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  fetchProjectKanbanData,
  moveTask,
  reorderTasks,
} from "../../../services/kanbanService";
import { fetchProjectById } from "../../../services/projectService";
import { AlertsContext } from "../../AlertsContext/Context";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import "./Kanban.css";

const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { Alert: showAlert } = useContext(AlertsContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kanbanData, setKanbanData] = useState(null);
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [ready, setReady] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (projectId) {
      loadKanbanData();
    }
  }, [projectId]);

  const loadKanbanData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kanbanResponse, projectResponse] = await Promise.all([
        fetchProjectKanbanData(projectId),
        fetchProjectById(projectId),
      ]);

      setKanbanData(kanbanResponse);
      setProject(projectResponse);
      setColumns(kanbanResponse.columns || []);
    } catch (err) {
      console.error("Error loading Kanban data:", err);
      setError("Failed to load Kanban board. Please try again.");
    } finally {
      setLoading(false);
      // Delay to ensure DOM is painted and container has dimensions
      setTimeout(() => {
        setReady(true);
      }, 100);
    }
  };

  // Helper to parse IDs
  const parseId = (dndId) => {
    if (!dndId) return { type: null, id: null };
    const str = String(dndId);
    if (str.startsWith("task-"))
      return { type: "task", id: str.replace("task-", "") };
    if (str.startsWith("col-"))
      return { type: "column", id: str.replace("col-", "") };
    return { type: "unknown", id: str };
  };

  const findColumnByTaskId = (taskId) => {
    // taskId here is the raw ID (number/string) from data, NOT the dnd-kit ID
    for (const column of columns) {
      if (column.tasks.some((task) => String(task.id) === String(taskId))) {
        return column;
      }
    }
    return null;
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const { id: activeId } = parseId(active.id);

    // activeId is now the raw task ID
    const column = findColumnByTaskId(activeId);
    if (column) {
      const task = column.tasks.find((t) => String(t.id) === String(activeId));
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const { id: activeTaskId } = parseId(active.id);
    const { id: overId, type: overType } = parseId(over.id);

    // Find source column
    const sourceColumn = findColumnByTaskId(activeTaskId);
    if (!sourceColumn) return;

    // Determine target column and position
    let targetColumn = null;
    let targetTaskIndex = -1;

    if (overType === "column") {
      // Dropped on column header - add to end
      targetColumn = columns.find((c) => String(c.id) === String(overId));
      targetTaskIndex = targetColumn ? targetColumn.tasks.length : -1;
    } else if (overType === "task") {
      // Dropped on a task - insert at that position
      targetColumn = findColumnByTaskId(overId);
      if (targetColumn) {
        targetTaskIndex = targetColumn.tasks.findIndex(
          (t) => String(t.id) === String(overId),
        );
      }
    }

    if (!targetColumn) return;

    // Same column - reorder
    if (sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.tasks.findIndex(
        (t) => String(t.id) === String(activeTaskId),
      );

      // Only reorder if we have a valid target index and it's different from current
      if (targetTaskIndex >= 0 && activeIndex !== targetTaskIndex) {
        const newTasks = arrayMove(
          sourceColumn.tasks,
          activeIndex,
          targetTaskIndex,
        );

        // Update local state
        setColumns((prev) =>
          prev.map((col) =>
            col.id === sourceColumn.id ? { ...col, tasks: newTasks } : col,
          ),
        );

        // Update server
        try {
          await reorderTasks(
            sourceColumn.id,
            newTasks.map((t, index) => ({ taskId: t.id, sortOrder: index })),
          );
        } catch (err) {
          console.error("Error reordering tasks:", err);
          showAlert("Failed to reorder tasks", "error");
          loadKanbanData();
        }
      }
    } else {
      // Different column - move task
      const taskToMove = sourceColumn.tasks.find(
        (t) => String(t.id) === String(activeTaskId),
      );

      if (!taskToMove) return;

      const newSourceTasks = sourceColumn.tasks.filter(
        (t) => String(t.id) !== String(activeTaskId),
      );
      const newTargetTasks = [...targetColumn.tasks];

      // Insert at the correct position (end of list if dropped on column header)
      const insertIndex =
        targetTaskIndex >= 0 ? targetTaskIndex : newTargetTasks.length;

      const updatedTask = {
        ...taskToMove,
        boardColumnId: targetColumn.id,
        status: targetColumn.name,
      };

      newTargetTasks.splice(insertIndex, 0, updatedTask);

      // Update local state
      setColumns((prev) =>
        prev.map((col) => {
          if (col.id === sourceColumn.id) {
            return { ...col, tasks: newSourceTasks };
          }
          if (col.id === targetColumn.id) {
            return { ...col, tasks: newTargetTasks };
          }
          return col;
        }),
      );

      // Update server
      try {
        await moveTask(activeTaskId, targetColumn.id, insertIndex);
        showAlert("Task moved successfully", "success");
      } catch (err) {
        console.error("Error moving task:", err);
        showAlert("Failed to move task", "error");
        loadKanbanData();
      }
    }
  };

  const handleTaskClick = (task) => {
    navigate(`/programmanagement/tasks?taskId=${task.id}`);
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  if (loading) {
    return (
      <Box className="KanbanLoading">
        <CircularProgress />
        <p>Loading Kanban board...</p>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="KanbanError">
        <Alert severity="error">{error}</Alert>
        <Button onClick={loadKanbanData} variant="contained" sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <div className="KanbanContainer">
      <div className="AdminChildrenHeader">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/programmanagement/projects")}
          >
            Back to Projects
          </Button>
          <p className="PageHeader">
            Kanban Board: {project?.name || "Project"}
          </p>
        </div>
        <div className="KanbanHeaderActions">
          <Tooltip title="Gantt View">
            <IconButton
              onClick={() => navigate(`/programmanagement/gantt/${projectId}`)}
            >
              <ViewTimeline />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={loadKanbanData}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton onClick={handleMenuOpen}>
              <MoreVert />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate(`/programmanagement/kanban/${projectId}/settings`);
              }}
            >
              <Settings sx={{ mr: 1 }} /> Column Settings
            </MenuItem>
          </Menu>
        </div>
      </div>

      {ready && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="KanbanBoardContent">
            <SortableContext
              items={columns.map((c) => `col-${c.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default KanbanBoard;
