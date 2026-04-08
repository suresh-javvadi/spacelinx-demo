import React from "react";
import { Box, Typography, Badge, Tooltip } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanCard from "./KanbanCard";

const KanbanColumn = ({ column, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `col-${column.id}`,
  });

  const isOverWipLimit =
    column.wipLimit && column.tasks.length > column.wipLimit;

  return (
    <Box
      ref={setNodeRef}
      className={`KanbanColumn ${isOver ? "KanbanColumnDropTarget" : ""}`}
      sx={{
        borderTop: `4px solid ${column.color}`,
      }}
    >
      <Box className="KanbanColumnHeader">
        <Box className="KanbanColumnTitle">
          <Typography variant="subtitle1" fontWeight="600">
            {column.name}
          </Typography>
          <Tooltip
            title={
              isOverWipLimit
                ? `Over WIP limit (${column.wipLimit})`
                : column.wipLimit
                  ? `WIP limit: ${column.wipLimit}`
                  : "No WIP limit"
            }
          >
            <Badge
              badgeContent={column.tasks.length}
              color={isOverWipLimit ? "error" : "primary"}
              className="KanbanColumnCount"
            />
          </Tooltip>
        </Box>
        {column.wipLimit && (
          <Typography
            variant="caption"
            className={`KanbanWipIndicator ${isOverWipLimit ? "over-limit" : ""}`}
          >
            {column.tasks.length}/{column.wipLimit}
          </Typography>
        )}
      </Box>

      <Box className="KanbanColumnContent">
        <SortableContext
          items={column.tasks.map((t) => `task-${t.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <Box className="KanbanColumnEmpty">
            <Typography variant="body2" color="text.secondary">
              No tasks
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KanbanColumn;
