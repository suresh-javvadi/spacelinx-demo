import React, { useState, useEffect, useContext } from "react";
import "../../../features/features.css";
import NewEbom from "./NewEbom";
import { Drawer } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { fetchEbom } from "../../../services/partService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import EditPart from "../parts/EditPart";
import Cliploader from "../../../Components/Loaders/Cliploader";
import ImportComponent from "../ImportComponent";

const Ebom = () => {
  const [loadEbomData, setLoadEbomData] = useState(true);
  const [EbomData, setEbomData] = useState([]);
  const [createEbomDrawerStatus, setCreateEbomDrawerStatus] = useState(false);
  const [EditPartFlyoutStatus, setEditPartFlyoutStatus] = useState(false);
  const [selectedEditPartId, setSelectedEditPartId] = useState(null);
  const [selectedPartType, setSelectedPartType] = useState(null);
  const [mainPartsLoadingData, setMainPartsLoadingData] = useState();
  const [selectedId, setSelectedId] = useState("");
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const handleCloseClick = () => {
    setCreateEbomDrawerStatus(false);
  };
  const handleCloseEditPartFlyout = () => {
    setEditPartFlyoutStatus(false);
    setSelectedEditPartId(null);
    setSelectedPartType(null);
  };

  const handleRefresh = () => {
    setLoadEbomData(true);
  };
  useEffect(() => {
    setLoadingData(true);
    setTimeout(() => {
      setLoadingData(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!loadEbomData) {
      return;
    }

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchEbom();
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setEbomData(data);
        setLoadEbomData(false);
      } catch (error) {
        Alert("Couldn't Fetch Ebom Data...!", "error");
        console.error("Error fetching  Ebom data:", error);
      } finally {
        setLoadingData(false);
        setLoadEbomData(false);
      }
    };

    fetchData();
  }, [loadEbomData]);

  const columns = [
    {
      field: "partNumber",
      headerName: "Parent Number",
      flex: 1,
      headerClassName: "DataGridColumn",
      valueGetter: (params) =>
        params.row.part ? params.row.part.partNumber : "",
    },
    {
      field: "partName",
      headerName: "Parent Name",
      flex: 1,
      headerClassName: "DataGridColumn",
      valueGetter: (params) => (params.row.part ? params.row.part.name : ""),
    },
    {
      field: "childPartNumber",
      headerName: "Child Number",
      flex: 1,
      headerClassName: "DataGridColumn",
      valueGetter: (params) =>
        params.row.childPart ? params.row.childPart.partNumber : "",
    },
    {
      field: "childPartName",
      headerName: "Child Name",
      flex: 1,
      headerClassName: "DataGridColumn",
      valueGetter: (params) =>
        params.row.childPart ? params.row.childPart.name : "",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      headerClassName: "DataGridColumn",
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
              <p className="PageHeader">E-BOM</p>
            </div>
            <ImportComponent
              entityName="EBOM"
              uploadKey="ebom"
              setLoadData={setLoadEbomData}
              setCreateDrawerStatus={setCreateEbomDrawerStatus}
              handleRefresh={handleRefresh}
            />
          </div>
          <div className="MasterDataDataGridDiv">
            <DataGrid
              rows={EbomData}
              columns={columns}
              className="DataGrid"
              pageSize={5}
              getRowId={(row) => `${row.partId}-${row.childPartId}`}
              onRowClick={(params) => {
                setSelectedId(params.row);
                setEditPartFlyoutStatus(true);
              }}
            />
          </div>
          <Drawer
            anchor="right"
            open={createEbomDrawerStatus}
            onClose={handleCloseClick}
            PaperProps={{ className: "DrawerStyles" }}
          >
            <NewEbom
              loadingData={loadingData}
              handleCloseClick={handleCloseClick}
              handleRefresh={handleRefresh}
              setMainEBomLoading={setLoadingData}
              setEbomData={setEbomData}
            />
          </Drawer>
          <Drawer
            anchor="right"
            open={EditPartFlyoutStatus}
            onClose={handleCloseEditPartFlyout}
            PaperProps={{ className: "DrawerStyles" }}
          >
            <EditPart
              handleCloseClick={handleCloseEditPartFlyout}
              handleRefresh={handleRefresh}
              selectedPart={selectedId}
              setMainPartsLoadingData={setMainPartsLoadingData}
            />
          </Drawer>
          <div className="AlertMessages">
            <HomeAlerts />
          </div>
        </div>
      )}
    </>
  );
};

export default Ebom;
