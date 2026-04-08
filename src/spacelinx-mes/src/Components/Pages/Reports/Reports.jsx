import React, { useEffect, useState } from "react";
import * as MuiIcons from "@mui/icons-material";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../../features/userContext/UserContext";
import { Link } from "react-router-dom";
import Cliploader from "../../Loaders/Cliploader";
import "../../../features/Settings/Settings.css";

const cardData = [
  {
    id: 1,
    heading: "Parts Reports",
    icon: "Dashboard",
    links: [
      {
        text: "BOM Consolidated Report",
        to: "/reports/bomconsolidated",
        permission: PERMISSIONS.REPORTS.BOMCONSOLIDATED.VIEW,
      },
    ],
  },
];

const Reports = () => {
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
        <Cliploader loading={loadingData} />
      ) : (
        <div className="admin">
          <p className="PageHeader">Reports</p>
          <div className="admin-container">
            {filteredCardData.map((card) => {
              const IconComponent = MuiIcons[card.icon];
              return (
                <div className="cards" key={card.id}>
                  <h3 className="heading-with-icon">
                    {IconComponent && <IconComponent className="icon" />}
                    {card.heading}
                  </h3>
                  <div className="link-grid">
                    {card.links.map((link, index) => (
                      <Link to={link.to} className="link" key={index}>
                        {link.text}
                      </Link>
                    ))}
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

export default Reports;
