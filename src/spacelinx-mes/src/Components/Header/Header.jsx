import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useMsal } from "@azure/msal-react";
import { useDrawer } from "../../useDrawerHook";
import { ThemeContext } from "../../App";
import spacelinxLogo from "../../Assest/Images/logos/spacelinxlogo.png";
import "./Header.css";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Autocomplete, Divider, TextField, Tooltip } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import NewIssues from "../../features/issues/NewIssues";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useIssues } from "../../features/issues/IssuesContext";
import { useUserContext } from "../../features/userContext/UserContext";
import Cliploader from "../Loaders/Cliploader";
import { updateDefaultRole } from "../../services/userRoleService";
import { Checkbox, FormControlLabel } from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import {
  showAlert,
  showConfirmation,
} from "../ConfirmationDialog/ConfirmationDialog";

function Header() {
  const { toggleDrawer } = useDrawer();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [createMenuAnchor, setCreateMenuAnchor] = useState(null);
  const { instance } = useMsal();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [issuesDialogOpen, setIssuesDialogOpen] = useState(false);
  const { fetchIssuesData } = useIssues();
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const {
    userRolesAndPermissions,
    userData,
    updateActiveRole,
    activeRole,
    defaultRole,
    fetchUserRoles,
  } = useUserContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isCurrentDefault = activeRole?.role?.id === defaultRole?.role?.id;

  const handleChange = async (event) => {
    if (event.target.checked) {
      await handleUpdateDefaultRole();
      await fetchUserRoles();
    }
  };

  const handleUpdateDefaultRole = async () => {
    setLoading(true);
    try {
      const data = await updateDefaultRole(userData?.id, activeRole?.role?.id);
    } catch (error) {
      console.error("Error updating default role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseClick = () => {
    setIssuesDialogOpen(false);
  };
  const handleOpenMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleOpenCreateMenu = (event) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setCreateMenuAnchor(null);
    setMenuAnchor(null);
  };
  const handleOpenNotificationMenu = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotificationMenu = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("activeRole");
    handleCloseMenu();
    instance.logoutRedirect({
      postLogoutRedirectUri: "/",
    });
  };

  return (
    <div className="HeaderContainer">
      {loading && (
        <div className="RoleChangeCliploader">
          <Cliploader loading={loading} />
        </div>
      )}
      <AppBar
        position="fixed"
        className="appbar"
        sx={{
          zIndex: "(theme) => theme.zIndex.drawer + 1",
          height: "60px",
          boxShadow: "none",
          backgroundColor: theme === "dark" ? "#2c2c2c" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#000000",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            className="header-icon"
          >
            <MenuIcon />
          </IconButton>
          <div className="logo">
            <img src={spacelinxLogo} alt="Logo" className="logo-img" />
          </div>
          <div className="HeaderIconsContainer">
            <IconButton
              className="header-icon HeaderDocsIcon"
              onClick={() =>
                window.open(
                  "https://spacelinxdocs.azurewebsites.net/",
                  "_blank"
                )
              }
              title="Help"
            >
              <ion-icon name="help-circle-outline"></ion-icon>
            </IconButton>
            <IconButton
              onClick={() => setIssuesDialogOpen(true)}
              className="header-icons HeaderIssuesIcon"
              title="Create Issues"
            >
              <WarningAmberOutlinedIcon />
            </IconButton>
            <IconButton
              onClick={handleOpenCreateMenu}
              className="header-icon HeaderAddIcon"
              title="Modules"
            >
              <ion-icon name="add-outline"></ion-icon>
            </IconButton>
            <IconButton
              onClick={handleOpenNotificationMenu}
              className="header-icon"
              title="Notifications"
            >
              <NotificationsIcon />
            </IconButton>
            <IconButton onClick={handleOpenMenu} className="header-icon"
            title="Profile">
              <AccountCircleIcon />
            </IconButton>
          </div>
        </Toolbar>
        <Dialog
          open={issuesDialogOpen}
          onClose={handleCloseClick}
          maxWidth="md"
          fullWidth
        >
          <NewIssues
            handleCloseClick={handleCloseClick}
            fetchIssuesData={fetchIssuesData}
            onDialog={true}
          />
        </Dialog>
        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={handleCloseMenu}
        >
          <div className="HeaderCreateMenuDiv">
            <div className="HeaderCreateMenuDiv1">
              <Link
                to="/product"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + Products
              </Link>
              <Link to="/guides" onClick={handleCloseMenu} className="MenuLink">
                + Guides
              </Link>
            </div>
            <div className="HeaderCreateMenuDiv2">
              <Link
                to="/workorders"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + WorkOrders
              </Link>
              <Link
                to="/materialkits"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + Material Kit
              </Link>
            </div>
            <div className="HeaderCreateMenuDiv2">
              <Link
                to="/plm/parts"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + Part
              </Link>
              <Link
                to="/plm/bom"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + Bom
              </Link>
              <Link
                to="/plm/tools"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + Tool
              </Link>
              <Link
                to="/plm/machines"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + Machine
              </Link>
              <Link
                to="/settings/news"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + News
              </Link>
              <Link
                to="/settings/locations"
                onClick={handleCloseMenu}
                className="MenuLink"
              >
                + Location
              </Link>
            </div>
          </div>
        </Menu>
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleCloseNotificationMenu}
          sx={{ display: "flex", marginX: "12px", marginY: "8px" }}
        >
          <div className="profile-container">
            <div className="profile-container-two">
              <NotificationsIcon
                sx={{ fontSize: "30px", marginBottom: "10px" }}
              />
              <p className="profile-name">Notifications</p>
              <p className="profile-email">No new notifications</p>
            </div>
          </div>
        </Menu>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          sx={{ display: "flex", marginX: "12px", marginY: "8px" }}
        >
          <div className="profile-container">
            <div className="profile-container-two">
              <AccountCircleIcon
                sx={{ fontSize: "50px", marginBottom: "10px" }}
              />
              <p className="profile-name">
                {userData?.firstName} {userData?.lastName}
              </p>
              <p className="profile-email">{userData?.email}</p>
              <div className="profile-roles">
                <Autocomplete
                  options={(userRolesAndPermissions || [])
                    .map((r) => r.role)
                    .filter(Boolean)}
                  getOptionLabel={(option) => option?.roleName || ""}
                  renderOption={(props, option, { selected }) => (
                    <li
                      {...props}
                      className={`defualtRole-option ${
                        selected ? "selected" : ""
                      }`}
                    >
                      <span>{option?.roleName}</span>
                      {option.id === defaultRole?.role?.id && (
                        <HowToRegIcon className="DeafaultCheckIcon" />
                      )}
                    </li>
                  )}
                  value={activeRole?.role || null}
                  onChange={async (event, newValue) => {
                    setLoading(true);
                    updateActiveRole(newValue);
                    handleCloseMenu();
                    navigate("/");
                    setTimeout(() => {
                      setLoading(false);
                    }, 1000);
                  }}
                  disableClearable
                  renderInput={(params) => (
                    <TextField {...params} label="Select Role" size="small" />
                  )}
                  fullWidth
                />
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Checkbox
                      title="Make as Default Role"
                      checked={isCurrentDefault}
                      onChange={handleChange}
                      icon={<HowToRegIcon color="disabled" />}
                      checkedIcon={<HowToRegIcon />}
                      className="DefaultRoleCheckbox"
                    />
                  }
                />
              </div>
            </div>
            <div className="profile-actions">
              <IconButton onClick={toggleTheme} className="theme-toggle-icon">
                {theme === "dark" ? (
                  <LightModeIcon titleAccess="Switch to Light mode" />
                ) : (
                  <DarkModeIcon titleAccess="Switch to Dark mode" />
                )}
              </IconButton>
              <Divider orientation="vertical" flexItem />
              <MenuItem
                onClick={handleLogout}
                style={{
                  paddingLeft: 0,
                  color: "#00ccff",
                  textAlign: "center",
                }}
              >
                <strong>Logout</strong>
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  const confirmClear = await showConfirmation(
                    "Clear App Data?",
                    "Are you sure you want to clear all app data?",
                    "Yes, Clear Data"
                  );
                  if (!confirmClear) return;

                  try {
                    const keysToKeep = ["msal", "a6d211d8", "server-telemetry"];

                    Object.keys(localStorage).forEach((key) => {
                      const isMsalKey = keysToKeep.some((keep) =>
                        key.toLowerCase().startsWith(keep.toLowerCase())
                      );
                      if (!isMsalKey) {
                        localStorage.removeItem(key);
                      }
                    });

                    if ("caches" in window) {
                      const cacheNames = await caches.keys();
                      await Promise.all(
                        cacheNames.map((name) => caches.delete(name))
                      );
                    }

                    showAlert(
                      "success",
                      "Cleared!",
                      "App data cleared successfully."
                    );
                    window.location.reload();
                  } catch (err) {
                    console.error("Error clearing app data:", err);
                    showAlert("error", "Error", "Failed to clear app data.");
                  }
                }}
                sx={{
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                <CleaningServicesIcon titleAccess="Clear App data" />
              </MenuItem>
            </div>
          </div>
        </Menu>
      </AppBar>
    </div>
  );
}

export default Header;
