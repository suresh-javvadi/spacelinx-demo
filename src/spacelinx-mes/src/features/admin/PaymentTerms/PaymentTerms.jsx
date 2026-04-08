import React, { useEffect, useState, useContext } from "react";
import { Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { HomeAlerts } from "../../AlertsContext/Alerts";
import { fetchPaymentTerms } from "../../../services/paymentTermService";
import NewPaymentTerm from "./NewPaymentTerm";
import EditPaymentTerm from "./EditPaymentTerm";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const PaymentTerms = () => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [paymentTermData, setPaymentTermData] = useState([]);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState(null);

  const handleClose = () => {
    setCreateDrawerOpen(false);
    setEditDrawerOpen(false);
  };

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPaymentTerms();
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPaymentTermData(data);
    } catch (error) {
      Alert("Error fetching Payment Terms", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "dueDays",
      headerName: "Due Days",
      flex: 0.5,
    },
    {
      field: "paymentTerms",
      headerName: "Terms and Conditions",
      flex: 1,
    },
  ];

  return (
    <>
      <div className="AdminChildren">
        <div className="AdminChildrenHeader">
          <p className="PageHeader">Payment Terms</p>
          <Button
            onClick={() => {
              if (hasPermission(PERMISSIONS.PAYMENTTERMS.MODIFY)) {
                setCreateDrawerOpen(true);
              } else {
                Alert(
                  "You do not have access to create a Payment Term",
                  "warning"
                );
              }
            }}
          >
            + Add New
          </Button>
        </div>

        <div className="MasterDataDataGridDiv">
          <StyledDataGrid
            rows={paymentTermData}
            columns={columns}
            getRowId={(row) => row.id}
            onRowClick={(params) => {
              setSelectedPaymentTerm(params.row);
              setEditDrawerOpen(true);
            }}
            className="DataGrid"
            pageSize={5}
            loading={loadingData}
          />
        </div>

        <ResizableDrawer
          anchor="right"
          open={createDrawerOpen}
          onClose={handleClose}
          PaperProps={{ className: "DrawerStyles" }}
        >
          <NewPaymentTerm
            handleClose={handleClose}
            handleRefresh={fetchData}
            existingTerms={paymentTermData}
          />
        </ResizableDrawer>

        <ResizableDrawer
          anchor="right"
          open={editDrawerOpen}
          onClose={handleClose}
          PaperProps={{ className: "DrawerStyles" }}
        >
          <EditPaymentTerm
            selectedTerm={selectedPaymentTerm}
            handleClose={handleClose}
            handleRefresh={fetchData}
          />
        </ResizableDrawer>

        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default PaymentTerms;
