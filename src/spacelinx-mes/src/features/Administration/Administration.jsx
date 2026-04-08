import React, { useEffect, useState } from "react";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import GroupIcon from "@mui/icons-material/Group";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import "../Settings/Settings.css";
import { Link } from "react-router-dom";
import { useUserContext } from "../userContext/UserContext";
import Cliploader from "../../Components/Loaders/Cliploader";
import { PERMISSIONS } from "../../constants/PagePermissions";
import ClearCacheButton from "./ClearCacheButton";

const cardData = [
  {
    id: 1,
    heading: "User Management",
    icon: "ManageAccountsIcon",
    links: [
      {
        text: "Users",
        to: "/administration/users",
        permission: PERMISSIONS.USERS.VIEW,
      },
      {
        text: "Roles",
        to: "/administration/roles",
        permission: PERMISSIONS.ROLES.VIEW,
      },
    ],
  },
  {
    id: 3,
    heading: "Miscellaneous",
    icon: "MiscellaneousServicesIcon",
    links: [
      {
        text: "Features",
        to: "/administration/features",
        permission: PERMISSIONS.FEATURES.VIEW,
      },
      {
        text: "Permissions",
        to: "/administration/permissions",
        permission: PERMISSIONS.PERMISSIONS.VIEW,
      },
      {
        text: "Clear Cache",
        action: "clearCache",
        permission: PERMISSIONS.FEATURES.VIEW,
      },
    ],
  },
  {
    id: 3,
    heading: "Configurations",
    icon: "ManageAccountsIcon",
    links: [
      {
        text: "Approval Configurations",
        to: "/administration/Approvalsconfigurations",
        permission: PERMISSIONS.ApprovalsConfig.VIEW,
      },
    ],
  },
];

const iconMap = {
  ManageAccountsIcon: ManageAccountsIcon,
  GroupIcon: GroupIcon,
  MiscellaneousServicesIcon: MiscellaneousServicesIcon,
};

const Administration = () => {
  const { hasPermission } = useUserContext();
  const [filteredCardData, setFilteredCardData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const newFilteredCardData = cardData
      .map((card) => {
        const filteredLinks = card.links.filter((link) =>
          hasPermission(link.permission)
        );
        if (filteredLinks.length > 0) {
          return { ...card, links: filteredLinks };
        }
        return null;
      })
      .filter(Boolean);

    setFilteredCardData(newFilteredCardData);
    setLoadingData(false);
  }, [hasPermission]);

  return (
    <>
      {loadingData ? (
        <Cliploader loading={true} />
      ) : (
        <div className="admin">
          <p className="PageHeader">Administration</p>
          <div className="admin-container">
            {filteredCardData.map((card) => {
              const IconComponent = iconMap[card.icon];
              return (
                <div className="cards" key={card.id}>
                  <h3 className="heading-with-icon">
                    {IconComponent && <IconComponent className="icon" />}
                    {card.heading}
                  </h3>
                  <div className="link-grid single-column">
                    {card.links.map((link, index) =>
                      link.action === "clearCache" ? (
                        <ClearCacheButton key={index} />
                      ) : (
                        <Link to={link.to} className="link" key={index}>
                          {link.text}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Administration;
