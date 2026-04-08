import React from "react";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  ViewDay,
  ViewWeek,
  ViewModule,
  CalendarMonth,
  Refresh,
  ViewList,
  ViewListOutlined,
  Dashboard,
  Tune,
} from "@mui/icons-material";
import { ViewMode } from "gantt-task-react";
import { useNavigate } from "react-router-dom";

const GanttToolbar = ({
  viewMode,
  onViewModeChange,
  showTaskList,
  onToggleTaskList,
  onRefresh,
  projectId,
  isResizeEnabled,
  onToggleResize,
}) => {
  const navigate = useNavigate();

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  return (
    <Box className="GanttToolbar">
      <Box className="GanttToolbarLeft">
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          aria-label="view mode"
        >
          <ToggleButton value={ViewMode.Day} aria-label="day view">
            <Tooltip title="Day View">
              <ViewDay />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={ViewMode.Week} aria-label="week view">
            <Tooltip title="Week View">
              <ViewWeek />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={ViewMode.Month} aria-label="month view">
            <Tooltip title="Month View">
              <CalendarMonth />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value={ViewMode.QuarterDay} aria-label="quarter day view">
            <Tooltip title="Quarter Day View">
              <ViewModule />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip title={showTaskList ? "Hide Task List" : "Show Task List"}>
          <IconButton onClick={onToggleTaskList} size="small">
            {showTaskList ? <ViewList /> : <ViewListOutlined />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box className="GanttToolbarRight">
        <Tooltip title={isResizeEnabled ? "Disable Column Resize" : "Enable Column Resize"}>
          <ToggleButton
            value="check"
            selected={isResizeEnabled}
            onChange={onToggleResize}
            size="small"
            color="primary"
            sx={{ gap: 1, textTransform: "none" }}
          >
            <Tune />
            Resize Column
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small">
            <Refresh />
          </IconButton>
        </Tooltip>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Dashboard />}
          onClick={() => navigate(`/programmanagement/kanban/${projectId}`)}
        >
          Kanban View
        </Button>
      </Box>
    </Box>
  );
};

export default GanttToolbar;
