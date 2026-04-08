import React, { useState, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import {
  Edit,
  Add,
  Delete,
  CheckCircle,
  Comment,
  AccessTime,
  Person,
} from "@mui/icons-material";
import { fetchRecentActivity } from "../../../../services/projectDashboardService";

const activityIcons = {
  Created: <Add fontSize="small" />,
  Updated: <Edit fontSize="small" />,
  Deleted: <Delete fontSize="small" />,
  StatusChanged: <CheckCircle fontSize="small" />,
  CommentAdded: <Comment fontSize="small" />,
  TimeLogged: <AccessTime fontSize="small" />,
  AssigneeAdded: <Person fontSize="small" />,
  AssigneeRemoved: <Person fontSize="small" />,
  ProgressChanged: <CheckCircle fontSize="small" />,
};

const RecentActivityWidget = ({ widget, projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentActivity(projectId, 15);
      setActivities(data);
    } catch (err) {
      setError("Failed to load activity");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Recent Activity"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : activities.length === 0 ? (
          <Alert severity="info">No recent activity</Alert>
        ) : (
          <ul className="ActivityList">
            {activities.map((activity) => (
              <li key={activity.id} className="ActivityItem">
                <div className="ActivityIcon">
                  {activityIcons[activity.activityType] || <Edit fontSize="small" />}
                </div>
                <div className="ActivityContent">
                  <div className="ActivityDescription">
                    <strong>{activity.createdBy}</strong> {activity.description || activity.activityType}
                  </div>
                  <div className="ActivityTime">{formatTime(activity.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentActivityWidget;
