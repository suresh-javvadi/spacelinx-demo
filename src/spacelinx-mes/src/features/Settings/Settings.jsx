import React, { useEffect, useState } from "react";
import HomeRepairServiceIcon from "@mui/icons-material/HomeRepairService";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import "./Settings.css";
import { Link } from "react-router-dom";
import { useUserContext } from "../userContext/UserContext";
import Cliploader from "../../Components/Loaders/Cliploader";
import { PERMISSIONS } from "../../constants/PagePermissions";
import MailLockIcon from "@mui/icons-material/MailLock";

const cardData = [
  {
    id: 1,
    heading: "Procurement",
    icon: "AddBusinessIcon",
    links: [
      {
        text: "Payment Terms",
        to: "/settings/paymentterms",
        permission: PERMISSIONS.PAYMENTTERMS.VIEW,
      },
      {
        text: "Email Logs",
        to: "/settings/emaillogs",
        permission: PERMISSIONS.EMAILLOGS.VIEW,
      },
    ],
  },
  {
    id: 2,
    heading: "Inventory",
    icon: "InventoryIcon",
    links: [
      {
        text: "Bin Management",
        to: "/settings/binmanagement",
        permission: PERMISSIONS.BINMANAGEMENT.VIEW,
      },
    ],
  },
  {
    id: 3,
    heading: "Parts Management",
    icon: "HomeRepairServiceIcon",
    links: [
      {
        text: "Part Types",
        to: "/settings/parttypes",
        permission: PERMISSIONS.PARTTYPES.VIEW,
      },
      {
        text: "Part Type Categories",
        to: "/settings/parttypecategories",
        permission: PERMISSIONS.PARTTYPECATEGORIES.VIEW,
      },
      {
        text: "Assembly Locations",
        to: "/settings/assemblylocations",
        permission: PERMISSIONS.ASSEMBLYLOCATIONS.VIEW,
      },
      {
        text: "Subsystems",
        to: "/settings/subsystems",
        permission: PERMISSIONS.SUBSYSTEMS.VIEW,
      },
      {
        text: "Part Levels",
        to: "/settings/partlevels",
        permission: PERMISSIONS.PARTLEVELS.VIEW,
      },
      {
        text: "Unit of Measure",
        to: "/settings/unitofmeasure",
        permission: PERMISSIONS.UNITOFMEASURE.VIEW,
      },
    ],
  },
  {
    id: 4,
    heading: "Miscellaneous",
    icon: "MiscellaneousServicesIcon",
    links: [
      {
        text: "Bulk Upload",
        to: "/settings/bulkupload",
        permission: PERMISSIONS.BULKUPLOAD.VIEW,
      },
      {
        text: "Option Sets",
        to: "/settings/optionsets",
        permission: "OPTIONSET.VIEW",
      },
      {
        text: "Locations",
        to: "/settings/locations",
        permission: PERMISSIONS.LOCATIONS.VIEW,
      },
      {
        text: "News",
        to: "/settings/news",
        permission: "NEWS.VIEW",
      },
      {
        text: "Reports",
        to: "/settings/reports",
        permission: "REPORT.VIEW",
      },
    ],
  },
  {
    id: 5,
    heading: "Email",
    icon: "MailLockIcon",
    links: [
      {
        text: "Email Templates",
        to: "/settings/emailtemplates",
        permission: PERMISSIONS.EMAILTEMPLATES.VIEW,
      },
      {
        text: "Additional Recipients",
        to: "/settings/additionalrecipients",
        permission: PERMISSIONS.ADDITIONALRECIPIENTS.VIEW,
      },
    ],
  },
];

const iconMap = {
  AddBusinessIcon: AddBusinessIcon,
  InventoryIcon: InventoryIcon,
  HomeRepairServiceIcon: HomeRepairServiceIcon,
  MiscellaneousServicesIcon: MiscellaneousServicesIcon,
  MailLockIcon: MailLockIcon,
};

const Settings = () => {
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
          <p className="PageHeader">Settings</p>
          <div className="admin-container">
            {filteredCardData.map((card) => {
              const IconComponent = iconMap[card.icon];
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

export default Settings;
