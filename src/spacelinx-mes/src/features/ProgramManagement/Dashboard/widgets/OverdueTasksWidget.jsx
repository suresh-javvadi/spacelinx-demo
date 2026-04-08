import React, { useState, useEffect } from "react";
import { CircularProgress, Alert, Chip } from "@mui/material";
import { fetchOverdueTasks } from "../../../../services/projectDashboardService";

const OverdueTasksWidget = ({ widget, projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOverdueTasks(projectId, 10);
      setTasks(data);
    } catch (err) {
      setError("Failed to load overdue tasks");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = (dueDate) => {
    const date = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((today - date) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Overdue Tasks"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : tasks.length === 0 ? (
          <Alert severity="success">No overdue tasks</Alert>
        ) : (
          <ul className="OverdueList">
            {tasks.map((task) => (
              <li key={task.id} className="OverdueItem">
                <div>
                  <div className="OverdueTaskName">{task.name}</div>
                  <div className="OverdueDays">
                    {getDaysOverdue(task.dueDate)} days overdue
                  </div>
                </div>
                <Chip
                  label={task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : "Unassigned"}
                  size="small"
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

export default OverdueTasksWidget;
