import React, { useState, useEffect } from "react";
import { CircularProgress, Alert } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { fetchTimeLoggedChart } from "../../../../services/projectDashboardService";

const TimeLoggedChartWidget = ({ widget, projectId }) => {
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
      const { fetchTimeEntries, fetchTimeEntriesByProject } =
        await import("../../../../services/timeEntryService");
      let rawEntries = [];
      if (projectId) {
        rawEntries = await fetchTimeEntriesByProject(projectId);
      } else {
        rawEntries = await fetchTimeEntries();
      }
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const dateMap = new Map();
      for (
        let d = new Date(thirtyDaysAgo);
        d <= today;
        d.setDate(d.getDate() + 1)
      ) {
        const dateKey = d.toISOString().split("T")[0];
        dateMap.set(dateKey, 0);
      }
      rawEntries.forEach((entry) => {
        if (!entry.entryDate) return;
        const entryDate = new Date(entry.entryDate).toISOString().split("T")[0];
        if (dateMap.has(entryDate)) {
          dateMap.set(
            entryDate,
            dateMap.get(entryDate) + (entry.hoursWorked || 0),
          );
        }
      });
      const chartData = Array.from(dateMap.entries()).map(([date, hours]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        hours: parseFloat(hours.toFixed(1)),
      }));

      setData(chartData);
    } catch (err) {
      setError("Failed to load time chart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="DashboardWidget">
      <div className="WidgetHeader">
        <h3>{widget.title || "Time Logged (30 days)"}</h3>
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
        ) : data.length === 0 ? (
          <Alert severity="info">No time logged in the last 30 days</Alert>
        ) : (
          <div className="ChartContainer">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={data}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => [`${value} hours`, "Time Logged"]}
                />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#2196f3"
                  fill="#2196f3"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeLoggedChartWidget;
