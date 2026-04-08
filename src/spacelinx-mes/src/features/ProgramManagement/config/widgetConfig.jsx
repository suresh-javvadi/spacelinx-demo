import TaskSummaryWidget from "../Dashboard/widgets/TaskSummaryWidget";
import ProjectProgressWidget from "../Dashboard/widgets/ProjectProgressWidget";
import OverdueTasksWidget from "../Dashboard/widgets/OverdueTasksWidget";
import MyTasksWidget from "../Dashboard/widgets/MyTasksWidget";
import TeamWorkloadWidget from "../Dashboard/widgets/TeamWorkloadWidget";
import RecentActivityWidget from "../Dashboard/widgets/RecentActivityWidget";
import StatusDistributionWidget from "../Dashboard/widgets/StatusDistributionWidget";
import PriorityBreakdownWidget from "../Dashboard/widgets/PriorityBreakdownWidget";
import TimeLoggedChartWidget from "../Dashboard/widgets/TimeLoggedChartWidget";

import {
  Assessment,
  Assignment,
  BarChart,
  Group,
  History,
  PieChart,
  ShowChart,
  Timeline,
  Warning,
} from "@mui/icons-material";

export const WIDGET_TYPES = {
  TaskSummary: {
    id: "TaskSummary",
    label: "Task Summary",
    description: "Overview of task counts by status",
    component: TaskSummaryWidget,
    defaultWidth: 3,
    defaultHeight: 3,
    icon: <Assessment />,
  },
  ProjectProgress: {
    id: "ProjectProgress",
    label: "Project Progress",
    description: "Progress bars for active projects",
    component: ProjectProgressWidget,
    defaultWidth: 4,
    defaultHeight: 3,
    icon: <ShowChart />,
  },
  OverdueTasks: {
    id: "OverdueTasks",
    label: "Overdue Tasks",
    description: "List of tasks past their due date",
    component: OverdueTasksWidget,
    defaultWidth: 3,
    defaultHeight: 4,
    icon: <Warning />,
  },
  MyTasks: {
    id: "MyTasks",
    label: "My Tasks",
    description: "Tasks assigned to current user",
    component: MyTasksWidget,
    defaultWidth: 4,
    defaultHeight: 4,
    icon: <Assignment />,
  },
  TeamWorkload: {
    id: "TeamWorkload",
    label: "Team Workload",
    description: "Task distribution across team members",
    component: TeamWorkloadWidget,
    defaultWidth: 12,
    defaultHeight: 4,
    icon: <Group />,
  },
  RecentActivity: {
    id: "RecentActivity",
    label: "Recent Activity",
    description: "Latest updates and changes",
    component: RecentActivityWidget,
    defaultWidth: 3,
    defaultHeight: 5,
    icon: <History />,
  },
  StatusDistribution: {
    id: "StatusDistribution",
    label: "Status Distribution",
    description: "Pie chart of tasks by status",
    component: StatusDistributionWidget,
    defaultWidth: 4,
    defaultHeight: 4,
    icon: <PieChart />,
  },
  PriorityBreakdown: {
    id: "PriorityBreakdown",
    label: "Priority Breakdown",
    description: "Bar chart of tasks by priority",
    component: PriorityBreakdownWidget,
    defaultWidth: 4,
    defaultHeight: 4,
    icon: <BarChart />,
  },
  TimeLoggedChart: {
    id: "TimeLoggedChart",
    label: "Time Logged",
    description: "Area chart of hours logged over time",
    component: TimeLoggedChartWidget,
    defaultWidth: 8,
    defaultHeight: 4,
    icon: <Timeline />,
  },
};

export const getWidgetConfig = (type) => WIDGET_TYPES[type];
