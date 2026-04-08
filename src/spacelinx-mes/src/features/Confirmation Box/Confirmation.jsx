import React from "react";
import "./Confirmation.css";
import { TextField } from "@mui/material";

const ConfirmationBox = ({
  isOpen,
  onClose,
  onConfirm,
  completeWorkOrderStep,
  setStepComments,
  stepComments,
}) => {
  if (!isOpen) return null;
  const handleClose = () => {
    onClose();
    setStepComments("");
  };
  const handleConfirm = () => {
    onConfirm();
    setStepComments("");
  };
  return (
    <div className="confirmation-box-overlay">
      <div className="confirmation-box">
        {completeWorkOrderStep ? null : (
          <ion-icon name="alert-circle-outline"></ion-icon>
        )}
        <div className="confirmationBoxTexts">
          <h2>{completeWorkOrderStep ? "Comments" : "Are you sure?"}</h2>
          {completeWorkOrderStep ? (
            <TextField
              placeholder="[Optional]"
              multiline
              fullWidth
              rows={4}
              className="CommentsSection"
              value={stepComments}
              onChange={(e) => {
                setStepComments(e.target.value);
              }}
              InputProps={{
                style: {
                  fontSize: "13px",
                },
              }}
            />
          ) : (
            <p>You won't be able to revert this</p>
          )}
        </div>
        <div className="confirmationBoxBtns">
          <button onClick={handleClose} className="CancelBtn">
            Cancel
          </button>
          <button onClick={handleConfirm} className="Confirm">
            {completeWorkOrderStep ? "Complete" : "Yes, delete it!"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationBox;
