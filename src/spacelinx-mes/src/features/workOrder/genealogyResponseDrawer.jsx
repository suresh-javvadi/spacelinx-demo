import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Button } from "@mui/material";

const GenealogyResponseDrawer = ({
  genealogyCount,
  setGenealogyDrawerOpen,
  taskData,
  childKitGenealogyData,
  handleSelectionChange,
  getFilteredOptions,
  selectedTaskData,
}) => {
  const [presentTaskData, setPresentTaskData] = useState(null);
  useEffect(() => {
    const filterTaskData = taskData.find(
      (item) => item.id === selectedTaskData.id
    );
    setPresentTaskData(filterTaskData);
  }, [selectedTaskData, taskData]);

  // Inside GenealogyResponseDrawer
  const generateAutocompletes = () => {
    const autocompletes = [];
    for (let i = 1; i <= genealogyCount; i++) {
      autocompletes.push(
        <Autocomplete
          key={i}
          options={getFilteredOptions(
            childKitGenealogyData.filter(
              (option) =>
                option.partId ===
                  selectedTaskData.taskdetails?.genealogy?.genealogy?.id &&
                option.status === "Unconsumed"
            ) || [],
            selectedTaskData.id
          )}
          getOptionLabel={(option) => option.serialno}
          value={presentTaskData?.taskdetails?.genealogy?.value[i] || null}
          onChange={(event, newValue) =>
            handleSelectionChange(selectedTaskData.id, i, newValue)
          }
          disabled={selectedTaskData.status === "Completed"}
          renderInput={(params) => (
            <TextField {...params} label={`Genealogy ${i + 1}`} />
          )}
        />
      );
    }
    return autocompletes;
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Add Serial Number</h2>
        <button onClick={() => setGenealogyDrawerOpen(false)}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      <div className="CreateFlyoutBody">{generateAutocompletes()}</div>
      <div className="CreateFlyoutFooter">
        <Button
          variant="outlined"
          onClick={() => setGenealogyDrawerOpen(false)}
          className="CreateButton"
          disabled={selectedTaskData.status === "Completed"}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default GenealogyResponseDrawer;
