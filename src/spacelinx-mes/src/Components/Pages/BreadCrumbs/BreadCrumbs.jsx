import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuItem, TextField } from "@mui/material";
import { useUserContext } from "../../../features/userContext/UserContext";
import "./BreadCrumbs.css";
import NavBarItems from "../../NavBar/NavBarItems";

const capitalizeFirstLetter = (string) => {
  return string && string.charAt(0).toUpperCase() + string.slice(1);
};

const getDropdownOptions = (topLevelKey, hasPermission) => {
  const topLevelItem = NavBarItems.find(
    (item) =>
      item.subButtons &&
      item.label.toLowerCase()?.replace(/\s/g, "") ===
        topLevelKey?.replace(/\s/g, "")
  );

  if (!topLevelItem || !topLevelItem.subButtons) {
    return [];
  }

  const options = topLevelItem.subButtons.filter((subButton) => {
    if (subButton.child) {
      const hasPermissionToChildren = subButton.child.some((childItem) =>
        childItem.permission ? hasPermission(childItem.permission) : true
      );
      return hasPermissionToChildren;
    }
    if (subButton.permission) {
      return hasPermission(subButton.permission);
    }
    return true;
  });

  return options.map((item) => {
    const value = item.child
      ? item.label.toLowerCase()?.replace(/\s/g, "")
      : item.path?.split("/").pop();
    return {
      label: item.label,
      value: value,
      path: item.path,
      child: item.child,
      permission: item.permission,
    };
  });
};

const BreadCrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [selectValue, setSelectValue] = useState("");
  const { hasPermission } = useUserContext();
  const [filteredOptions, setFilteredOptions] = useState([]);

  const topLevelKey = pathnames[0];
  const topLevelKeyFormatted =
    topLevelKey === "contacthub" ? "contact hub" : topLevelKey;

  useEffect(() => {
    const options = getDropdownOptions(topLevelKeyFormatted, hasPermission);
    setFilteredOptions(options);

    const findCurrentValue = (opts, path) => {
      for (const opt of opts) {
        if (path.startsWith(opt.path)) {
          return opt.value;
        }
        if (opt.child) {
          const childMatch = opt.child.find((child) =>
            path.startsWith(child.path)
          );
          if (childMatch) {
            return opt.value;
          }
        }
      }
      return "";
    };

    const currentValue = findCurrentValue(options, location.pathname);
    setSelectValue(currentValue);
  }, [topLevelKeyFormatted, hasPermission, location.pathname]);

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    const selectedOption = filteredOptions.find(
      (opt) => opt.value === selectedValue
    );

    if (selectedOption) {
      if (selectedOption.child && selectedOption.child.length > 0) {
        const accessibleChild = selectedOption.child.find((child) =>
          child.permission ? hasPermission(child.permission) : true
        );
        if (accessibleChild) {
          navigate(accessibleChild.path);
        }
      } else if (selectedOption.path) {
        navigate(selectedOption.path);
      }
    }
  };

  const getSubTitle = () => {
    const topLevelItem = NavBarItems.find(
      (item) =>
        item.isDropdown &&
        item.label.toLowerCase()?.replace(/\s/g, "") ===
          topLevelKey?.replace(/\s/g, "")
    );
    if (!topLevelItem || !topLevelItem.subButtons)
      return { parent: "", child: "" };

    let parentTitle = "";
    let childTitle = "";

    topLevelItem.subButtons.forEach((sub) => {
      if (location.pathname.startsWith(sub.path)) {
        parentTitle = sub.label;
      }
      if (sub.child) {
        sub.child.forEach((child) => {
          if (location.pathname.startsWith(child.path)) {
            parentTitle = sub.label;
            childTitle = child.label;
          }
        });
      }
    });

    return { parent: parentTitle, child: childTitle };
  };

  const titles = getSubTitle();

  if (pathnames.length < 2 || !filteredOptions.length) {
    return null;
  }

  const displayTopLevelKey =
    topLevelKey === "contacthub"
      ? "Contact Hub"
      : capitalizeFirstLetter(topLevelKey);

  return (
    <div className="breadcrumbs">
      <div className="BiggerBreadCrumb">
        <p className="BreadcrumbHeader">{displayTopLevelKey.toUpperCase()}</p>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <TextField
          select
          value={selectValue}
          onChange={handleSelectChange}
          fullWidth
          className="customSelect"
          variant="standard"
        >
          {filteredOptions.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
        {titles.child && (
          <>
            <ion-icon name="chevron-forward-outline"></ion-icon>
            <p className="BreadcrumbHeader">{titles.child}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default BreadCrumbs;
