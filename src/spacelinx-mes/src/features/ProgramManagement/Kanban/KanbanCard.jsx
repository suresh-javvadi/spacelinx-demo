import React from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  AvatarGroup,
} from "@mui/material";
import { Schedule, Flag } from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const KanbanCard = ({ task, onClick, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: `task-${task.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`KanbanCard ${isDragging ? "KanbanCardDragging" : ""}`}
      onClick={onClick}
    >
      <Box className="KanbanCardHeader">
        {task.taskCode && (
          <Typography variant="caption" className="KanbanCardCode">
            {task.taskCode}
          </Typography>
        )}
        <Tooltip title={`Priority: ${task.priority}`}>
          <Flag
            sx={{
              fontSize: 16,
              color: getPriorityColor(task.priority),
            }}
          />
        </Tooltip>
      </Box>

      <Typography variant="body2" className="KanbanCardTitle">
        {task.name}
      </Typography>

      {task.description && (
        <Typography
          variant="caption"
          className="KanbanCardDescription"
          sx={{ color: "text.secondary" }}
        >
          {task.description.length > 80
            ? `${task.description.substring(0, 80)}...`
            : task.description}
        </Typography>
      )}

      {task.progress > 0 && (
        <Box className="KanbanCardProgress">
          <LinearProgress
            variant="determinate"
            value={task.progress}
            color={task.progress >= 100 ? "success" : "primary"}
            sx={{ height: 4, borderRadius: 2 }}
          />
          <Typography variant="caption" sx={{ ml: 1, minWidth: 35 }}>
            {task.progress}%
          </Typography>
        </Box>
      )}

      <Box className="KanbanCardFooter">
        <Box className="KanbanCardMeta">
          {task.dueDate && (
            <Tooltip title={isOverdue ? "Overdue!" : "Due date"}>
              <Chip
                icon={<Schedule sx={{ fontSize: 14 }} />}
                label={new Date(task.dueDate).toLocaleDateString()}
                size="small"
                className={`KanbanCardDueDate ${isOverdue ? "overdue" : ""}`}
                sx={{
                  height: 22,
                  "& .MuiChip-label": { px: 0.5, fontSize: 11 },
                  backgroundColor: isOverdue ? "#ffebee" : "transparent",
                  color: isOverdue ? "#d32f2f" : "inherit",
                }}
              />
            </Tooltip>
          )}
        </Box>

        <Box className="KanbanCardAssignees">
          {task.assignees && task.assignees.length > 0 ? (
            <AvatarGroup
              max={3}
              sx={{
                "& .MuiAvatar-root": { width: 24, height: 24, fontSize: 10 },
              }}
            >
              {task.assignees.map((assignee) => (
                <Tooltip
                  key={assignee.staffId}
                  title={assignee.staffName || "Unknown"}
                >
                  <Avatar
                    src={assignee.imageUrl}
                    sx={{ width: 24, height: 24 }}
                  >
                    {assignee.staffName?.[0] || "?"}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          ) : task.assignedToName ? (
            <Tooltip title={task.assignedToName}>
              <Avatar
                src={task.assignedToImageUrl}
                sx={{ width: 24, height: 24, fontSize: 10 }}
              >
                {task.assignedToName[0]}
              </Avatar>
            </Tooltip>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default KanbanCard;
