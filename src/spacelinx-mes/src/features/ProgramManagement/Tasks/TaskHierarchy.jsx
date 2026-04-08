import React, { useState, useEffect, useContext } from "react";
import {
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  Assignment,
} from "@mui/icons-material";
import { fetchTaskHierarchy } from "../../../services/taskService";
import { AlertsContext } from "../../AlertsContext/Context";
import "./Tasks.css";

const TaskHierarchyItem = ({ task, level = 0, onTaskClick }) => {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = task.subTasks && task.subTasks.length > 0;

  const getStatusChipClass = (status) => {
    const statusMap = {
      "Completed": "completed",
      "In Progress": "in-progress",
      "To Do": "to-do",
      "Logged": "logged",
    };
    return statusMap[status] || "to-do";
  };

  return (
    <>
      <div
        className="TaskHierarchyItem"
        style={{
          paddingLeft: 16 + level * 24,
          borderLeft: level > 0 ? "2px solid #e0e0e0" : "none",
          marginLeft: level > 0 ? 12 : 0,
        }}
        onClick={() => onTaskClick(task)}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            sx={{ mr: 1 }}
          >
            {expanded ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        ) : (
          <Assignment sx={{ mr: 1, ml: 1, color: "#666" }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: level === 0 ? 600 : 400 }}>
              {task.name}
            </span>
            <Chip
              label={task.status}
              size="small"
              className={`TaskStatusChip ${getStatusChipClass(task.status)}`}
            />
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {task.taskCode}
            {task.assignedTo && (
              <span style={{ marginLeft: 16 }}>
                {task.assignedTo.firstName} {task.assignedTo.lastName}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#666" }}>
            {task.progressPercent || 0}%
          </span>
          <LinearProgress
            variant="determinate"
            value={task.progressPercent || 0}
            sx={{ width: 80, height: 6, borderRadius: 3 }}
            color={task.progressPercent >= 100 ? "success" : "primary"}
          />
        </div>
      </div>

      {hasChildren && (
        <Collapse in={expanded}>
          {task.subTasks.map((subtask) => (
            <TaskHierarchyItem
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onTaskClick={onTaskClick}
            />
          ))}
        </Collapse>
      )}
    </>
  );
};

const TaskHierarchy = ({ projectId, onTaskClick }) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (projectId) {
      loadHierarchy();
    }
  }, [projectId]);

  const loadHierarchy = async () => {
    setLoading(true);
    try {
      const data = await fetchTaskHierarchy(projectId);
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading task hierarchy:", error);
      Alert("Failed to load task hierarchy", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (tasks.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32, color: "#666" }}>
        <Assignment sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
        <p>No tasks found for this project</p>
      </div>
    );
  }

  return (
    <div className="TaskHierarchy">
      {tasks.map((task) => (
        <TaskHierarchyItem
          key={task.id}
          task={task}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};

export default TaskHierarchy;
