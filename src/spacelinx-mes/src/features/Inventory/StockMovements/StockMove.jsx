import React, { useEffect, useState, useContext } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import PartInventory from "../../admin/parts/PartInventory";
import { fetchUniqueParts } from "../../../services/partService";

const StockMove = ({ handleCloseClick }) => {
  const [partList, setPartList] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [loadingParts, setLoadingParts] = useState(true);
  const { Alert } = useContext(AlertsContext);
  const [inventoryError, setInventoryError] = useState(null);

  useEffect(() => {
    const loadParts = async () => {
      setLoadingParts(true);
      try {
        const data = await fetchUniqueParts();

        if (!Array.isArray(data)) throw new Error("Invalid parts response");
        const transformed = data.map((item) => ({
          id: item.partId ?? item.id,
          label: `${item.partNumber} - ${item.name}`,
        }));
        setPartList(transformed);
      } catch (error) {
        console.error("Error loading parts:", error);
        Alert("Failed to load part list", "error");
      } finally {
        setLoadingParts(false);
      }
    };

    loadParts();
  }, []);
  const handleInventoryFetchError = (error) => {
    if (error?.response?.status === 404) {
      Alert("No inventory found for selected part.", "error");
      setInventoryError("No inventory found for this part.");
    } else {
      Alert("Failed to fetch inventory data.", "error");
      setInventoryError("Failed to load inventory data.");
    }
  };
  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Stock Move</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      <div className="CreateFlyoutBody">
        <Autocomplete
          options={partList}
          getOptionLabel={(option) => option.label}
          onChange={(e, newVal) => {
            setSelectedPart(newVal);
            setInventoryError(null);
          }}
          sx={{
            width: "100%",
          }}
          renderInput={(params) => (
            <TextField {...params} label="Select Part" fullWidth />
          )}
          loading={loadingParts}
        />
        {inventoryError && (
          <strong className="NoInventory">{inventoryError}</strong>
        )}

        {selectedPart ? (
          <PartInventory
            selectedPartId={selectedPart?.id}
            saveButtonPosition="top"
            onInventoryFetchError={handleInventoryFetchError}
          />
        ) : (
          <div className="StockAdjustmentEmptyState">
            <h3>Ready to Adjust Inventory</h3>
            <p>
              Search and select a part above to view current stock levels and
              make quantity adjustments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockMove;
