import React from "react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ClipLoader } from "react-spinners";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import "../../admin/eco/eco.css";

const RequisitionApprovalTracker = ({ approvers = [], loadingData }) => {
  const approversByStage = approvers.reduce((acc, item) => {
    const stage = item.stageNumber || 0;
    acc[stage] = acc[stage] || [];
    acc[stage].push(item);
    return acc;
  }, {});

  const stageNumbers = Object.keys(approversByStage)
    .map(Number)
    .sort((a, b) => a - b);

  if (loadingData) {
    return (
      <div className="po-approvals__loader">
        <ClipLoader size={30} color="#009cbb" loading={true} />
      </div>
    );
  }

  return (
    <Accordion>
      <AccordionSummary
        className="tracker-accordion1"
        expandIcon={<ExpandMoreIcon />}
      >
        <h3 className="tracker-title">Approval Tracker</h3>
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
          <div className="tracker-cards-wrapper">
            {stageNumbers.map((stage) =>
              approversByStage[stage].map((approver) => (
                <div key={approver.id} className="tracker-card">
                  <div className="tracker-card-top">
                    <span className="tracker-stage">STAGE {stage}</span>

                    <span
                      className={`tracker-status ${approver.status?.toLowerCase()}`}
                    >
                      {approver.status || "Pending"}
                    </span>
                  </div>

                  <div className="tracker-date">
                    {approver.actedAt
                      ? new Date(approver.actedAt).toLocaleDateString()
                      : "--"}
                  </div>

                  <div className="tracker-user">
                    <p className="tracker-name">
                      {`${approver?.approver?.firstName || ""} ${approver?.approver?.lastName || ""}`}
                    </p>
                    <p className="tracker-email">{approver?.approver?.email}</p>
                  </div>
                </div>
              )),
            )}
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default RequisitionApprovalTracker;
