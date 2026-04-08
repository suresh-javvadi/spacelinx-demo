import React, { useEffect, useState, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Cliploader from "../../Components/Loaders/Cliploader";
import { fetchWorkOrderByPartIdAndProductId } from "../../services/WOrderService";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../features/userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const BillOfWorkorders = ({ productId, partId, setAllDataIsFetched }) => {
  const [workOrderData, setWorkOrderData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const navigate = useNavigate();
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);

  const canViewProductWorkorders = hasPermission(
    PERMISSIONS.PRODUCTS.WORKORDERS.VIEW
  );
  const canViewWorkorderDetails = hasPermission(PERMISSIONS.WORKORDERS.VIEW);

  useEffect(() => {
    if (partId) {
      fetchData();
    }
  }, [partId]);

  const fetchData = async () => {
    setAllDataIsFetched(true);
    setLoadingData(true);
    try {
      const data = await fetchWorkOrderByPartIdAndProductId(productId, partId);
      setWorkOrderData(data);
    } catch (error) {
      console.error("Error fetching work order data:", error);
    } finally {
      setLoadingData(false);
      setAllDataIsFetched(false);
    }
  };

  if (!canViewProductWorkorders) {
    return (
      <div className="NoPermissionMessage">
        <p>You do not have permission to view workorders for this product.</p>
      </div>
    );
  }

  const columns = [
    {
      field: "number",
      headerName: "Number",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row, value }) => (
        <div
          className={`AppHyperLink ${
            !canViewWorkorderDetails ? "disabled-link" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (canViewWorkorderDetails) {
              navigate(`/WorkOrders/${row?.number}/Details/${row?.id}`);
            } else {
              Alert(
                "You do not have access to view workorder details!",
                "warning"
              );
            }
          }}
          title={
            !canViewWorkorderDetails
              ? "You do not have permission to view workorder details"
              : ""
          }
        >
          {value}
        </div>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 1,
    },
    {
      field: "partName",
      headerName: "Part Name",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "manager",
      headerName: "Manager",
      flex: 1,
    },
    {
      field: "endDate",
      headerName: "Due Date",
      flex: 1,
    },
  ];

  const rows = workOrderData.map((row, index) => ({
    id: row.id,
    name: row?.name,
    number: row?.number,
    partNumber: row.part?.partNumber,
    partName: row.part?.name,
    status: row?.status,
    manager: `${row.manager?.firstName} ${row.manager?.lastName}`,
    endDate: new Date(row.endDate).toLocaleDateString(),
  }));

  return (
    <div className="ProductDataGridDiv">
      <StyledDataGrid
        rows={rows}
        columns={columns}
        loading={loadingData}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        disableSelectionOnClick
      />
    </div>
  );
};

export default BillOfWorkorders;
