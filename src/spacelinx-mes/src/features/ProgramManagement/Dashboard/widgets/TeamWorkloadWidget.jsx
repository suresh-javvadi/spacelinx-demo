import React, { useState, useEffect } from "react";
import { CircularProgress, Alert, Chip, Avatar } from "@mui/material";
import { fetchTeamWorkload } from "../../../../services/projectDashboardService";

const TeamWorkloadWidget = ({ widget, projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workload, setWorkload] = useState([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeamWorkload(projectId);
      setWorkload(data.slice(0, 10)); // Top 10 team members
    } catch (err) {
      setError("Failed to load team workload");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Team Workload"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : workload.length === 0 ? (
          <Alert severity="info">No team members with active tasks</Alert>
        ) : (
          <ul className="WorkloadList">
            {workload.map((member) => (
              <li key={member.staffId} className="WorkloadItem">
                <Avatar
                  src={member.imageUrl}
                  sx={{ width: 36, height: 36 }}
                >
                  {getInitials(member.staffName)}
                </Avatar>
                <div className="WorkloadInfo">
                  <div className="WorkloadName">{member.staffName}</div>
                  <div className="WorkloadMeta">
                    {member.activeTasks} tasks
                    {member.overdueTasks > 0 && (
                      <span className="OverdueText">
                        ({member.overdueTasks} overdue)
                      </span>
                    )}
                  </div>
                </div>
                {member.highPriorityTasks > 0 && (
                  <Chip
                    label={`${member.highPriorityTasks} high`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeamWorkloadWidget;
