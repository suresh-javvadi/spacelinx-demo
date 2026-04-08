import React, { useContext, useEffect, useState } from "react";
import "../../Clone Guide Box/CloneGuideBox.css";
import { Autocomplete, TextField } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { fetchDraftPartsWithOutParent } from "../../../services/partService";
import { cloneBOM } from "../../../services/childPartService";
import { fetchChildParts } from "../../../services/childPartService";

const CloneBOM = ({ isOpen, onClose, selectedPart }) => {
  const { Alert } = useContext(AlertsContext);
  const [availableDraftParts, setAvailableDraftParts] = useState([]);
  const [newSelectedPart, setNewSelectedPart] = useState(null);
  const [partErrorMessage, setPartErrorMessage] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchParts();
    } else {
      setNewSelectedPart(null);
      setPartErrorMessage("");
    }
  }, [isOpen]);

  const fetchParts = async () => {
    try {
      setLoadingData(true);

      const [draftPartsData, childPartsData] = await Promise.all([
        fetchDraftPartsWithOutParent(),
        fetchChildParts(selectedPart?.part?.id),
      ]);

      if (draftPartsData && childPartsData) {
        const updatedPartsData = draftPartsData
          .filter((part) => part.id !== selectedPart?.part?.id)
          .map((part) => {
            const childPartInfo = childPartsData.find(
              (item) => item.childPartId === part.id
            );
            return {
              ...part,
              childPart: childPartInfo || null,
            };
          });

        setAvailableDraftParts(updatedPartsData);
      } else {
        setAvailableDraftParts([]);
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
      Alert("Failed to fetch parts. Please try again.", "error");
      setAvailableDraftParts([]);
    } finally {
      setLoadingData(false);
    }
  };

  const confirmCloneBOM = async () => {
    if (!newSelectedPart) {
      setPartErrorMessage("Please select a valid part.");
      return;
    }

    try {
      const data = await cloneBOM(selectedPart?.part?.id, newSelectedPart.id);
      Alert(
        `Successfully cloned this BOM ${newSelectedPart.partNumber} `,
        "success"
      );
      onClose();
    } catch (error) {
      console.error("Error cloning BOM:", error);
      Alert("Failed to clone BOM. Please try again.", "error");
    } finally {
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="confirmation-box-overlay"
      onClick={(e) => {
        if (e.target.classList.contains("confirmation-box-overlay")) {
          onClose();
        }
      }}
    >
      <div className="confirmation-box">
        <p className="ChoosePart">Choose a Part</p>
        <div className="partDivv">
          <Autocomplete
            loading={loadingData}
            loadingText="Loading parts..."
            value={newSelectedPart}
            options={availableDraftParts}
            getOptionLabel={(option) =>
              `${option.partNumber} - ${option.name}${
                option.childPart ? " (Child part of selected part)" : ""
              }`
            }
            getOptionDisabled={(option) => option.childPart !== null}
            onChange={(event, newValue) => {
              setNewSelectedPart(newValue);
              setPartErrorMessage("");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select a part"
                error={Boolean(partErrorMessage)}
                helperText={partErrorMessage}
              />
            )}
            fullWidth
          />
        </div>
        <div className="confirmationBoxBtns">
          <button onClick={onClose} className="CancelBtn">
            Cancel
          </button>
          <button
            onClick={confirmCloneBOM}
            disabled={Boolean(partErrorMessage)}
            className="Confirm"
          >
            Clone
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloneBOM;
