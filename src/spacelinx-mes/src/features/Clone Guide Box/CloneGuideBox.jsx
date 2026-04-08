import React, { useContext, useEffect, useState } from "react";
import "./CloneGuideBox.css";
import { Autocomplete, TextField } from "@mui/material";
import {
  cloneGuide,
  fetchGuideMBomWithGuideId,
  fetchPartsHavingGuide,
} from "../../services/guideService";
import { fetchParentPartsInDraftOrRelease } from "../../services/partService";
import { AlertsContext } from "../AlertsContext/Context";

const CloneGuideBox = ({
  isOpen,
  setIsCloneGuidePartBox,
  setLoadingData,
  presentGuideId,
  onClose,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [availableParentParts, setAvailableParentParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [partErrorMessage, setPartErrorMessage] = useState("");
  const [guideMbomData, setGuideMbomData] = useState([]);
  const [partsLoading, setPartsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchParts();
      fetchGuideMbomData();
    } else {
      setSelectedPart(null);
      setPartErrorMessage("");
    }
  }, [isOpen]);

  const fetchGuideMbomData = async () => {
    try {
      const data = await fetchGuideMBomWithGuideId(presentGuideId);
      setGuideMbomData(data);
    } catch (error) {
      console.error("Error fetching guide mbom data:", error);
      Alert("Error fetching guide mbom data.", "error");
    }
  };

  const fetchParts = async () => {
    setPartsLoading(true);
    try {
      const allParts = await fetchParentPartsInDraftOrRelease();
      const partsHavingGuide = await fetchPartsHavingGuide();
      if (allParts && partsHavingGuide) {
        const updatedPartsData = allParts.map((part) => {
          const guideInfo = partsHavingGuide.find(
            (item) => item.partId === part.id
          );
          return {
            ...part,
            guide: guideInfo ? guideInfo : null,
          };
        });
        setAvailableParentParts(updatedPartsData);
      } else {
        Alert("Failed to fetch parts data.", "error");
      }
    } catch (error) {
      console.error("Error fetching parts:", error);
      Alert("Error fetching parts data.", "error");
    } finally {
      setPartsLoading(false);
    }
  };

  const confirmCloneGuide = async () => {
    if (!selectedPart) {
      setPartErrorMessage("Please select a valid part.");
      return;
    }

    setLoadingData(true);
    try {
      const data = await cloneGuide(presentGuideId, selectedPart.id);
      Alert(
        `Successfully cloned this guide into ${data.newGuideNumber}`,
        "success"
      );
      setIsCloneGuidePartBox(false);
    } catch (error) {
      console.error("Error cloning guide:", error);
      Alert("Failed to clone guide. Please try again.", "error");
    } finally {
      setLoadingData(false);
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
            fullWidth
            disablePortal
            value={selectedPart}
            onChange={async (_, newValue) => {
              if (newValue) {
                let errorMessage = "";
                const isPartInMbomData = guideMbomData.some(
                  (item) => item.ebomPartId === newValue.id
                );
                if (isPartInMbomData) {
                  errorMessage =
                    "Couldn't clone with this part as it is a child part of the guide.";
                  Alert(errorMessage, "error");
                }
                if (errorMessage) {
                  setPartErrorMessage(errorMessage);
                  setSelectedPart(null);
                } else {
                  setSelectedPart(newValue);
                  setPartErrorMessage("");
                }
              } else {
                setSelectedPart(null);
                setPartErrorMessage("");
              }
            }}
            options={availableParentParts}
            getOptionLabel={(option) =>
              `${option.partNumber} - ${option.name}${
                option.guide
                  ? ` (Guide: ${option.guide.name} - ${option.guide.number})`
                  : ""
              }`
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionDisabled={(option) => option.guide !== null}
            loading={partsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Part"
                variant="outlined"
                error={Boolean(partErrorMessage)}
                helperText={partErrorMessage || ""}
              />
            )}
          />
        </div>
        <div className="confirmationBoxBtns">
          <button onClick={onClose} className="CancelBtn">
            Cancel
          </button>
          <button
            onClick={confirmCloneGuide}
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

export default CloneGuideBox;
