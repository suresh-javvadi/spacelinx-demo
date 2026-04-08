import React, { useState, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { fetchPriorityBreakdown } from "../../../../services/projectDashboardService";

const COLORS = {
  High: "#f44336",
  Medium: "#ff9800",
  Low: "#4caf50",
};

const PriorityBreakdownWidget = ({ widget, projectId }) => {
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
      const breakdown = await fetchPriorityBreakdown(projectId);
      setData(breakdown.map((d) => ({
        name: d.priority,
        value: d.count,
        color: COLORS[d.priority] || "#666",
      })));
    } catch (err) {
      setError("Failed to load priority breakdown");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Priority Breakdown"}</h3>
      </div>
      <div className="WidgetContent">
        {loading ? (
          <div className="WidgetLoading">
            <CircularProgress size={24} />
          </div>
        ) : error ? (
          <Alert severity="error" className="WidgetError">{error}</Alert>
        ) : data.length === 0 ? (
          <Alert severity="info">No active tasks</Alert>
        ) : (
          <div className="ChartContainer">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={60} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityBreakdownWidget;
