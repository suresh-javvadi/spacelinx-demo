import React, { useState, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import { fetchTaskSummary } from "../../../../services/projectDashboardService";

const TaskSummaryWidget = ({ widget, projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await fetchTaskSummary(projectId);
      setData(summary);
    } catch (err) {
      setError("Failed to load task summary");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="DashboardWidget TaskSummaryWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Task Summary"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">
            {error}
          </Alert>
        ) : (
          <div className="TaskSummaryGrid">
            <div className="TaskSummaryStat">
              <div className="StatValue">{data?.totalTasks || 0}</div>
              <div className="StatLabel">Total Tasks</div>
            </div>
            <div className="TaskSummaryStat completed">
              <div className="StatValue">{data?.completedTasks || 0}</div>
              <div className="StatLabel">Completed</div>
            </div>
            <div className="TaskSummaryStat in-progress">
              <div className="StatValue">{data?.inProgressTasks || 0}</div>
              <div className="StatLabel">In Progress</div>
            </div>
            <div className="TaskSummaryStat overdue">
              <div className="StatValue">{data?.overdueTasks || 0}</div>
              <div className="StatLabel">Overdue</div>
            </div>
            <div className="TaskSummaryStat high-priority">
              <div className="StatValue">{data?.highPriorityTasks || 0}</div>
              <div className="StatLabel">High Priority</div>
            </div>
            <div className="TaskSummaryStat">
              <div className="StatValue">{data?.averageProgress || 0}%</div>
              <div className="StatLabel">Avg Progress</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSummaryWidget;
