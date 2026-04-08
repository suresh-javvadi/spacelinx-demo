import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";

import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

import { useUserContext } from "../../userContext/UserContext";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";

import EditVendorReturn from "./EditVendorReturn";
import NewVendorReturn from "./NewVendorReturn";

import { fetchVendorReturnRequestWithUser } from "../../../services/vendorReturnRequestService";
import { fetchVendors } from "../../../services/companyService";
import { fetchLocations } from "../../../services/locationService";
import { fetchPurchaseOrders } from "../../../services/purchaseOrders";
import { fetchGoodReceiptNotes } from "../../../services/goodReceiptNoteService";

const VendorReturns = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();

  const [loadingData, setLoadingData] = useState(true);
  const [vendorReturnData, setVendorReturnData] = useState([]);

  // Shared data for child components
  const [sharedData, setSharedData] = useState({
    vendors: [],
    locations: [],
    purchaseOrders: [],
    goodReceiptNotes: [],
    loading: true,
  });

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const [selectedReturn, setSelectedReturn] = useState(null);

  // Fetch shared data once
  const fetchSharedData = async () => {
    try {
      const [vendors, locations, pos, grns] = await Promise.all([
        fetchVendors(),
        fetchLocations(),
        fetchPurchaseOrders(),
        fetchGoodReceiptNotes(),
      ]);

      setSharedData({
        vendors: vendors.filter((v) => v.isVendor),
        locations,
        purchaseOrders: pos,
        goodReceiptNotes: grns,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching shared data:", error);
      Alert("Error loading reference data", "error");
      setSharedData((prev) => ({ ...prev, loading: false }));
    }
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchVendorReturnRequestWithUser();
      const grouped = Object.values(
        data.reduce((acc, row) => {
          if (!acc[row.vendorReturnRequestId]) {
            acc[row.vendorReturnRequestId] = {
              id: row.vendorReturnRequestId,
              returnNumber: row.returnNumber,
              returnDate: row.returnDate,
              status: row.returnStatus || row.status || "Draft",
              vendorName: row.vendorName || "---",
              poNumber: row.poNumber || "---",
              grnNumber: row.grnNumber || "---",
              locationName: row.locationName || "---",
              raisedByName: row.raisedByFullName || "---",
              lineItems: [],
              fullData: [],
              createdAt: row.createdAt,
              createdBy: row.createdBy,
            };
          }

          acc[row.vendorReturnRequestId].lineItems.push({
            lineItemId: row.lineItemId,
            partId: row.partId,
            returnQuantity: row.returnQuantity,
            trackingType: row.trackingType,
            trackingId: row.trackingId,
            lineItemReason: row.lineItemReason,
          });

          acc[row.vendorReturnRequestId].fullData.push(row);

          return acc;
        }, {}),
      );

      grouped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setVendorReturnData(grouped);
    } catch (error) {
      console.error("Error fetching vendor returns:", error);
      Alert("Error loading vendor return data", "error");
    }
    setLoadingData(false);
  };

  useEffect(() => {
    fetchSharedData();
    fetchData();
  }, []);

  const handleClose = () => {
    setCreateDrawerOpen(false);
    setEditDrawerOpen(false);
    setSelectedReturn(null);
  };

  const handleRefresh = () => {
    fetchData();
    handleClose();
  };

  const columns = [
    {
      field: "returnNumber",
      headerName: "Return Number",
      flex: 1,
      renderCell: ({ row }) => (
        <span
          className="AppHyperLink"
          onClick={() => {
            if (!hasPermission(PERMISSIONS.VENDORRETURNS.VIEW)) {
              Alert("You do not have permission to view this", "warning");
              return;
            }
            setSelectedReturn(row);
            setEditDrawerOpen(true);
          }}
        >
          {row.returnNumber}
        </span>
      ),
    },
    { field: "vendorName", headerName: "Vendor", flex: 1 },
    { field: "poNumber", headerName: "PO Number", flex: 1 },
    { field: "grnNumber", headerName: "GRN Number", flex: 1 },
    { field: "locationName", headerName: "Location", flex: 1 },
    {
      field: "returnDate",
      headerName: "Return Date",
      flex: 1,
      type: "date",
      valueGetter: (_, row) =>
        row.returnDate ? new Date(row.returnDate) : null,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      type: "singleSelect",
      valueOptions: ["Draft", "Submitted", "Approved", "Rejected"],
    },
    {
      field: "raisedByName",
      headerName: "Requested By",
      flex: 1,
    },
  ];

  return (
    <div className="AdminChildren">
      {/* HEADER */}
      <div className="AdminChildrenHeader">
        <p className="PageHeader">Vendor Returns</p>

        <Button
          onClick={() => {
            if (!hasPermission(PERMISSIONS.VENDORRETURNS.MODIFY)) {
              Alert(
                "You do not have permission to add vendor returns",
                "warning",
              );
              return;
            }
            setCreateDrawerOpen(true);
          }}
        >
          + Add New
        </Button>
      </div>

      <div className="MasterDataDataGridDiv">
        <StyledDataGrid
          rows={vendorReturnData}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loadingData}
          pageSize={5}
          className="DataGrid"
          onRowClick={(params) => {
            if (!hasPermission(PERMISSIONS.VENDORRETURNS.VIEW)) {
              Alert("You do not have permission to view returns", "warning");
              return;
            }
            setSelectedReturn(params.row);
            setEditDrawerOpen(true);
          }}
        />
      </div>

      {/* CREATE DRAWER */}
      <ResizableDrawer
        anchor="right"
        open={createDrawerOpen}
        onClose={handleClose}
        defaultWidth={75}
      >
        <NewVendorReturn
          handleCloseClick={handleClose}
          handleRefresh={handleRefresh}
          sharedData={sharedData}
        />
      </ResizableDrawer>

      {/* EDIT DRAWER */}
      <ResizableDrawer
        anchor="right"
        open={editDrawerOpen}
        onClose={handleClose}
        defaultWidth={75}
      >
        <EditVendorReturn
          returnData={selectedReturn}
          handleCloseClick={handleClose}
          handleRefresh={handleRefresh}
          sharedData={sharedData}
        />
      </ResizableDrawer>

      <div className="AlertMessages">
        <HomeAlerts />
      </div>
    </div>
  );
};

export default VendorReturns;
