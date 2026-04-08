import React, { useState, useEffect } from "react";
import { CircularProgress, Alert, Chip } from "@mui/material";
import { fetchDashboardMyTasks } from "../../../../services/projectDashboardService";

const MyTasksWidget = ({ widget }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardMyTasks(10);
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "High") return "error";
    if (priority === "Medium") return "warning";
    return "default";
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return "";
    const date = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "My Tasks"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : tasks.length === 0 ? (
          <Alert severity="info">No active tasks assigned to you</Alert>
        ) : (
          <ul className="MyTasksList">
            {tasks.map((task) => (
              <li key={task.id} className="MyTaskItem">
                <div className="MyTaskInfo">
                  <div className="MyTaskName">{task.name}</div>
                  <div className="MyTaskMeta">
                    {task.project?.name} - {formatDueDate(task.dueDate)}
                  </div>
                </div>
                <Chip
                  label={task.priority}
                  size="small"
                  color={getPriorityColor(task.priority)}
                  variant="outlined"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyTasksWidget;
