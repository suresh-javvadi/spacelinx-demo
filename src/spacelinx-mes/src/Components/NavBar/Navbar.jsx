import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDrawer } from "../../useDrawerHook";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Collapse,
  Paper,
  Popper,
} from "@mui/material";
import {
  Home,
  AdminPanelSettings,
  ExpandLess,
  ExpandMore,
  Construction as ConstructionIcon,
  Settings,
  Factory,
  ShoppingCart,
  Inventory as InventoryIcon,
  People,
  Dashboard,
  Hub as HubIcon,
} from "@mui/icons-material";
import { useUserContext } from "../../features/userContext/UserContext";
import "./Navbar.css";
import poweredbyxdlinxDark from "../../Assest/Images/logos/poweredbyxdlinxDark.png";
import poweredbyxdlinxLight from "../../Assest/Images/logos/poweredbyxdlinxLight.png";
import { useTheme } from "@mui/material/styles";
import { useFeatureBitContext } from "../../features/adminuser/FeatureBit/FeatureBitContext";
import NavBarItems from "./NavBarItems";
import { PERMISSIONS } from "../../constants/PagePermissions";

const Navbar = () => {
  const location = useLocation();
  const { isDrawerOpen } = useDrawer();
  const theme = useTheme();
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [openChildMenu, setOpenChildMenu] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredSubItem, setHoveredSubItem] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [childAnchorEl, setChildAnchorEl] = useState(null);
  const [popperVisible, setPopperVisible] = useState(false);
  const [childPopperVisible, setChildPopperVisible] = useState(false);
  const hoverHideTimer = useRef(null);
  const isMouseInNavItem = useRef(false);
  const isMouseInPopper = useRef(false);
  const isMouseInChildPopper = useRef(false);
  const { hasPermission } = useUserContext();
  const { featureBitData } = useFeatureBitContext();

  const activeFeatureBits =
    featureBitData?.filter((feature) => feature.isActive) || [];
  const activeFeatureLabels = activeFeatureBits.map((f) =>
    f.featureName?.toLowerCase?.()
  );
  const allFeatureNames = (featureBitData || []).map((f) =>
    f.featureName?.toLowerCase?.()
  );

  const filteredMenuItems = NavBarItems.map((item) => {
    const itemLabel = item.label?.toLowerCase();
    if (!allFeatureNames.includes(itemLabel)) {
      return null;
    }
    if (!activeFeatureLabels.includes(itemLabel)) {
      return null;
    }

    if (item.subButtons) {
      const filteredSubButtons = item.subButtons
        .map((sub) => {
          const subLabel = sub.label?.toLowerCase();

          if (!allFeatureNames.includes(subLabel)) {
            return null;
          }

          if (!activeFeatureLabels.includes(subLabel)) {
            return null;
          }

          if (sub.child) {
            const filteredChildren = sub.child.filter((childItem) =>
              childItem.permission ? hasPermission(childItem.permission) : true
            );

            sub.child = filteredChildren;
            return filteredChildren.length > 0 ? sub : null;
          }

          return sub.permission
            ? hasPermission(sub.permission)
              ? sub
              : null
            : sub;
        })
        .filter(Boolean);

      if (filteredSubButtons.length > 0) {
        return {
          ...item,
          subButtons: filteredSubButtons,
        };
      }

      return null;
    }

    if (item.permission) {
      return hasPermission(item.permission) ? item : null;
    }

    return item;
  }).filter(Boolean);

  const handleChildMenuClick = (label) => {
    setOpenChildMenu(openChildMenu === label ? null : label);
  };

  const handleSubMenuClick = (label) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  const clearHideTimer = () => {
    if (hoverHideTimer.current) {
      clearTimeout(hoverHideTimer.current);
      hoverHideTimer.current = null;
    }
  };

  const handleMouseEnter = (event, item) => {
    if (isDrawerOpen || !item.show_SubButtons) return;
    isMouseInNavItem.current = true;
    clearHideTimer();
    setHoveredItem(item);
    setAnchorEl(event.currentTarget);
    setPopperVisible(true);
    setChildPopperVisible(false);
    setHoveredSubItem(null);
  };

  const handleMouseLeave = () => {
    if (isDrawerOpen) return;
    isMouseInNavItem.current = false;
    if (!isMouseInPopper.current && !isMouseInChildPopper.current) {
      startHideTimer();
    }
  };

  const handlePopperMouseEnter = () => {
    isMouseInPopper.current = true;
    clearHideTimer();
  };

  const handlePopperMouseLeave = () => {
    isMouseInPopper.current = false;
    if (!isMouseInChildPopper.current) {
      startHideTimer();
    }
  };

  const handleSubItemMouseEnter = (event, subItem) => {
    if (!subItem.child) return;
    isMouseInPopper.current = true;
    isMouseInChildPopper.current = false;
    clearHideTimer();
    setHoveredSubItem(subItem);
    setChildAnchorEl(event.currentTarget);
    setChildPopperVisible(true);
  };

  const handleSubItemMouseLeave = () => {
    isMouseInChildPopper.current = false;
    startHideTimer();
  };

  const handleChildPopperMouseEnter = () => {
    isMouseInChildPopper.current = true;
    clearHideTimer();
  };

  const handleChildPopperMouseLeave = () => {
    isMouseInChildPopper.current = false;
    if (!isMouseInPopper.current) {
      startHideTimer();
    }
  };

  const startHideTimer = () => {
    clearHideTimer();
    hoverHideTimer.current = setTimeout(() => {
      if (
        !isMouseInNavItem.current &&
        !isMouseInPopper.current &&
        !isMouseInChildPopper.current
      ) {
        setPopperVisible(false);
        setChildPopperVisible(false);
        setOpenSubMenu(null);
        setOpenChildMenu(null);
      }
    }, 500);
  };

  const handleClosePoppers = () => {
    setPopperVisible(false);
    setChildPopperVisible(false);
    setOpenSubMenu(null);
    setOpenChildMenu(null);
  };

  useEffect(() => {
    return () => clearHideTimer();
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      setPopperVisible(false);
      setChildPopperVisible(false);
      setHoveredItem(null);
      setHoveredSubItem(null);
      setAnchorEl(null);
      setChildAnchorEl(null);
      setOpenChildMenu(null);
    }
  }, [isDrawerOpen]);

  const isItemSelected = (item) => {
    const pathname = location.pathname.toLowerCase();
    const itemPath = (item.path || "").toLowerCase();

    if (!itemPath) return false;

    if (pathname === itemPath) return true;

    if (itemPath !== "/" && pathname.startsWith(itemPath)) return true;

    if (item.subButtons) {
      return item.subButtons.some((sub) => {
        const subPath = (sub.path || "").toLowerCase();
        if (pathname === subPath || pathname.startsWith(subPath)) return true;

        if (sub.child) {
          return sub.child.some((childItem) => {
            const childPath = (childItem.path || "").toLowerCase();
            return pathname === childPath || pathname.startsWith(childPath);
          });
        }

        return false;
      });
    }

    return false;
  };

  const isAnySubSelected = (item) => {
    if (!item.subButtons?.length) return false;

    return item.subButtons.some((sub) => {
      if (isItemSelected(sub)) return true;
      if (sub.child?.length) {
        return sub.child.some((child) => isItemSelected(child));
      }
      return false;
    });
  };

  return (
    <div className="navbarContainer">
      <Drawer
        variant="permanent"
        sx={{
          width: isDrawerOpen ? 220 : 56,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: "width 0.3s ease",
          "& .MuiDrawer-paper": {
            width: isDrawerOpen ? 220 : 56,
            boxSizing: "border-box",
            color: "#a1a1a1",
            overflowX: "hidden",
            transition: "width 0.3s ease",
            marginTop: "60px",
          },
        }}
      >
        <div className="NavBarItems">
          <List>
            {filteredMenuItems.map((item) => (
              <React.Fragment key={String(item.label ?? item.path ?? "")}>
                <ListItem
                  button
                  component={item.show_SubButtons ? "div" : Link}
                  to={item.show_SubButtons ? undefined : item.path}
                  className={`navListItem 
  ${
    isDrawerOpen
      ? // Drawer is OPEN
        !isAnySubSelected(item) &&
        (isItemSelected(item) || !item.subButtons?.length)
        ? "right-rail"
        : ""
      : // Drawer is CLOSED
        !item.subButtons?.length ||
        isItemSelected(item) ||
        isAnySubSelected(item)
      ? "right-rail"
      : ""
  }
  ${isItemSelected(item) || isAnySubSelected(item) ? "active-menu" : ""}
  ${isDrawerOpen ? "drawerOpen" : "drawerClosed"}
`}
                  onClick={() =>
                    item.show_SubButtons && handleSubMenuClick(item.label)
                  }
                  onMouseEnter={(e) => handleMouseEnter(e, item)}
                  onMouseLeave={handleMouseLeave}
                >
                  <ListItemIcon
                    className={`navbar-icons ${
                      isItemSelected(item) ? "selected-icon" : ""
                    }`}
                    sx={{ color: "inherit", minWidth: "auto" }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {isDrawerOpen && (
                    <>
                      <ListItemText
                        primary={String(item.label ?? "")}
                        className={`navbar-icons ${
                          isItemSelected(item) ? "selected-text" : ""
                        } text-truncate`}
                      />
                      {item.show_SubButtons &&
                        (openSubMenu === item.label ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        ))}
                    </>
                  )}
                </ListItem>
                {isDrawerOpen && item.show_SubButtons && (
                  <Collapse in={openSubMenu === item.label}>
                    <List component="div" disablePadding>
                      {item.subButtons.map((subItem) => {
                        const subLabel =
                          subItem?.label != null ? String(subItem.label) : "";
                        const isSubActive =
                          isItemSelected(subItem) &&
                          !subItem.child?.some((child) =>
                            isItemSelected(child)
                          );

                        return (
                          <div key={subLabel}>
                            <ListItem
                              button
                              component={subItem.child ? "div" : Link}
                              to={subItem.child ? undefined : subItem.path}
                              className={`right-rail ${
                                isSubActive ? "active-submenu" : ""
                              }`}
                              onClick={() =>
                                subItem.child &&
                                handleChildMenuClick(subItem.label)
                              }
                            >
                              <ListItemText
                                primary={subLabel}
                                className={`submenu-list-item-text ${
                                  isSubActive ? "selected-text" : ""
                                }`}
                              />
                              {subItem.child &&
                                (openChildMenu === subItem.label ? (
                                  <ExpandLess sx={{ fontSize: "1rem" }} />
                                ) : (
                                  <ExpandMore sx={{ fontSize: "1rem" }} />
                                ))}
                            </ListItem>

                            {subItem.child && (
                              <Collapse in={openChildMenu === subItem.label}>
                                <List
                                  component="div"
                                  disablePadding
                                  sx={{ pl: 4 }}
                                >
                                  {subItem.child.map((childItem) => (
                                    <ListItem
                                      key={String(
                                        childItem.label ?? childItem.path
                                      )}
                                      button
                                      component={Link}
                                      to={childItem.path}
                                      className={`right-rail ${
                                        isItemSelected(childItem)
                                          ? "active-child"
                                          : ""
                                      }`}
                                    >
                                      <ListItemText
                                        primary={String(
                                          childItem.label ?? childItem.path
                                        )}
                                        className="submenu-list-item-text"
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Collapse>
                            )}
                          </div>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </div>
        {isDrawerOpen && (
          <div className="xdlinxLogoContainer">
            <img
              src={
                theme.palette.mode === "dark"
                  ? poweredbyxdlinxDark
                  : poweredbyxdlinxLight
              }
              alt="powered by xdlinx"
              className="xdlinxLogo"
            />
          </div>
        )}
      </Drawer>
      {!isDrawerOpen && hoveredItem && hoveredItem.show_SubButtons && (
        <Popper
          open={popperVisible}
          anchorEl={anchorEl}
          placement="right-start"
          className="custom-popper"
          disablePortal={false}
          modifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 0],
              },
            },
          ]}
          onMouseEnter={handlePopperMouseEnter}
          onMouseLeave={handlePopperMouseLeave}
        >
          <Paper elevation={3} className="popperPaper">
            <List>
              {hoveredItem.subButtons.map((subItem) => (
                <ListItem
                  key={subItem.label}
                  button
                  component={subItem.child ? "div" : Link}
                  to={subItem.child ? undefined : subItem.path}
                  onClick={() => {
                    handleClosePoppers();
                  }}
                  onMouseEnter={(e) => handleSubItemMouseEnter(e, subItem)}
                  onMouseLeave={handleSubItemMouseLeave}
                >
                  <ListItemText primary={subItem.label} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
      )}

      {!isDrawerOpen && hoveredSubItem && hoveredSubItem.child && (
        <Popper
          open={childPopperVisible}
          anchorEl={childAnchorEl}
          placement="right-start"
          className="custom-popper"
          disablePortal={false}
          modifiers={[
            {
              name: "offset",
              options: {
                offset: [10, 0],
              },
            },
          ]}
          onMouseEnter={handleChildPopperMouseEnter}
          onMouseLeave={handleChildPopperMouseLeave}
        >
          <Paper elevation={3} className="popperPaper">
            <List>
              {hoveredSubItem.child.map((childItem) => (
                <ListItem
                  key={childItem.label}
                  button
                  component={Link}
                  to={childItem.path}
                  onClick={handleClosePoppers}
                >
                  <ListItemText primary={childItem.label} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Popper>
      )}
    </div>
  );
};

export default Navbar;
