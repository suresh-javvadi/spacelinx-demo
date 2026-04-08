import React, { useState, useEffect, useContext } from "react";
import {
  IconButton,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Tab,
  Tabs,
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
} from "@mui/material";
import {
  Close,
  Edit,
  Assignment,
  Comment,
  History,
  AccountTree,
  Person,
  CalendarToday,
  AccessTime,
  Flag,
} from "@mui/icons-material";
import { fetchSubtasks } from "../../../services/taskService";
import { fetchAssigneesByTask } from "../../../services/taskAssigneeService";
import { fetchCommentsByTask } from "../../../services/taskCommentService";
import { fetchActivitiesByTask } from "../../../services/taskActivityService";
import { AlertsContext } from "../../AlertsContext/Context";
import CommentList from "../Comments/CommentList";
import CommentForm from "../Comments/CommentForm";
import ActivityFeed from "../ActivityFeed/ActivityFeed";
import "./Tasks.css";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const TaskDetails = ({
  task,
  handleCloseClick,
  handleEdit,
  handleRefresh,
  staff,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [tabValue, setTabValue] = useState(0);
  const [subtasks, setSubtasks] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (task?.id) {
      loadSubtasks();
      loadAssignees();
    }
  }, [task?.id]);

  useEffect(() => {
    if (tabValue === 1 && task?.id && comments.length === 0) {
      loadComments();
    }
    if (tabValue === 2 && task?.id && activities.length === 0) {
      loadActivities();
    }
  }, [tabValue, task?.id]);

  const loadSubtasks = async () => {
    setLoadingSubtasks(true);
    try {
      const data = await fetchSubtasks(task.id);
      setSubtasks(data || []);
    } catch (error) {
      console.error("Error loading subtasks:", error);
    } finally {
      setLoadingSubtasks(false);
    }
  };

  const loadAssignees = async () => {
    try {
      const data = await fetchAssigneesByTask(task.id);
      setAssignees(data || []);
    } catch (error) {
      console.error("Error loading assignees:", error);
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await fetchCommentsByTask(task.id);
      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const loadActivities = async () => {
    setLoadingActivities(true);
    try {
      const data = await fetchActivitiesByTask(task.id);
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getStatusChipClass = (status) => {
    const statusMap = {
      Completed: "completed",
      "In Progress": "in-progress",
      "To Do": "to-do",
      Logged: "logged",
    };
    return statusMap[status] || "to-do";
  };

  const getPriorityChipClass = (priority) => {
    return priority?.toLowerCase() || "medium";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="TaskDetailsDrawer">
      {/* HEADER */}
      <div className="TaskDetailsHeader">
        <div>
          <p className="TaskDetailsCode">{task.taskCode}</p>
          <h2 className="TaskDetailsTitle">{task.name}</h2>
        </div>

        <div className="TaskHeaderActions">
          <IconButton onClick={handleEdit}>
            <ion-icon name="create-outline"></ion-icon>
          </IconButton>
          <IconButton onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </IconButton>
        </div>
      </div>
      {/* STATUS + PROGRESS */}

      <div className="TaskChipRow">
        <Chip
          label={task.status}
          className={`TaskStatusChip ${getStatusChipClass(task.status)}`}
        />
        <Chip
          icon={<Flag className="TaskPriorityIcon" fontSize="small" />}
          label={task.priority}
          className={`TaskPriorityChip ${getPriorityChipClass(task.priority)}`}
        />
        {task.taskType && task.taskType !== "Task" && (
          <Chip
            label={task.taskType}
            variant="outlined"
            size="small"
            className="taskType"
          />
        )}
      </div>
      <div className="TaskProgressWrapper">
        <div className="TaskProgressHeader">
          <span className="TaskProgressLabel">Progress</span>
          <span className="TaskProgressText">{task.progressPercent || 0}%</span>
        </div>

        <LinearProgress
          variant="determinate"
          value={task.progressPercent || 0}
          className="TaskProgressBar"
        />
      </div>
      {/* </div> */}
      {/* DETAILS GRID */}
      <div className="TaskDetailsSection">
        {/* DETAILS + ASSIGNEES + DESCRIPTION */}
        <div className="TaskScrollableSection">
          <div className="TaskDetailsGrid">
            <div className="TaskDetailsField">
              <span className="TaskDetailsFieldLabel">
                <AccessTime fontSize="small" className="TaskFieldIcon" />
                Estimated Hours
              </span>
              <span className="TaskDetailsFieldValue">
                {task.estimatedHours || "-"} hrs
              </span>
            </div>

            <div className="TaskDetailsField">
              <span className="TaskDetailsFieldLabel">
                <CalendarToday fontSize="small" className="TaskFieldIcon" />
                Start Date
              </span>
              <span className="TaskDetailsFieldValue">
                {formatDate(task.startDate)}
              </span>
            </div>

            <div className="TaskDetailsField">
              <span className="TaskDetailsFieldLabel">
                <CalendarToday fontSize="small" className="TaskFieldIcon" />
                Due Date
              </span>
              <span className="TaskDetailsFieldValue">
                {formatDate(task.dueDate)}
              </span>
            </div>

            <div className="TaskDetailsField">
              <span className="TaskDetailsFieldLabel">
                <AccessTime fontSize="small" className="TaskFieldIcon" />
                Actual Hours
              </span>
              <span className="TaskDetailsFieldValue">
                {task.actualHours || "-"} hrs
              </span>
            </div>
          </div>

          <h4 className="TaskDetailsSectionTitle">Assignees</h4>

          <div className="AssigneesSection">
            {task.assignedTo && (
              <div className="AssigneeCard">
                <Avatar className="AssigneeAvatar">
                  {getInitials(
                    `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
                  )}
                </Avatar>

                <div className="AssigneeInfo">
                  <div className="AssigneeName">
                    {task.assignedTo.firstName} {task.assignedTo.lastName}
                  </div>
                  <div className="AssigneeRole">Primary Owner</div>
                </div>
              </div>
            )}
          </div>

          {task.description && (
            <>
              <h4 className="TaskDetailsSectionTitle">Description</h4>
              <p className="DescriptionBox">{task.description}</p>
            </>
          )}
        </div>
      </div>
      {/* TABS */}
      <Box className="TaskTabsWrapper">
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab
            icon={<AccountTree fontSize="small" />}
            iconPosition="start"
            label={`Subtasks (${subtasks.length})`}
          />
          <Tab
            icon={<Comment fontSize="small" />}
            iconPosition="start"
            label={`Comments (${comments.length})`}
          />
          <Tab
            icon={<History fontSize="small" />}
            iconPosition="start"
            label="Activity"
          />
        </Tabs>
      </Box>
      {/* SUBTASKS */}
      <TabPanel value={tabValue} index={0}>
        <div className="SubtasksSection">
          {loadingSubtasks ? (
            <LinearProgress />
          ) : subtasks.length > 0 ? (
            <ul className="SubtasksList">
              {subtasks.map((subtask) => (
                <li key={subtask.id} className="SubtaskItem">
                  <Chip
                    size="small"
                    label={subtask.status}
                    className={`TaskStatusChip ${getStatusChipClass(subtask.status)}`}
                    sx={{ mr: 2 }}
                  />
                  <span className="SubtaskName">{subtask.name}</span>
                  <span style={{ color: "#666", fontSize: 12 }}>
                    {subtask.progressPercent || 0}%
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="SubtasksEmpty">
              <p>No subtasks yet</p>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Assignment />}
                sx={{ mt: 2 }}
              >
                Add Subtask
              </Button>
            </div>
          )}
        </div>
      </TabPanel>
      {/* COMMENTS */}
      <TabPanel value={tabValue} index={1}>
        {loadingComments ? (
          <LinearProgress />
        ) : (
          <>
            <CommentList comments={comments} staff={staff} />
            <CommentForm
              taskId={task.id}
              staff={staff}
              onCommentAdded={() => loadComments()}
            />
          </>
        )}
      </TabPanel>
      {/* ACTIVITY */}
      <TabPanel value={tabValue} index={2}>
        {loadingActivities ? (
          <LinearProgress />
        ) : (
          <ActivityFeed activities={activities} />
        )}
      </TabPanel>
    </div>
  );
};

export default TaskDetails;
