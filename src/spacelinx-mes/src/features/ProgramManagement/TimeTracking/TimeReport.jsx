import { useState, useContext } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Close, Assessment, Download, Search } from "@mui/icons-material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { AlertsContext } from "../../AlertsContext/Context";
import { fetchTimeReport } from "../../../services/timeEntryService";
import "./TimeTracking.css";

const TimeReport = ({
  handleCloseClick,
  projects = [],
  staff = [],
  workTypes = [],
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    projectId: "",
    staffId: "",
    startDate: dayjs().subtract(1, "month"),
    endDate: dayjs(),
    billable: "",
    workType: "",
  });

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const apiFilters = {
        projectId: filters.projectId || undefined,
        staffId: filters.staffId || undefined,
        startDate: filters.startDate
          ? dayjs(filters.startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: filters.endDate
          ? dayjs(filters.endDate).format("YYYY-MM-DD")
          : undefined,
        billable:
          filters.billable !== ""
            ? filters.billable === "true"
            : undefined,
        workType: filters.workType || undefined,
      };

      const data = await fetchTimeReport(apiFilters);
      setReportData(data);
    } catch (error) {
      Alert("Error generating report", "error");
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData?.entries) return;

    const headers = [
      "Date",
      "Task",
      "Staff",
      "Hours",
      "Work Type",
      "Billable",
      "Description",
    ];
    const rows = reportData.entries.map((e) => [
      dayjs(e.entryDate).format("YYYY-MM-DD"),
      e.task?.name || "",
      e.staff ? `${e.staff.firstName} ${e.staff.lastName}` : "",
      e.hoursWorked,
      e.workType,
      e.billable ? "Yes" : "No",
      e.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `time_report_${dayjs().format("YYYY-MM-DD")}.csv`;
    link.click();
  };

  // Prepare chart data
  const workTypePieData =
    reportData?.byWorkType?.map((item, index) => ({
      id: index,
      value: item.hours,
      label: item.workType,
    })) || [];

  const staffBarData = reportData?.byStaff || [];

  const dateBarData = reportData?.byDate?.slice(-14) || []; // Last 14 days

  return (
    <Box className="TimeReportContainer">
      <Box className="DrawerHeader">
        <Box display="flex" alignItems="center" gap={1}>
          <Assessment />
          <Typography variant="h6">Time Report</Typography>
        </Box>
        <Button onClick={handleCloseClick} startIcon={<Close />}>
          Close
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Filters */}
      <Paper className="ReportFilters">
        <Typography variant="subtitle1" gutterBottom>
          Report Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Project</InputLabel>
              <Select
                value={filters.projectId}
                label="Project"
                onChange={(e) =>
                  handleFilterChange("projectId", e.target.value)
                }
              >
                <MenuItem value="">All Projects</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Staff</InputLabel>
              <Select
                value={filters.staffId}
                label="Staff"
                onChange={(e) => handleFilterChange("staffId", e.target.value)}
              >
                <MenuItem value="">All Staff</MenuItem>
                {staff.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {`${s.firstName} ${s.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Work Type</InputLabel>
              <Select
                value={filters.workType}
                label="Work Type"
                onChange={(e) => handleFilterChange("workType", e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {workTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange("startDate", date)}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange("endDate", date)}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Billable</InputLabel>
              <Select
                value={filters.billable}
                label="Billable"
                onChange={(e) => handleFilterChange("billable", e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Billable Only</MenuItem>
                <MenuItem value="false">Non-Billable Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={handleGenerateReport}
              startIcon={<Search />}
              fullWidth
              disabled={loading}
              sx={{ height: "40px" }}
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {reportData && !loading && (
        <>
          {/* Summary Cards */}
          <Box className="ReportSummary">
            <Paper className="SummaryCard">
              <Typography variant="caption" color="textSecondary">
                Total Hours
              </Typography>
              <Typography variant="h4" color="primary">
                {reportData.summary?.totalHours?.toFixed(2) || 0}
              </Typography>
            </Paper>
            <Paper className="SummaryCard">
              <Typography variant="caption" color="textSecondary">
                Billable Hours
              </Typography>
              <Typography variant="h4" color="success.main">
                {reportData.summary?.billableHours?.toFixed(2) || 0}
              </Typography>
            </Paper>
            <Paper className="SummaryCard">
              <Typography variant="caption" color="textSecondary">
                Non-Billable
              </Typography>
              <Typography variant="h4" color="text.secondary">
                {reportData.summary?.nonBillableHours?.toFixed(2) || 0}
              </Typography>
            </Paper>
            <Paper className="SummaryCard">
              <Typography variant="caption" color="textSecondary">
                Entries
              </Typography>
              <Typography variant="h4">
                {reportData.summary?.entryCount || 0}
              </Typography>
            </Paper>
          </Box>

          {/* Charts */}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Hours by Work Type Pie Chart */}
            {workTypePieData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Hours by Work Type
                  </Typography>
                  <PieChart
                    series={[
                      {
                        data: workTypePieData,
                        highlightScope: { fade: "global", highlight: "item" },
                        innerRadius: 30,
                        paddingAngle: 2,
                        cornerRadius: 5,
                      },
                    ]}
                    height={300}
                  />
                </Paper>
              </Grid>
            )}

            {/* Hours by Date Bar Chart */}
            {dateBarData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Hours by Date (Last 14 Days)
                  </Typography>
                  <BarChart
                    xAxis={[
                      {
                        scaleType: "band",
                        data: dateBarData.map((d) =>
                          dayjs(d.date).format("MM/DD")
                        ),
                      },
                    ]}
                    series={[
                      {
                        data: dateBarData.map((d) => d.hours),
                        label: "Hours",
                        color: "#1976d2",
                      },
                    ]}
                    height={300}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Staff Breakdown Table */}
          {staffBarData.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="subtitle1">Hours by Staff</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download />}
                  onClick={handleExportCSV}
                >
                  Export CSV
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Staff</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell align="right">% of Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffBarData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.staffName || row.staffId}</TableCell>
                        <TableCell align="right">
                          {row.hours.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {reportData.summary?.totalHours > 0
                            ? (
                                (row.hours /
                                  reportData.summary.totalHours) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <strong>Total</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {reportData.summary?.totalHours?.toFixed(2) || 0}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>100%</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Entries Table */}
          {reportData.entries?.length > 0 && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Time Entries ({reportData.entries.length})
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Task</TableCell>
                      <TableCell>Staff</TableCell>
                      <TableCell align="right">Hours</TableCell>
                      <TableCell>Work Type</TableCell>
                      <TableCell>Billable</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {dayjs(entry.entryDate).format("MM/DD/YYYY")}
                        </TableCell>
                        <TableCell>{entry.task?.name || ""}</TableCell>
                        <TableCell>
                          {entry.staff
                            ? `${entry.staff.firstName} ${entry.staff.lastName}`
                            : ""}
                        </TableCell>
                        <TableCell align="right">
                          {entry.hoursWorked.toFixed(2)}
                        </TableCell>
                        <TableCell>{entry.workType}</TableCell>
                        <TableCell>
                          {entry.billable ? "Yes" : "No"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {!reportData && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          p={4}
          color="text.secondary"
        >
          <Typography>
            Configure filters and click "Generate Report" to view time data.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TimeReport;
