import React, { useState, useEffect, useContext } from "react";
import "../../features/features.css";
import { Drawer, Button } from "@mui/material";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import NewIssue from "./NewIssues";
import EditIssue from "./EditIssues";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useIssues } from "./IssuesContext";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { fetchProductsLookup } from "../../services/productService";
import { fetchGuidesLookup } from "../../services/guideService";
import { fetchWorkordersLookup } from "../../services/WOrderService";
import { fetchOptionSetByAppName } from "../../services/optionSetService";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const Issues = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const { issuesData, loadingData } = useIssues();
  const [editIssueDrawerStatus, setEditIssueDrawerStatus] = useState(false);
  const [createIssueDrawerStatus, setCreateIssueDrawerStatus] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [loadingIssueData, setLoadingIssueData] = useState(true);
  const [issuesTypes, setIssuesTypes] = useState([]);
  const [issuesPriorities, setIssuesPriorities] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [projectNames, setProjectNames] = useState([]);
  const [guidesData, setGuidesData] = useState([]);
  const [workOrdersData, setWorkOrdersData] = useState([]);

  const handleCloseClick = () => {
    setCreateIssueDrawerStatus(false);
    setEditIssueDrawerStatus(false);
  };
  useEffect(() => {
    const fetchOptionsData = async () => {
      setLoadingIssueData(true);
      try {
        const [optionSet, guides, products, workOrders] = await Promise.all([
          fetchOptionSetByAppName(),
          fetchGuidesLookup(),
          fetchProductsLookup(),
          fetchWorkordersLookup(),
        ]);

        const issuesTypesData = optionSet.find(
          (item) => item.name === "issues_types_jira"
        );
        const issuesPrioritiesData = optionSet.find(
          (item) => item.name === "issues_priorities"
        );
        const projectNamesData = optionSet.find(
          (item) => item.name === "Project_Names"
        );

        if (issuesTypesData) {
          setIssuesTypes(JSON.parse(issuesTypesData.values));
        }

        if (issuesPrioritiesData) {
          setIssuesPriorities(JSON.parse(issuesPrioritiesData.values));
        }

        if (projectNamesData) {
          setProjectNames(JSON.parse(projectNamesData.values));
        }

        setGuidesData(guides);
        setProductsData(products);
        setWorkOrdersData(workOrders);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoadingIssueData(false);
    };
    fetchOptionsData();
  }, []);

  const columns = [
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1,
    },
    {
      field: "issueType",
      headerName: "Issue Type",
      flex: 1,
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
    },
    {
      field: "guide",
      headerName: "Guide",
      flex: 1,
      valueGetter: (_value, row) => row.guide?.name || "",
    },
    {
      field: "workOrder",
      headerName: "Work Order",
      flex: 1,
      valueGetter: (_value, row) => row.workOrder?.name || "",
    },
    {
      field: "product",
      headerName: "Product",
      flex: 1,
      valueGetter: (_value, row) => row.product?.name || "",
    },
    {
      field: "jiraId",
      headerName: "Jira ID",
      flex: 1,
      valueGetter: (_value, row) => row.jiraId || "",
    },
  ];

  return (
    <>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="AdminChildren">
          <div className="AdminChildrenHeader">
            <div>
              <p className="PageHeader">Issues</p>
            </div>
            <Button
              onClick={() => {
                if (!hasPermission(PERMISSIONS.ISSUES.MODIFY)) {
                  Alert("You do not have access to create.", "warning");
                  return;
                }
                setCreateIssueDrawerStatus(true);
              }}
            >
              + Add New
            </Button>
          </div>
          <div className="DataGridDiv">
            <StyledDataGrid
              rows={issuesData}
              columns={columns}
              onRowClick={(params) => {
                setSelectedRowData(params.row);
                setEditIssueDrawerStatus(true);
              }}
              className="DataGrid"
              pageSize={5}
            />
          </div>
          <ResizableDrawer
            anchor="right"
            open={createIssueDrawerStatus}
            onClose={handleCloseClick}
          >
            <NewIssue handleCloseClick={handleCloseClick} />
          </ResizableDrawer>
          <ResizableDrawer
            anchor="right"
            open={editIssueDrawerStatus}
            onClose={handleCloseClick}
          >
            <EditIssue
              handleCloseClick={handleCloseClick}
              selectedIssue={selectedRowData}
              loadingIssueData={loadingIssueData}
              issuesTypes={issuesTypes}
              issuesPriorities={issuesPriorities}
              productsData={productsData}
              projectNames={projectNames}
              guidesData={guidesData}
              workOrdersData={workOrdersData}
            />
          </ResizableDrawer>

          <div className="AlertMessages">
            <HomeAlerts />
          </div>
        </div>
      )}
    </>
  );
};

export default Issues;
