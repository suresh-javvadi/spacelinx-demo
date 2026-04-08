import React, { useContext, useEffect, useState } from "react";
import { fetchEcoApprovalHistory } from "../../../services/ecoService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Popover from "@mui/material/Popover";
import { TextField } from "@mui/material";
import dayjs from "dayjs";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const ApprovalHistory = ({ selectedEcoId }) => {
  const { Alert } = useContext(AlertsContext);
  const [approvalHistoryData, setApprovalHistoryData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState("");

  useEffect(() => {
    fetchEcoApprovalHistoryData();
  }, [selectedEcoId]);

  const fetchEcoApprovalHistoryData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchEcoApprovalHistory(selectedEcoId);
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setApprovalHistoryData(sortedData);
    } catch (error) {
      Alert("Error fetching approval history data", "error");
      console.error("Error fetching approval history data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePopoverOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setPopoverContent(comment || "No comment available");
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverContent("");
  };
  const columns = [
    {
      field: "approverName",
      headerName: "Approver",
      flex: 0.7,
      valueGetter: (_value, row) =>
        row.approver
          ? `${row.approver.firstName} ${row.approver.lastName}`
          : "---",
    },
    {
      field: "approverEmail",
      headerName: "Email",
      flex: 1,
      valueGetter: (_value, row) => row.approver?.email || "---",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: ({ value }) => {
        const status = value || "Pending";

        let color = "";
        if (status === "Approved") color = "#22c55e";
        else if (status === "Rejected") color = "#ef4444";
        else color = "#f59e0b";

        return (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "6px",
              backgroundColor:
                status === "Approved"
                  ? "#d1fae5"
                  : status === "Rejected"
                  ? "#fee2e2"
                  : "#f3f4f6",
              color,
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      field: "actedAt",
      headerName: "Action Date",
      flex: 0.6,
      valueGetter: (_value, row) =>
        row.actedAt ? dayjs(row.actedAt).format("DD-MM-YYYY") : "---",
    },
    {
      field: "comment",
      headerName: "Comment",
      flex: 1,
      renderCell: ({ value }) => (
        <div
          style={{ cursor: "pointer" }}
          onClick={(event) => handlePopoverOpen(event, value)}
        >
          {value ? `${value.substring(0, 20)}...` : "---"}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="EcoHistoryDataGridDiv">
        <StyledDataGrid
          rows={approvalHistoryData}
          columns={columns}
          loading={loadingData}
          className="EcoHistoryDataGrid"
        />
      </div>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="EcoApprovalCommentsPopOver">
          <TextField
            label="Comments"
            multiline
            maxRows={8}
            minRows={4}
            fullWidth
            value={popoverContent}
          />
        </div>
      </Popover>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default ApprovalHistory;
