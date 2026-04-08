import React, { useState, useEffect } from "react";
import { CircularProgress, Alert, LinearProgress } from "@mui/material";
import { fetchProjectProgress } from "../../../../services/projectDashboardService";

const ProjectProgressWidget = ({ widget }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjectProgress();
      setProjects(data.slice(0, 10)); // Limit to top 10 projects
    } catch (err) {
      setError("Failed to load project progress");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return "success";
    if (percent >= 50) return "primary";
    if (percent >= 25) return "warning";
    return "error";
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Project Progress"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : projects.length === 0 ? (
          <Alert severity="info">No projects found</Alert>
        ) : (
          <ul className="ProgressList">
            {projects.map((project) => (
              <li key={project.projectId} className="ProgressItem">
                <div className="ProgressHeader">
                  <span className="ProgressProjectName">{project.projectName}</span>
                  <span className="ProgressPercent">{project.completionPercent}%</span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={project.completionPercent}
                  color={getProgressColor(project.completionPercent)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <div className="ProgressTasks">
                  {project.completedTasks}/{project.totalTasks} tasks completed
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectProgressWidget;
