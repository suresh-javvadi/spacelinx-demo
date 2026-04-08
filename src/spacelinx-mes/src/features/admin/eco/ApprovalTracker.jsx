import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const EcoApprovalTracker = ({ approvers = [] }) => {
  return (
    <div
      className={
        approvers.length === 0
          ? "eco-no-tracker-container"
          : "eco-tracker-container"
      }
    >
      {approvers.length === 0 ? (
        <div className="eco-no-approvers-container">
          <AccessTimeIcon style={{ fontSize: 48, color: "#94a3b8" }} />
          <p>No approvers assigned yet</p>
        </div>
      ) : (
        <div className="eco-approver-list">
          {approvers.map((approver) => (
            <div key={approver.id} className="eco-approver-card">
              <div className="eco-icon-wrapper">
                {approver.status === "Approved" ? (
                  <CheckCircleIcon className="eco-icon approved" />
                ) : approver.status === "Rejected" ? (
                  <CancelIcon className="eco-icon rejected" />
                ) : (
                  <AccessTimeIcon className="eco-icon pending" />
                )}
              </div>

              <div className="eco-approver-details">
                <p className="eco-approver-name">
                  {approver?.fullName ||
                    `${approver?.firstName || ""} ${
                      approver?.lastName || ""
                    }`.trim() ||
                    "N/A"}
                </p>
                <p className="eco-approver-email">{approver.email || "N/A"}</p>
                <p
                  className={`eco-approver-status ${approver.status?.toLowerCase()}`}
                >
                  {approver.status || "Pending"}
                </p>
                {approver.statusDate && (
                  <p className="eco-status-date">
                    {new Date(approver.statusDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EcoApprovalTracker;
