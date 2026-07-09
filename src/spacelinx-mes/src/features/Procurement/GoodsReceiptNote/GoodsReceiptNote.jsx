import React, { useEffect, useState, useContext } from "react";
import { Autocomplete, Button, TextField } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { fetchGoodReceiptNoteswithUser } from "../../../services/goodReceiptNoteService";
import NewGoodReceiptNote from "./NewGoodReceiptNote";
import EditGoodReceiptNote from "./EditGoodReceiptNote";
import dayjs from "dayjs";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchPartsLookUp } from "../../../services/partService";
import { fetchVendors } from "../../../services/companyService";
import { formatAmount } from "../../../utils/numberFormatter";

const GoodsReceiptNote = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission, isSuperAdmin } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [grnData, setGrnData] = useState([]);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState(null);
  const [partsData, setPartsData] = useState([]);
  const [loadingPartsData, setLoadingPartsData] = useState(true);
  const [vendorsData, setVendorsData] = useState([]);
  const [loadingVendorsData, setLoadingVendorsData] = useState(true);

  useEffect(() => {
    fetchPartsData();
    fetchVendorsData();
  }, []);

  const fetchVendorsData = async () => {
    setLoadingVendorsData(true);
    try {
      const data = await fetchVendors();
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setVendorsData(sortedData);
    } catch (error) {
      console.error("Failed to fetch vendors data:", error);
      Alert("Failed to fetch vendors data", "error");
    } finally {
      setLoadingVendorsData(false);
    }
  };

  const fetchPartsData = async () => {
    setLoadingPartsData(true);
    try {
      const data = await fetchPartsLookUp();
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setPartsData(sortedData);
    } catch (error) {
      console.error("Failed to fetch parts data:", error);
      Alert("Failed to fetch parts data", "error");
    } finally {
      setLoadingPartsData(false);
    }
  };

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
    const saved = sessionStorage.getItem("goodsReceiptNoteColumnVisibility");
    return saved ? JSON.parse(saved) : defaultHiddenColumns;
  });

  const handleClose = () => {
    setCreateDrawerOpen(false);
    setEditDrawerOpen(false);
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchGoodReceiptNoteswithUser();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      field: "expectedDeliveryDate",
      headerName: "Delivery Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.expectedDeliveryDate ? new Date(row.expectedDeliveryDate) : null,
    },
    {
      field: "paymentTermName",
      headerName: "Payment Terms",
      flex: 1,
      renderCell: ({ row }) => row?.paymentTermName || "---",
    },
    {
      field: "expectedPaymentDate",
      headerName: "Expected Payment Date",
      flex: 1,
      type: "date",
      valueGetter: (_value, row) =>
        row.expectedPaymentDate ? new Date(row.expectedPaymentDate) : null,
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
        <p className="PageHeader">Goods Receipts</p>
        <Button
          onClick={() => {
            if (hasPermission(PERMISSIONS.GOODSRECEIPTS.MODIFY)) {
              setCreateDrawerOpen(true);
            } else {
              Alert("You do not have access to add..! ", "warning");
            }
          }}
        >
          + Add New
        </Button>
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
              "goodsReceiptNoteColumnVisibility",
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
        open={createDrawerOpen}
        onClose={handleClose}
        defaultWidth={75}
      >
        <NewGoodReceiptNote
          handleClose={handleClose}
          handleRefresh={fetchData}
          partsData={partsData}
          loadingPartsData={loadingPartsData}
          setLoadingPartsData={setLoadingPartsData}
          vendorsData={vendorsData}
          loadingVendorsData={loadingVendorsData}
        />
      </ResizableDrawer>

      <ResizableDrawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleClose}
        defaultWidth={75}
      >
        <EditGoodReceiptNote
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

export default GoodsReceiptNote;
