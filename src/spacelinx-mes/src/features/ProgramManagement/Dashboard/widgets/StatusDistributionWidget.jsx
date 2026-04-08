import React, { useState, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { fetchStatusDistribution } from "../../../../services/projectDashboardService";

const COLORS = {
  "To Do": "#9e9e9e",
  "In Progress": "#2196f3",
  "Logged": "#ff9800",
  "Completed": "#4caf50",
};

const StatusDistributionWidget = ({ widget, projectId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const distribution = await fetchStatusDistribution(projectId);
      setData(distribution.map((d) => ({
        name: d.status,
        value: d.count,
        color: COLORS[d.status] || "#666",
      })));
    } catch (err) {
      setError("Failed to load status distribution");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Status Distribution"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : data.length === 0 ? (
          <Alert severity="info">No tasks found</Alert>
        ) : (
          <div className="ChartContainer">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusDistributionWidget;
