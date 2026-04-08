import React, { useEffect, useState, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { fetchGoodReceiptNoteswithUser } from "../../../services/goodReceiptNoteService";
import EditQualityCheck from "./EditQualityCheck";
import dayjs from "dayjs";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { formatAmount } from "../../../utils/numberFormatter";

const QualityCheck = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission, isSuperAdmin } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [grnData, setGrnData] = useState([]);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState(null);

  const defaultHiddenColumns = {
    description: false,
    totalAmount: false,
    deliveryStatus: false,
    deliveryDate: false,
    projectId: false,
    vendorReferenceId: false,
    isActive: false,
    createdAt: false,
  };

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = sessionStorage.getItem("qualityCheckColumnVisibility");
    return saved ? JSON.parse(saved) : defaultHiddenColumns;
  });

  const handleClose = () => {
    setEditDrawerOpen(false);
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchGoodReceiptNoteswithUser();
      const statusPriority = {
        Completed: 1,
        "In Process": 2,
        Closed: 3,
      };
      data.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 999;
        const priorityB = statusPriority[b.status] || 999;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setGrnData(data);
    } catch (error) {
      console.error(
        "Error fetching Goods Receipt Notes:",
        error?.response?.data || error.message,
      );
      Alert("Error fetching Goods Receipt Notes", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      field: "grnNumber",
      headerName: "GRN Number",
      flex: 1,
      renderCell: ({ row }) => (
        <span
          className="AppHyperLink"
          onClick={() => {
            if (hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW)) {
              setSelectedGrn(row);
              setEditDrawerOpen(true);
            } else {
              Alert("You do not have access to view this..! ", "warning");
            }
          }}
        >
          {row?.grnNumber}
        </span>
      ),
    },
    {
      field: "poNumber",
      headerName: "PO Number",
      flex: 1,
    },
    {
      field: "orderDate",
      headerName: "PO Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.orderDate ? new Date(row.orderDate) : null,
    },
    {
      field: "invoiceNumber",
      headerName: "Invoice Number",
      flex: 1,
    },
    {
      field: "invoiceDate",
      headerName: "Invoice Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.invoiceDate ? new Date(row.invoiceDate) : null,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Pending", "In Process", "Completed", "Closed"],
    },
    {
      field: "locationName",
      headerName: "Location",
      flex: 1,
    },
    {
      field: "receivedByFullName",
      headerName: "Received By",
      flex: 1,
      valueGetter: (_value, row) => row.receivedByFullName || "N/A",
    },
    {
      field: "receivedDate",
      headerName: "Received Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.receivedDate ? new Date(row.receivedDate) : null,
    },
    {
      field: "createdAt",
      headerName: "Created Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.createdAt ? new Date(row.createdAt) : null,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "totalAmount",
      headerName: "Total Amount",
      flex: 1,
      type: "number",
      valueFormatter: (value) => formatAmount(value, 4),
    },
    {
      field: "deliveryStatus",
      headerName: "Delivery Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Pending", "In Process", "Completed", "Closed"],
    },
    {
      field: "deliveryDate",
      headerName: "Delivery Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.deliveryDate ? new Date(row.deliveryDate) : null,
    },
    {
      field: "projectId",
      headerName: "Project ID",
      flex: 1,
    },
    {
      field: "vendorReferenceId",
      headerName: "Vendor Ref ID",
      flex: 1,
    },
    {
      field: "isActive",
      headerName: "Is Active",
      flex: 0.5,
      type: "boolean",
      renderCell: ({ row }) => (row.isActive ? "Yes" : "No"),
    },
  ];

  return (
    <div className="AdminChildren">
      <div className="AdminChildrenHeader">
        <p className="PageHeader">Quality Check</p>
      </div>

      <div className="GrnDataGridWrapper">
        <StyledDataGrid
          rows={grnData}
          columns={columns}
          getRowId={(row) => row.grnId}
          className="DataGrid"
          loading={loadingData}
          initialState={{
            columns: {
              columnVisibilityModel: columnVisibilityModel,
            },
          }}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => {
            setColumnVisibilityModel(newModel);
            sessionStorage.setItem(
              "qualityCheckColumnVisibility",
              JSON.stringify(newModel),
            );
          }}
          onRowClick={(params) => {
            if (hasPermission(PERMISSIONS.GOODSRECEIPTS.VIEW)) {
              setSelectedGrn(params.row);
              setEditDrawerOpen(true);
            } else {
              Alert("You do not have access to view this..! ", "warning");
            }
          }}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 50]}
          autoHeight={false}
        />
      </div>

      <ResizableDrawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleClose}
        defaultWidth={75}
      >
        <EditQualityCheck
          selectedGRN={selectedGrn}
          handleClose={handleClose}
          handleRefresh={fetchData}
        />
      </ResizableDrawer>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default QualityCheck;
