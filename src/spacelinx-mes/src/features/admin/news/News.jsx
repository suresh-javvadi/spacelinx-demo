import { useState, useEffect, useContext } from "react";
import "../../../features/features.css";
import NewNews from "./NewNews";
import EditNews from "./EditNews";
import { fetchNews } from "../../../services/newsService";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ImportComponent from "../ImportComponent";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const News = () => {
  const { Alert } = useContext(AlertsContext);
  const [createNewsDrawerStatus, setCreateNewsDrawerStatus] = useState(false);
  const [editNewsDrawerStatus, setEditNewsDrawerStatus] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const handleCloseClick = () => {
    setCreateNewsDrawerStatus(false);
    setEditNewsDrawerStatus(false);
  };
  const handleRefresh = () => {
    setLoadingData(true);
    fetchData();
  };
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const newsData = await fetchNews();
      if (newsData) {
        setLoadingData(false);
      }
      newsData.sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
      setNewsData(newsData);
    } catch (error) {
      Alert("Error fetching  News data", "error");
      console.error("Error fetching News data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "newsType",
      headerName: "Type",
      flex: 1,
      valueGetter: (_value, row) => row.newsType?.name || "",
    },
    {
      field: "hyperlink",
      headerName: "HyperLink",
      flex: 1,
    },
    {
      field: "origin",
      headerName: "Origin",
      flex: 1,
      minWidth: 50,
      renderCell: ({ value }) => value,
    },
    {
      field: "image",
      headerName: "Image URL",
      flex: 1,
      minWidth: 50,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <div>
            <p className="PageHeader">News</p>
          </div>
          <ImportComponent
            entityName="News"
            uploadKey="news"
            setLoadData={setLoadingData}
            setCreateDrawerStatus={setCreateNewsDrawerStatus}
            handleRefresh={handleRefresh}
          />
        </div>
        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={newsData}
            columns={columns}
            className="DataGrid"
            pageSize={5}
            onRowClick={(params) => {
              setSelectedId(params.row.id);
              setEditNewsDrawerStatus(true);
              setSelectedRowData(params.row);
            }}
            loading={loadingData}
          />
        </div>
        <ResizableDrawer
          anchor="right"
          open={createNewsDrawerStatus}
          onClose={handleCloseClick}
        >
          <NewNews
            setMainLOcationsLoadingData={setLoadingData}
            handleCloseClick={handleCloseClick}
            newsData={newsData}
            setCreateNewsDrawerStatus={setCreateNewsDrawerStatus}
            handleRefresh={handleRefresh}
          />
        </ResizableDrawer>
        <ResizableDrawer
          anchor="right"
          open={editNewsDrawerStatus}
          onClose={handleCloseClick}
          variant="persistent"
        >
          <EditNews
            setMainLocationsLoadingData={setLoadingData}
            handleCloseClick={handleCloseClick}
            handleRefresh={handleRefresh}
            selectedId={selectedId}
            selectedNewsData={selectedRowData}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default News;
