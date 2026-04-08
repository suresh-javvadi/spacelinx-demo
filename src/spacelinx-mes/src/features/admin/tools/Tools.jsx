import React, { useState, useEffect, useContext } from "react";
import "../../../features/features.css";
import { Drawer } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { fetchTools } from "../../../services/toolService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import NewTool from "./NewTool";
import EditTool from "./EditTool";
import ImportComponent from "../ImportComponent";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { fetchToolTypes } from "../../../services/toolTypeService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const Tools = () => {
  const { Alert } = useContext(AlertsContext);
  const [loadToolsData, setLoadToolsData] = useState(true);
  const [toolsData, setToolsData] = useState([]);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [createToolDrawerStatus, setCreateToolDrawerStatus] = useState(false);
  const [editToolDrawerStatus, setEditToolDrawerStatus] = useState(false);
  const [toolsNumbersData, setToolsNumbersData] = useState([]);
  const [toolTypesLoading, setToolTypesLoading] = useState(true);
  const [toolTypes, setToolTypes] = useState([]);

  const handleCloseClick = () => {
    setCreateToolDrawerStatus(false);
    setEditToolDrawerStatus(false);
  };

  const handleRefresh = () => {
    setLoadToolsData(true);
    fetchData();
  };

  useEffect(() => {
    fetchData();
    fetchToolTypesData();
  }, []);

  const fetchData = async () => {
    setLoadToolsData(true);
    try {
      const data = await fetchTools();
      if (data) {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setToolsNumbersData(data.map((tool) => tool.number));
        setToolsData(data);
      }
    } catch (error) {
      Alert("Error fetching Tools data", "error");
      console.error("Error fetching tools data:", error);
    } finally {
      setLoadToolsData(false);
    }
  };

  const fetchToolTypesData = async () => {
    setToolTypesLoading(true);
    try {
      const toolTypesData = await fetchToolTypes();
      setToolTypes(toolTypesData);
    } catch (error) {
      Alert("Couldn't fetch Tool Types...!", "error");
    } finally {
      setToolTypesLoading(false);
    }
  };

  const columns = [
    {
      field: "number",
      headerName: "Number",
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "ToolType",
      headerName: "Type",
      flex: 1,
      valueGetter: (_value, row) => row.toolType?.name || "",
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">Tools</p>
          </div>
          <ImportComponent
            entityName="Tool"
            uploadKey="tool"
            setLoadData={setLoadToolsData}
            setCreateDrawerStatus={setCreateToolDrawerStatus}
            handleRefresh={handleRefresh}
          />
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={toolsData}
            columns={columns}
            loading={loadToolsData}
            pageSize={5}
            onRowClick={(params) => {
              setSelectedId(params.row.id);
              setSelectedRowData(params.row);
              setEditToolDrawerStatus(true);
            }}
            className="DataGrid"
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createToolDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewTool
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            ToolsData={toolsData}
            setCreateToolDrawerStatus={setCreateToolDrawerStatus}
            toolTypesLoading={toolTypesLoading}
            toolTypes={toolTypes}
            toolsNumbersData={toolsNumbersData}
            fetchToolTypesData={fetchToolTypesData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editToolDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
        >
          <EditTool
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedId={selectedId}
            selectedToolData={selectedRowData}
            toolsNumbersData={toolsNumbersData}
            toolTypesLoading={toolTypesLoading}
            toolTypes={toolTypes}
            fetchToolTypesData={fetchToolTypesData}
          />
        </ResizableDrawer>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default Tools;
