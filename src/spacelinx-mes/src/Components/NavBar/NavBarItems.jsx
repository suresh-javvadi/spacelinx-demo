import {
  HomeOutlined as Home,
  AdminPanelSettingsOutlined as AdminPanelSettings,
  AccountTreeOutlined as ConstructionIcon,
  SettingsOutlined as Settings,
  PrecisionManufacturingOutlined as Factory,
  ShoppingCartOutlined as ShoppingCart,
  Inventory2Outlined as InventoryIcon,
  SpaceDashboardOutlined as Dashboard,
  HubOutlined as HubIcon,
  InsightsOutlined as AssessmentIcon,
  ManageSearchOutlined as ManageSearchIcon,
} from "@mui/icons-material";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { Tooltip } from "@mui/material";

const NavBarItems = [
  {
    label: "Home",
    icon: (
      <Tooltip
        title={<span className="tooltipTitle">Home</span>}
        placement="right"
      >
        <Home />
      </Tooltip>
    ),
    path: "/",
  },
  {
    label: "Audit",
    icon: (
      <Tooltip
        title={<span className="tooltipTitle">Audit Trail</span>}
        placement="right"
      >
        <ManageSearchIcon />
      </Tooltip>
    ),
    path: "/audit",
    permission: PERMISSIONS.AUDIT.VIEW._SELF,
  },
  {
    label: "PgM",
    icon: <Dashboard />,
    show_SubButtons: true,
    subButtons: [
      {
        label: "Programs",
        path: "/programmanagement/programs",
        permission: PERMISSIONS.PROGRAMS.VIEW,
      },
      {
        label: "Projects",
        path: "/programmanagement/projects",
        permission: PERMISSIONS.PROJECTS.VIEW,
      },
      {
        label: "Issues",
        path: "/programmanagement/issues",
        permission: "ISSUES.VIEW",
      },
      {
        label: "Tasks",
        path: "/programmanagement/tasks",
        permission: PERMISSIONS.TASKS.VIEW,
      },
      {
        label: "Time Tracking",
        path: "/programmanagement/time-tracking",
        permission: PERMISSIONS.TIMETRACKING.VIEW,
      },
      {
        label: "Dashboard",
        path: "/programmanagement/dashboard",
        permission: PERMISSIONS.DASHBOARDS.VIEW,
      },
      {
        label: "Resources",
        path: "/programmanagement/resources",
        permission: PERMISSIONS.RESOURCES.VIEW,
        child: [
          {
            label: "Workload",
            path: "/programmanagement/resources",
            permission: PERMISSIONS.RESOURCES.VIEW,
          },
          {
            label: "Capacity Planning",
            path: "/programmanagement/resources/capacity",
            permission: PERMISSIONS.RESOURCES.VIEW,
          },
        ],
      },
    ],
  },
  {
    label: "PLM",
    icon: <ConstructionIcon />,
    show_SubButtons: true,
    subButtons: [
      {
        label: "Parts",
        path: "/plm/parts",
        permission: PERMISSIONS.PARTS.VIEW,
      },
      {
        label: "BOM",
        path: "/plm/BOM",
        permission: PERMISSIONS.BOM.VIEW,
      },
      { label: "ECO", path: "/plm/eco", permission: PERMISSIONS.ECO.VIEW },
      {
        label: "Tools",
        path: "/plm/tools",
        permission: PERMISSIONS.TOOLS.VIEW,
      },

      {
        label: "Machines",
        path: "/plm/machines",
        permission: PERMISSIONS.MACHINES.VIEW,
      },
    ],
  },
  {
    label: "Manufacturing",
    icon: <Factory />,
    show_SubButtons: true,
    subButtons: [
      {
        label: "Products",
        path: "/product",
        permission: PERMISSIONS.PRODUCTS.VIEW,
      },
      { label: "Guides", path: "/guides", permission: PERMISSIONS.GUIDES.VIEW },
      {
        label: "Work Orders",
        path: "/workOrders",
        permission: PERMISSIONS.WORKORDERS.VIEW,
      },
      {
        label: "Material Kits",
        path: "/materialkits",
        permission: PERMISSIONS.MATERIALKITS.VIEW,
      },
    ],
  },
  {
    label: "Procurement",
    icon: <ShoppingCart />,
    show_SubButtons: true,
    subButtons: [
      {
        label: "Purchase Orders",
        path: "/procurement/purchaseorders",
        permission: PERMISSIONS.PURCHASEORDERS.VIEW,
      },
      {
        label: "Goods Receipts",
        path: "/procurement/goodsreceipts",
        permission: PERMISSIONS.GOODSRECEIPTS.VIEW,
      },
      {
        label: "Quality Check",
        path: "/procurement/qualityCheck",
        permission: PERMISSIONS.QUALITYCHECK.VIEW,
      },
      {
        label: "Requisitions",
        path: "/procurement/requisitions",
        permission: PERMISSIONS.REQUISITIONS.VIEW,
      },
      {
        label: "Vendors",
        path: "/contacthub/companies/vendors",
        permission: PERMISSIONS.VENDORS.VIEW,
      },
    ],
  },
  {
    label: "Inventory",
    icon: <InventoryIcon />,
    show_SubButtons: true,
    subButtons: [
      {
        label: "Parts",
        path: "/inventory/partsInventory",
        permission: PERMISSIONS.PARTS.INVENTORY.VIEW,
      },
      {
        label: "Goods",
        path: "/inventory/goodsInventory",
        permission: PERMISSIONS.GOODS.VIEW,
      },
      {
        label: "Services",
        path: "/inventory/servicesInventory",
        permission: PERMISSIONS.SERVICES.VIEW,
      },
      {
        label: "Stock Movements",
        path: "/inventory/stockMovements",
        permission: PERMISSIONS.STOCKMOVEMENTS.VIEW,
      },
      {
        label: "Vendor Returns",
        path: "/inventory/vendor-returns",
        permission: PERMISSIONS.VENDORRETURNS.VIEW,
      },
      {
        label: "Scrap",
        path: "/inventory/scrap",
        permission: PERMISSIONS.SCRAP.VIEW,
      },
    ],
  },
  {
    label: "Contact Hub",
    icon: <HubIcon />,
    show_SubButtons: true,
    subButtons: [
      {
        label: "Companies",
        path: "/contacthub/companies/all",
        permission:
          PERMISSIONS.VENDORS.VIEW ||
          PERMISSIONS.PARTNERS.VIEW ||
          PERMISSIONS.CUSTOMERS.VIEW,
        child: [
          {
            label: "All",
            path: "/contacthub/companies/all",
            permission:
              PERMISSIONS.VENDORS.VIEW &&
              PERMISSIONS.PARTNERS.VIEW &&
              PERMISSIONS.CUSTOMERS.VIEW,
          },
          {
            label: "Vendors",
            path: "/contacthub/companies/vendors",
            permission: PERMISSIONS.VENDORS.VIEW,
          },

          {
            label: "Partners",
            path: "/contacthub/companies/partners",
            permission: PERMISSIONS.PARTNERS.VIEW,
          },
          {
            label: "Customers",
            path: "/contacthub/companies/customers",
            permission: PERMISSIONS.CUSTOMERS.VIEW,
          },
        ],
      },
      {
        label: "Contacts",
        path: "/contacthub/contacts",
        permission: PERMISSIONS.CONTACTS.VIEW,
      },
      {
        label: "Organization",
        path: "/contacthub/organization",
        permission: PERMISSIONS.ORGANIZATION.VIEW,
      },
    ],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: (
      <Tooltip
        title={<span className="tooltipTitle">Reports</span>}
        placement="right"
      >
        <AssessmentIcon />
      </Tooltip>
    ),
    show_SubButtons: false,
    subButtons: [
      {
        label: "BOM Consolidated",
        path: "/reports/bomconsolidated",
        permission: PERMISSIONS.REPORTS.BOMCONSOLIDATED.VIEW,
      },
    ],
  },
  {
    label: "Settings",
    path: "/settings",
    icon: (
      <Tooltip
        title={<span className="tooltipTitle">Settings</span>}
        placement="right"
      >
        <Settings />
      </Tooltip>
    ),
    show_SubButtons: false,
    subButtons: [
      {
        label: "Payment Terms",
        path: "/settings/paymentterms",
        permission: PERMISSIONS.PAYMENTTERMS.VIEW,
      },
      {
        label: "Email Logs",
        path: "/settings/emaillogs",
        permission: PERMISSIONS.EMAILLOGS.VIEW,
      },
      {
        label: "Bin Management",
        path: "/settings/binmanagement",
        permission: PERMISSIONS.BINMANAGEMENT.VIEW,
      },
      {
        label: "Part Types",
        path: "/settings/parttypes",
        permission: PERMISSIONS.PARTTYPES.VIEW,
      },
      {
        label: "Part Type Categories",
        path: "/settings/parttypecategories",
        permission: PERMISSIONS.PARTTYPECATEGORIES.VIEW,
      },
      {
        label: "Bulk Upload",
        path: "/settings/bulkupload",
        permission: PERMISSIONS.BULKUPLOAD.VIEW,
      },
      {
        label: "Option Sets",
        path: "/settings/optionsets",
        permission: "OPTIONSET.VIEW",
      },
      {
        label: "Locations",
        path: "/settings/locations",
        permission: PERMISSIONS.LOCATIONS.VIEW,
      },
      {
        label: "News",
        path: "/settings/news",
        permission: "NEWS.VIEW",
      },
      {
        label: "Assembly Locations",
        path: "/settings/assemblylocations",
        permission: PERMISSIONS.ASSEMBLYLOCATIONS.VIEW,
      },
      {
        label: "Subsystems",
        path: "/settings/subsystems",
        permission: PERMISSIONS.SUBSYSTEMS.VIEW,
      },
      {
        label: "Part Levels",
        path: "/settings/partlevels",
        permission: PERMISSIONS.PARTLEVELS.VIEW,
      },
      {
        label: "Unit of Measure",
        path: "/settings/unitofmeasure",
        permission: PERMISSIONS.UNITOFMEASURE.VIEW,
      },
      {
        label: "Email Templates",
        path: "/settings/emailtemplates",
        permission: PERMISSIONS.EMAILTEMPLATES.VIEW,
      },
      {
        label: "Additional Recipients",
        path: "/settings/additionalrecipients",
        permission: PERMISSIONS.ADDITIONALRECIPIENTS.VIEW,
      },
    ],
  },
  {
    label: "Administration",
    path: "/administration",
    icon: (
      <Tooltip
        title={<span className="tooltipTitle">Administration</span>}
        placement="right"
      >
        <AdminPanelSettings />
      </Tooltip>
    ),
    show_SubButtons: false,
    subButtons: [
      {
        label: "Users",
        path: "/administration/users",
        permission: PERMISSIONS.USERS.VIEW,
      },
      {
        label: "Roles",
        path: "/administration/roles",
        permission: PERMISSIONS.ROLES.VIEW,
      },
      {
        label: "Features",
        path: "/administration/features",
        permission: PERMISSIONS.FEATURES.VIEW,
      },
      {
        label: "Permissions",
        path: "/administration/permissions",
        permission: PERMISSIONS.PERMISSIONS.VIEW,
      },
      {
        label: "Approval Configurations",
        path: "/administration/Approvalsconfigurations",
        permission: PERMISSIONS.ApprovalsConfig.VIEW,
      },
    ],
  },
];
export default NavBarItems;
