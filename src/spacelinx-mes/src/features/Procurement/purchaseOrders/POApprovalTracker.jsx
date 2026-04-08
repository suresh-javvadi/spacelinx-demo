import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ClipLoader } from "react-spinners";
import "../procurement.css";
import "../../admin/eco/eco.css";

const POApprovalTracker = ({ approvers = [], loadingData }) => {
  const approversByStage = approvers.reduce((acc, item) => {
    const stage = item.stageNumber || 0;

    if (!acc[stage]) {
      acc[stage] = [];
    }

    acc[stage].push(item);
    return acc;
  }, {});

  const stageNumbers = Object.keys(approversByStage)
    .map(Number)
    .sort((a, b) => a - b);

  if (loadingData) {
    return (
      <div className="po-approvals__loader">
        <ClipLoader size={30} color="#009cbb" loading />
      </div>
    );
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <h3 className="po-tracker-acc-header">Approval Tracker</h3>
      </AccordionSummary>

      <AccordionDetails>
        {approvers.length === 0 ? (
          <div className="eco-no-tracker-container">
            <div className="eco-no-approvers-container">
              <AccessTimeIcon style={{ fontSize: 48, color: "#94a3b8" }} />
              <p>No approvers assigned yet</p>
            </div>
          </div>
        ) : (
          <div className="po-tracker-container">
            {stageNumbers.map((stage, index) => (
              <div key={stage} className="po-stage-wrapper">
                <div className="po-stage-section">
                  <div className="po-stage-header">
                    <p className="po-stage-title">{`Stage ${stage}`}</p>
                  </div>

                  <div className="eco-approver-list">
                    {approversByStage[stage].map((approver) => (
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
                            {`${approver?.approver?.firstName || ""} ${
                              approver?.approver?.lastName || ""
                            }`.trim() || "N/A"}
                          </p>

                          <p className="eco-approver-email">
                            {approver?.approver?.email || "N/A"}
                          </p>

                          <p
                            className={`eco-approver-status ${approver.status?.toLowerCase()}`}
                          >
                            {approver.status || "Pending"}
                          </p>

                          {approver.actedAt && (
                            <p className="eco-status-date">
                              {new Date(approver.actedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {index !== stageNumbers.length - 1 && (
                  <div className="po-stage-connector">
                    <span className="po-stage-dot" />
                    <span className="po-stage-line" />
                    <span className="po-stage-dot" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default POApprovalTracker;
