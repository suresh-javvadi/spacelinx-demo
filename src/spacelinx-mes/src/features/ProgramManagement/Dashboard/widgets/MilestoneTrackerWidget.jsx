import React, { useState, useEffect } from "react";
import { CircularProgress, Alert, LinearProgress, Chip } from "@mui/material";
import { fetchMilestoneTracker } from "../../../../services/projectDashboardService";

const MilestoneTrackerWidget = ({ widget, projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMilestoneTracker(projectId);
      setMilestones(data.slice(0, 10)); // Limit to 10 milestones
    } catch (err) {
      setError("Failed to load milestones");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Milestone Tracker"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : milestones.length === 0 ? (
          <Alert severity="info">No milestones found</Alert>
        ) : (
          <ul className="MilestoneList">
            {milestones.map((milestone) => (
              <li
                key={milestone.milestoneId}
                className={`MilestoneItem ${milestone.isOverdue ? "overdue" : ""}`}
              >
                <div className="MilestoneHeader">
                  <span className="MilestoneName">{milestone.milestoneName}</span>
                  {milestone.isOverdue && (
                    <Chip label="Overdue" size="small" color="error" />
                  )}
                </div>
                <LinearProgress
                  variant="determinate"
                  value={milestone.progress}
                  sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  color={milestone.progress >= 100 ? "success" : "primary"}
                />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="MilestoneDate">
                    Target: {formatDate(milestone.targetDate)}
                  </span>
                  <span style={{ fontSize: 12 }}>
                    {milestone.completedTasks}/{milestone.totalTasks} tasks
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MilestoneTrackerWidget;
