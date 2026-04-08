import React from "react";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  Edit,
  Add,
  Delete,
  Comment,
  PersonAdd,
  PersonRemove,
  Flag,
  CalendarToday,
  AccessTime,
  CheckCircle,
  SwapHoriz,
  Link,
  LinkOff,
} from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "../Tasks/Tasks.css";

dayjs.extend(relativeTime);

const getActivityIcon = (activityType) => {
  const icons = {
    Created: <Add />,
    Updated: <Edit />,
    Deleted: <Delete />,
    StatusChanged: <SwapHoriz />,
    PriorityChanged: <Flag />,
    AssigneeAdded: <PersonAdd />,
    AssigneeRemoved: <PersonRemove />,
    DueDateChanged: <CalendarToday />,
    StartDateChanged: <CalendarToday />,
    ProgressChanged: <CheckCircle />,
    CommentAdded: <Comment />,
    CommentEdited: <Edit />,
    CommentDeleted: <Delete />,
    DependencyAdded: <Link />,
    DependencyRemoved: <LinkOff />,
    SubtaskAdded: <Add />,
    SubtaskRemoved: <Delete />,
    TimeLogged: <AccessTime />,
  };
  return icons[activityType] || <Edit />;
};

const getActivityColor = (activityType) => {
  const colors = {
    Created: "success",
    Updated: "primary",
    Deleted: "error",
    StatusChanged: "info",
    PriorityChanged: "warning",
    AssigneeAdded: "success",
    AssigneeRemoved: "error",
    ProgressChanged: "success",
    CommentAdded: "primary",
  };
  return colors[activityType] || "grey";
};

const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#666", padding: 16 }}>
        No activity recorded yet.
      </div>
    );
  }

  return (
    <Timeline position="right" sx={{ p: 0 }}>
      {activities.map((activity, index) => (
        <TimelineItem key={activity.id || index}>
          <TimelineOppositeContent
            sx={{ flex: 0.2, fontSize: 12, color: "#666" }}
          >
            {dayjs(activity.createdAt).fromNow()}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={getActivityColor(activity.activityType)}>
              {getActivityIcon(activity.activityType)}
            </TimelineDot>
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <div style={{ fontWeight: 500, fontSize: 14 }}>
              {activity.description || activity.activityType}
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              by {activity.createdBy}
            </div>
            {activity.fieldChanged && activity.oldValue && activity.newValue && (
              <div
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginTop: 4,
                  padding: 8,
                  backgroundColor: "#f5f5f5",
                  borderRadius: 4,
                }}
              >
                <span style={{ textDecoration: "line-through" }}>
                  {activity.oldValue}
                </span>
                {" → "}
                <span style={{ fontWeight: 500 }}>{activity.newValue}</span>
              </div>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default ActivityFeed;
