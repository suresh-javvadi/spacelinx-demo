/**
 * Icon Registry for dynamic icon loading
 * This avoids importing all MUI icons (500KB+) by mapping only the icons actually used.
 * Add new icons here as needed.
 */

// Issue type icons
import BugReportIcon from "@mui/icons-material/BugReport";
import TaskIcon from "@mui/icons-material/Task";
import DescriptionIcon from "@mui/icons-material/Description";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import BlockIcon from "@mui/icons-material/Block";
import HelpIcon from "@mui/icons-material/Help";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ExtensionIcon from "@mui/icons-material/Extension";
import ArticleIcon from "@mui/icons-material/Article";

// Priority icons
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import RemoveIcon from "@mui/icons-material/Remove";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import LowPriorityIcon from "@mui/icons-material/LowPriority";

// Status/general icons
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import FlagIcon from "@mui/icons-material/Flag";

// Map icon names to components
const iconMap = {
  // Issue types
  BugReport: BugReportIcon,
  Bug: BugReportIcon,
  Task: TaskIcon,
  Description: DescriptionIcon,
  Story: DescriptionIcon,
  Bookmark: BookmarkIcon,
  Epic: BookmarkIcon,
  CheckCircle: CheckCircleIcon,
  Subtask: CheckCircleIcon,
  Build: BuildIcon,
  Improvement: BuildIcon,
  Lightbulb: LightbulbIcon,
  Feature: LightbulbIcon,
  Block: BlockIcon,
  Help: HelpIcon,
  Assignment: AssignmentIcon,
  Extension: ExtensionIcon,
  Article: ArticleIcon,

  // Priorities
  KeyboardArrowUp: KeyboardArrowUpIcon,
  KeyboardArrowDown: KeyboardArrowDownIcon,
  KeyboardDoubleArrowUp: KeyboardDoubleArrowUpIcon,
  KeyboardDoubleArrowDown: KeyboardDoubleArrowDownIcon,
  Remove: RemoveIcon,
  PriorityHigh: PriorityHighIcon,
  LowPriority: LowPriorityIcon,
  Highest: KeyboardDoubleArrowUpIcon,
  High: KeyboardArrowUpIcon,
  Medium: RemoveIcon,
  Low: KeyboardArrowDownIcon,
  Lowest: KeyboardDoubleArrowDownIcon,

  // Status/general
  Warning: WarningIcon,
  Error: ErrorIcon,
  Info: InfoIcon,
  Check: CheckIcon,
  Close: CloseIcon,
  Flag: FlagIcon,
};

/**
 * Get an icon component by name
 * @param {string} iconName - The name of the icon
 * @returns {React.ComponentType|null} - The icon component or null if not found
 */
export const getIconByName = (iconName) => {
  if (!iconName) return null;
  return iconMap[iconName] || null;
};

/**
 * Render an icon by name with optional styling
 * @param {string} iconName - The name of the icon
 * @param {string} color - Optional color for the icon
 * @param {object} sx - Optional sx prop for additional styling
 * @returns {React.ReactElement|null} - The rendered icon or null
 */
export const renderIcon = (iconName, color, sx = {}) => {
  const IconComponent = getIconByName(iconName);
  if (!IconComponent) return null;
  return <IconComponent sx={{ color, ...sx }} />;
};

export default iconMap;
