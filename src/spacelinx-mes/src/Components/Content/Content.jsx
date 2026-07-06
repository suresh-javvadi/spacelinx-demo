import React, { lazy, Suspense } from "react";
import { Routes, Route, useParams, Navigate } from "react-router-dom";
import "./Content.css";
import { useUserContext } from "../../features/userContext/UserContext";
import UnAuthorizedUser from "./UnAuthorizedUser";
import { PERMISSIONS } from "../../constants/PagePermissions";
import BreadCrumbs from "../Pages/BreadCrumbs/BreadCrumbs";
import Cliploader from "../Loaders/Cliploader";

// Lazy load all route components for better initial load performance
const Products = lazy(() => import("../../features/products/product"));
const Guides = lazy(() => import("../../features/Guides/Guide"));
const WorkPackages = lazy(
  () => import("../../features/workOrder/workPackages"),
);
const WorkOrders = lazy(() => import("../../features/workOrder/workOrders"));
const MaterialKits = lazy(
  () => import("../../features/materialKits/MaterialKits"),
);
const Reports = lazy(() => import("../Pages/Reports/Reports"));
const Parts = lazy(() => import("../../features/admin/parts/Parts"));
const PurchaseOrders = lazy(
  () => import("../../features/Procurement/purchaseOrders/PurchaseOrders"),
);
const PartTypes = lazy(
  () => import("../../features/admin/part Types/PartTypes"),
);
const Tools = lazy(() => import("../../features/admin/tools/Tools"));
const Machines = lazy(() => import("../../features/admin/machines/Machines"));
const Users = lazy(() => import("../../features/adminuser/Users/User"));
const Departments = lazy(
  () => import("../../features/adminuser/Departments/Departments"),
);
const News = lazy(() => import("../../features/admin/news/News"));
const Locations = lazy(
  () => import("../../features/admin/locations/Locations"),
);
const GuideDetails = lazy(() => import("../../features/Guides/GuidesDetails"));
const QualityReports = lazy(() => import("../Pages/Reports/QualityReports"));
const Issues = lazy(() => import("../../features/issues/Issues"));
const IssuesList = lazy(() => import("../Pages/Reports/IssueLists"));
const AuditTrail = lazy(() => import("../../features/Audit/AuditTrail"));
const WorkOrderDetails = lazy(
  () => import("../../features/workOrder/workOrderdetails"),
);
const WorkOrderStepDetails = lazy(
  () => import("../../features/workOrder/WorkOrderStepDetails"),
);
const PlatformDashboard = lazy(() => import("../Pages/Home/platformDashBoard"));
const BulkUpload = lazy(() => import("../../features/Bulk Upload/BulkUpload"));
const OptionSet = lazy(
  () => import("../../features/admin/OptionSet/OptionSet"),
);
const Eco = lazy(() => import("../../features/admin/eco/Eco"));
const Features = lazy(
  () => import("../../features/adminuser/FeatureBit/Features"),
);
const Permissions = lazy(
  () => import("../../features/adminuser/permissions/Permissions"),
);
const Roles = lazy(() => import("../../features/Roles/Roles"));
const Program = lazy(
  () => import("../../features/ProgramManagement/Program/Program"),
);
const Project = lazy(
  () => import("../../features/ProgramManagement/Project/Project"),
);
const Tasks = lazy(
  () => import("../../features/ProgramManagement/Tasks/Tasks"),
);
const GanttView = lazy(
  () => import("../../features/ProgramManagement/Gantt/GanttView"),
);
const KanbanBoard = lazy(
  () => import("../../features/ProgramManagement/Kanban/KanbanBoard"),
);
const TimeEntryList = lazy(
  () => import("../../features/ProgramManagement/TimeTracking/TimeEntryList"),
);
const ProjectDashboard = lazy(
  () => import("../../features/ProgramManagement/Dashboard/ProjectDashboard"),
);
const ResourceWorkload = lazy(
  () => import("../../features/ProgramManagement/Resources/ResourceWorkload"),
);
const CapacityPlanning = lazy(
  () => import("../../features/ProgramManagement/Resources/CapacityPlanning"),
);
const Requisitions = lazy(
  () => import("../../features/Procurement/requisitions/Requisitions"),
);
const Staff = lazy(() => import("../../features/ContactHub/Staff/Staff"));
const Organization = lazy(
  () => import("../../features/ContactHub/Organization/Organization"),
);
const BinList = lazy(() => import("../../features/Bin Management/BinList"));
const PaymentTerms = lazy(
  () => import("../../features/admin/PaymentTerms/PaymentTerms"),
);
const GoodsReceiptNote = lazy(
  () => import("../../features/Procurement/GoodsReceiptNote/GoodsReceiptNote"),
);
const PurchaseOrderDetails = lazy(
  () =>
    import("../../features/Procurement/purchaseOrders/PurchaseOrderDetails"),
);
const NewPurchaseOrder = lazy(
  () => import("../../features/Procurement/purchaseOrders/NewPurchaseOrder"),
);
const Settings = lazy(() => import("../../features/Settings/Settings"));
const Administration = lazy(
  () => import("../../features/Administration/Administration"),
);
const StockMovements = lazy(
  () => import("../../features/Inventory/StockMovements/StockMovements"),
);
const VendorReturns = lazy(
  () => import("../../features/Inventory/VendorReturns/VendorReturns"),
);
const Scrap = lazy(() => import("../../features/Inventory/Scrap/Scrap"));
const PartsInventory = lazy(
  () => import("../../features/Inventory/PartsInventory/PartsInventory"),
);
const GoodsInventory = lazy(
  () => import("../../features/Inventory/Goods/GoodsInventory"),
);
const ServicesInventory = lazy(
  () => import("../../features/Inventory/Services/ServicesInventory"),
);
const Contacts = lazy(
  () => import("../../features/ContactHub/Contacts/Contacts"),
);
const Company = lazy(() => import("../../features/ContactHub/Company/Company"));
const PartHierarchy = lazy(
  () => import("../../features/admin/parts/PartHierarchy"),
);
const BOM = lazy(() => import("../../features/admin/BOM/BOM"));
const WhereUsedHierarchy = lazy(
  () => import("../../features/admin/parts/WhereUsedHierarchy"),
);
const ConsolidatedBOMView = lazy(
  () => import("../../features/admin/parts/ConsolidatedBOMView"),
);
const StockReport = lazy(
  () => import("../../features/Inventory/StockReport/StockReport"),
);
const PartTypeCategories = lazy(
  () => import("../../features/admin/PartTypeCategories/PartTypeCategories"),
);
const AssemblyLocation = lazy(
  () => import("../../features/admin/AssemblyLocation/AssemblyLocation"),
);
const Subsystems = lazy(
  () => import("../../features/admin/Subsystems/Subsystems"),
);
const PartLevel = lazy(
  () => import("../../features/admin/partLevel/PartLevel"),
);
const ApprovalsConfig = lazy(
  () => import("../../features/adminuser/ApprovalsConfig/ApprovalsConfig"),
);
const QualityCheck = lazy(
  () => import("../../features/Procurement/qualityCheck/QualityCheck"),
);
const EmailTemplates = lazy(
  () => import("../../features/admin/EmailTemplates/EmailTemplates"),
);
const EmailLogs = lazy(
  () => import("../../features/admin/EmailLogs/EmailLogs"),
);
const AdditionalRecipients = lazy(
  () =>
    import("../../features/admin/AdditionalRecipients/AdditionalRecipients"),
);

// Context providers need to be imported normally (not lazy loaded)
import { GuideContextProvider } from "../../features/Guides/GuideContext";
import { ProductContextProvider } from "../../features/products/prodcutContext";

const GuideWithContext = () => (
  <GuideContextProvider>
    <GuideDetails />
  </GuideContextProvider>
);

const CompanyWithPermissions = () => {
  const { hasPermission } = useUserContext();
  const { value } = useParams();

  let permission = null;
  switch (value) {
    case "all":
      permission =
        PERMISSIONS.VENDORS.VIEW &&
        PERMISSIONS.PARTNERS.VIEW &&
        PERMISSIONS.CUSTOMERS.VIEW;
      break;
    case "vendors":
      permission = PERMISSIONS.VENDORS.VIEW;
      break;
    case "partners":
      permission = PERMISSIONS.PARTNERS.VIEW;
      break;
    case "customers":
      permission = PERMISSIONS.CUSTOMERS.VIEW;
      break;
    default:
      permission = false;
      break;
  }
  return hasPermission(permission) ? <Company /> : <UnAuthorizedUser />;
};

const Content = ({ status }) => {
  const { hasPermission } = useUserContext();

  const renderProtectedComponent = (permission, Component) => {
    return hasPermission(permission) ? <Component /> : <UnAuthorizedUser />;
  };

  return (
    <div className={status ? "main-content-spread" : "main-content"}>
      <BreadCrumbs />
      <Suspense fallback={<Cliploader loading={true} />}>
        <Routes>
          <Route path="/" element={<PlatformDashboard />} />
          <Route path="/home" element={<PlatformDashboard />} />
          <Route path="/unauthorized" element={<UnAuthorizedUser />} />
          <Route
            path="/audit"
            element={renderProtectedComponent(
              PERMISSIONS.AUDIT.VIEW._SELF,
              AuditTrail,
            )}
          />
          <Route
            path="/programmanagement/programs"
            element={renderProtectedComponent(
              PERMISSIONS.PROGRAMS.VIEW,
              Program,
            )}
          />
          <Route
            path="/programmanagement/projects"
            element={renderProtectedComponent(
              PERMISSIONS.PROJECTS.VIEW,
              Project,
            )}
          />
          <Route
            path="/programmanagement/issues"
            element={renderProtectedComponent("ISSUES.VIEW", Issues)}
          />
          <Route
            path="/programmanagement/tasks"
            element={renderProtectedComponent(
              PERMISSIONS.TASKS.VIEW,
              Tasks,
            )}
          />
          <Route
            path="/programmanagement/gantt/:projectId"
            element={renderProtectedComponent(
              PERMISSIONS.GANTT.VIEW,
              GanttView,
            )}
          />
          <Route
            path="/programmanagement/kanban/:projectId"
            element={renderProtectedComponent(
              PERMISSIONS.KANBAN.VIEW,
              KanbanBoard,
            )}
          />
          <Route
            path="/programmanagement/time-tracking"
            element={renderProtectedComponent(
              PERMISSIONS.TIMETRACKING.VIEW,
              TimeEntryList,
            )}
          />
          <Route
            path="/programmanagement/dashboard"
            element={renderProtectedComponent(
              PERMISSIONS.DASHBOARDS.VIEW,
              ProjectDashboard,
            )}
          />
          <Route
            path="/programmanagement/dashboard/:projectId"
            element={renderProtectedComponent(
              PERMISSIONS.DASHBOARDS.VIEW,
              ProjectDashboard,
            )}
          />
          <Route
            path="/programmanagement/resources"
            element={renderProtectedComponent(
              PERMISSIONS.RESOURCES.VIEW,
              ResourceWorkload,
            )}
          />
          <Route
            path="/programmanagement/resources/capacity"
            element={renderProtectedComponent(
              PERMISSIONS.RESOURCES.VIEW,
              CapacityPlanning,
            )}
          />
          <Route
            path="/product"
            element={renderProtectedComponent(
              PERMISSIONS.PRODUCTS.VIEW,
              Products,
            )}
          />
          <Route
            path="/products/:productId"
            element={renderProtectedComponent(PERMISSIONS.PRODUCTS.VIEW, () => (
              <ProductContextProvider>
                <Products />
              </ProductContextProvider>
            ))}
          />
          <Route
            path="/guides"
            element={renderProtectedComponent(PERMISSIONS.GUIDES.VIEW, Guides)}
          />
          <Route
            path="/guides/:guideId"
            element={renderProtectedComponent(
              PERMISSIONS.GUIDES.VIEW,
              GuideWithContext,
            )}
          />
          <Route
            path="/WorkOrders"
            element={renderProtectedComponent(
              PERMISSIONS.WORKORDERS.VIEW,
              WorkPackages,
            )}
          />
          <Route
            path="/workOrders/:workPackageId/workOrders"
            element={renderProtectedComponent(
              PERMISSIONS.WORKORDERS.VIEW,
              WorkOrders,
            )}
          />
          <Route
            path="/workOrders/:workPackageNumber/Details/:workOrderId"
            element={renderProtectedComponent(
              PERMISSIONS.WORKORDERS.VIEW,
              WorkOrderDetails,
            )}
          />
          <Route
            path="/WorkOrderDetails/:subWorkOrderNumber/:selectedStepId"
            element={renderProtectedComponent(
              PERMISSIONS.WORKORDERS.VIEW,
              WorkOrderStepDetails,
            )}
          />
          <Route
            path="/materialkits"
            element={renderProtectedComponent(
              PERMISSIONS.MATERIALKITS.VIEW,
              MaterialKits,
            )}
          />
          <Route
            path="/plm/parts"
            element={renderProtectedComponent(PERMISSIONS.PARTS.VIEW, Parts)}
          />{" "}
          <Route
            path="/plm/parts/hierarchy"
            element={renderProtectedComponent(
              PERMISSIONS.PARTS.VIEW,
              PartHierarchy,
            )}
          />{" "}
          <Route
            path="/plm/partWhereUsed/hierarchy/:part_id"
            element={renderProtectedComponent(
              PERMISSIONS.PARTS.VIEW,
              WhereUsedHierarchy,
            )}
          />{" "}
          <Route
            path="/plm/partWhereUsed/hierarchy"
            element={renderProtectedComponent(
              PERMISSIONS.PARTS.VIEW,
              WhereUsedHierarchy,
            )}
          />{" "}
          <Route
            path="/plm/parts/hierarchy/:part_id"
            element={renderProtectedComponent(
              PERMISSIONS.PARTS.VIEW,
              PartHierarchy,
            )}
          />
          <Route
            path="/plm/eco"
            element={renderProtectedComponent(PERMISSIONS.ECO.VIEW, Eco)}
          />{" "}
          <Route
            path="/plm/bom"
            element={renderProtectedComponent(PERMISSIONS.BOM.VIEW, BOM)}
          />
          <Route
            path="/plm/tools"
            element={renderProtectedComponent(PERMISSIONS.TOOLS.VIEW, Tools)}
          />
          <Route
            path="/plm/machines"
            element={renderProtectedComponent(
              PERMISSIONS.MACHINES.VIEW,
              Machines,
            )}
          />
          <Route
            path="/procurement/purchaseorders"
            element={renderProtectedComponent(
              PERMISSIONS.PURCHASEORDERS.VIEW,
              PurchaseOrders,
            )}
          />
          <Route
            path="/procurement/purchaseorders/new"
            element={renderProtectedComponent(
              PERMISSIONS.PURCHASEORDERS.MODIFY,
              NewPurchaseOrder,
            )}
          />
          <Route
            path="/procurement/purchaseorders/:po_id"
            element={renderProtectedComponent(
              PERMISSIONS.PURCHASEORDERS.VIEW,
              PurchaseOrderDetails,
            )}
          />
          <Route
            path="/inventory/partsInventory"
            element={renderProtectedComponent(
              PERMISSIONS.PARTS.INVENTORY.VIEW,
              PartsInventory,
            )}
          />
          <Route
            path="/inventory/goodsInventory"
            element={renderProtectedComponent(
              PERMISSIONS.GOODS.VIEW,
              GoodsInventory,
            )}
          />
          <Route
            path="/inventory/servicesInventory"
            element={renderProtectedComponent(
              PERMISSIONS.SERVICES.VIEW,
              ServicesInventory,
            )}
          />
          <Route
            path="/inventory/stockMovements"
            element={renderProtectedComponent(
              PERMISSIONS.STOCKMOVEMENTS.VIEW,
              StockMovements,
            )}
          />
          <Route
            path="/inventory/vendor-returns"
            element={renderProtectedComponent(
              PERMISSIONS.VENDORRETURNS.VIEW,
              VendorReturns,
            )}
          />
          <Route
            path="/inventory/scrap"
            element={renderProtectedComponent(PERMISSIONS.SCRAP.VIEW, Scrap)}
          />
          <Route
            path="/procurement/requisitions"
            element={renderProtectedComponent(
              PERMISSIONS.REQUISITIONS.VIEW,
              Requisitions,
            )}
          />
          <Route
            path="/procurement/goodsreceipts"
            element={renderProtectedComponent(
              PERMISSIONS.GOODSRECEIPTS.VIEW,
              GoodsReceiptNote,
            )}
          />
          <Route
            path="/procurement/qualityCheck"
            element={renderProtectedComponent(
              PERMISSIONS.QUALITYCHECK.VIEW,
              QualityCheck,
            )}
          />
          <Route
            path="/contacthub/companies"
            element={<Navigate to="/contacthub/companies/vendors" replace />}
          />
          <Route
            path="/contacthub/companies/:value"
            element={<CompanyWithPermissions />}
          />{" "}
          <Route
            path="/contacthub/contacts"
            element={renderProtectedComponent(
              PERMISSIONS.CONTACTS.VIEW,
              Contacts,
            )}
          />
          <Route
            path="/contacthub/staff"
            element={renderProtectedComponent(PERMISSIONS.STAFF.VIEW, Staff)}
          />
          <Route
            path="/contacthub/organization"
            element={renderProtectedComponent(
              PERMISSIONS.ORGANIZATION.VIEW,
              Organization,
            )}
          />
          <Route path="/reports" element={<Reports />} />
          <Route
            path="/reports/bomconsolidated"
            element={renderProtectedComponent(
              PERMISSIONS.REPORTS.BOMCONSOLIDATED,
              ConsolidatedBOMView,
            )}
          />
          <Route
            path="/reports/stockreport"
            element={renderProtectedComponent(
              PERMISSIONS.REPORTS.STOCKREPORT.VIEW,
              StockReport,
            )}
          />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/settings/parttypes"
            element={renderProtectedComponent(
              PERMISSIONS.PARTTYPES.VIEW,
              PartTypes,
            )}
          />
          <Route
            path="/settings/partlevels"
            element={renderProtectedComponent(
              PERMISSIONS.PARTLEVELS.VIEW,
              PartLevel,
            )}
          />
          <Route
            path="/settings/parttypecategories"
            element={renderProtectedComponent(
              PERMISSIONS.PARTTYPECATEGORIES.VIEW,
              PartTypeCategories,
            )}
          />
          <Route
            path="/settings/assemblylocations"
            element={renderProtectedComponent(
              PERMISSIONS.ASSEMBLYLOCATIONS.VIEW,
              AssemblyLocation,
            )}
          />
          <Route
            path="/settings/subsystems"
            element={renderProtectedComponent(
              PERMISSIONS.SUBSYSTEMS.VIEW,
              Subsystems,
            )}
          />
          <Route
            path="/settings/binmanagement"
            element={renderProtectedComponent(
              PERMISSIONS.BINMANAGEMENT.VIEW,
              BinList,
            )}
          />
          <Route
            path="/settings/optionsets"
            element={renderProtectedComponent("OPTIONSET.VIEW", OptionSet)}
          />
          <Route
            path="/settings/paymentterms"
            element={renderProtectedComponent(
              PERMISSIONS.PAYMENTTERMS.VIEW,
              PaymentTerms,
            )}
          />
          <Route
            path="/settings/emaillogs"
            element={renderProtectedComponent(
              PERMISSIONS.EMAILLOGS.VIEW,
              EmailLogs,
            )}
          />
          <Route
            path="/settings/locations"
            element={renderProtectedComponent(
              PERMISSIONS.LOCATIONS.VIEW,
              Locations,
            )}
          />
          <Route
            path="/settings/news"
            element={renderProtectedComponent("NEWS.VIEW", News)}
          />
          <Route
            path="/settings/bulkupload"
            element={renderProtectedComponent(
              PERMISSIONS.BULKUPLOAD.VIEW,
              BulkUpload,
            )}
          />
          <Route
            path="/settings/emailtemplates"
            element={renderProtectedComponent(
              PERMISSIONS.EMAILTEMPLATES.VIEW,
              EmailTemplates,
            )}
          />
          <Route
            path="/settings/additionalrecipients"
            element={renderProtectedComponent(
              PERMISSIONS.ADDITIONALRECIPIENTS.VIEW,
              AdditionalRecipients,
            )}
          />
          <Route path="/administration" element={<Administration />} />
          <Route
            path="/administration/users"
            element={renderProtectedComponent(PERMISSIONS.USERS.VIEW, Users)}
          />
          <Route
            path="/administration/departments"
            element={renderProtectedComponent(
              PERMISSIONS.DEPARTMENTS.VIEW,
              Departments,
            )}
          />
          <Route
            path="/administration/features"
            element={renderProtectedComponent("FEATURE.VIEW", Features)}
          />
          <Route
            path="/administration/permissions"
            element={renderProtectedComponent("PERMISSION.VIEW", Permissions)}
          />
          <Route
            path="/administration/roles"
            element={renderProtectedComponent(PERMISSIONS.ROLES.VIEW, Roles)}
          />
          <Route
            path="/administration/Approvalsconfigurations"
            element={renderProtectedComponent(
              PERMISSIONS.ApprovalsConfig.VIEW,
              ApprovalsConfig,
            )}
          />
          <Route
            path="/settings/qualityreports"
            element={renderProtectedComponent(
              "QUALITYREPORT.VIEW",
              QualityReports,
            )}
          />
          <Route
            path="/settings/issuelist"
            element={renderProtectedComponent("ISSUELIST.VIEW", IssuesList)}
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Content;
