import React, { useState } from "react";
import { Button } from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { clearCache } from "../../services/clearCache";
import {
  showConfirmation,
  showAlert,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";

const ClearCacheButton = ({}) => {
  const [clearing, setClearing] = useState(false);

  const handleClearCache = async () => {
    try {
      const confirmed = await showConfirmation(
        "Clear Cache?",
        "Are you sure you want to clear the application cache?",
        "Yes, clear it!"
      );

      if (!confirmed) return;

      setClearing(true);

      const response = await clearCache();

      showAlert(
        "success",
        "Success",
        response?.message || "Cache cleared successfully!"
      );
    } catch (error) {
      console.error("Error clearing cache:", error);

      showAlert(
        "error",
        "Error",
        "Failed to clear cache. Please try again later."
      );
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="clearCacheBtnContainer">
      {" "}
      <Button
        startIcon={<CleaningServicesIcon />}
        onClick={handleClearCache}
        disabled={clearing}
      >
        {clearing ? "Clearing..." : "Clear Cache"}
      </Button>
    </div>
  );
};

export default ClearCacheButton;
