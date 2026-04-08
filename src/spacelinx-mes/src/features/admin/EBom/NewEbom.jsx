import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import {
  fetchEbomWithPartId,
  fetchPartsLookUp,
} from "../../../services/partService";
import { createNewEBom } from "../../../services/childPartService";
import ".././admin.css";
import Cliploader from "../../../Components/Loaders/Cliploader";

const NewEbom = ({ handleCloseClick, handleRefresh, setMainEBomLoading }) => {
  const [parentPart, setParentPart] = useState(null);
  const [childPart, setChildPart] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [availableParentParts, setAvailableParentParts] = useState([]);
  const [availableChildParts, setAvailableChildParts] = useState([]);
  const [parentPartError, setParentPartError] = useState("");
  const [childPartError, setChildPartError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const { Alert } = useContext(AlertsContext);
  const filter = createFilterOptions();
  const [newEbomLoadingData, setNewEbomLoadingData] = useState(true);

  const handleCreate = async () => {
    if (!parentPart || !childPart || !quantity || quantity <= 0) {
      setParentPartError(parentPart ? "" : "Parent Part is required");
      setChildPartError(childPart ? "" : "Child Part is required");
      setQuantityError(
        quantity ? "Quantity must be greater than 0" : "Quantity is required"
      );
      return;
    }
    setMainEBomLoading(true);
    const ChildParts = {
      partId: parentPart.id,
      childPartId: childPart.id,
      quantity: Number(quantity),
    };
    setNewEbomLoadingData(true);
    try {
      await createNewEBom(ChildParts);
      setQuantity("");
      setParentPart(null);
      setChildPart(null);
      handleRefresh();
      handleCloseClick();
      Alert("EBOM Created Successfully!", "success");
    } catch (error) {
      console.log(error);
      Alert("Couldn't Create EBOM...", "error");
    } finally {
      setMainEBomLoading(false);
      setNewEbomLoadingData(false);
    }
  };

  useEffect(() => {
    async function fetchAvailableParts() {
      setNewEbomLoadingData(true);
      try {
        const allParts = await fetchPartsLookUp();
        allParts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setAvailableParentParts(allParts);
        setNewEbomLoadingData(false);
      } catch (error) {
        console.log(error);
        Alert("Error fetching available parts data", "error");
        setNewEbomLoadingData(false);
      } finally {
        setNewEbomLoadingData(false);
      }
    }
    fetchAvailableParts();
  }, [Alert]);

  useEffect(() => {
    if (parentPart) {
      filterChildParts();
    } else {
      setAvailableChildParts([]);
    }
  }, [parentPart]);

  const filterChildParts = async () => {
    setNewEbomLoadingData(true);
    try {
      const data = await fetchEbomWithPartId(parentPart.id);
      const existingChildPartIds = data.map((item) => item.childPartId);
      if (existingChildPartIds?.length > 0) {
        const filteredParts = availableParentParts.filter(
          (item) =>
            !existingChildPartIds.includes(item.id) && parentPart.id !== item.id
        );
        setAvailableChildParts(filteredParts);
      } else {
        setAvailableChildParts(
          availableParentParts.filter((item) => item.id !== parentPart.id)
        );
      }
    } catch (error) {
      console.log(error);
      Alert("Error fetching child parts", "error");
    } finally {
      setNewEbomLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>Create EBOM</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {newEbomLoadingData ? (
        <div className="loader-container">
          <Cliploader loading={newEbomLoadingData} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>
            <Autocomplete
              value={parentPart}
              onChange={(event, newValue) => {
                setParentPart(newValue);
                setParentPartError("");
              }}
              filterOptions={(options, params) => filter(options, params)}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="parent-child-autocomplete"
              options={availableParentParts}
              getOptionLabel={(option) => `${option.number} - ${option.name}`}
              renderOption={(props, option) => (
                <MenuItem {...props} key={option.id}>
                  {`${option.number} - ${option.name}`}
                </MenuItem>
              )}
              className="AdminTextFields"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Parent Part"
                  error={!!parentPartError}
                  helperText={parentPartError}
                  required
                />
              )}
            />
            <Autocomplete
              value={childPart}
              disabled={!parentPart}
              onChange={(event, newValue) => {
                setChildPart(newValue);
                setChildPartError("");
              }}
              filterOptions={(options, params) => filter(options, params)}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="child-part-autocomplete"
              options={availableChildParts}
              getOptionLabel={(option) => `${option.number} - ${option.name}`}
              renderOption={(props, option) => (
                <MenuItem {...props} key={option.id}>
                  {`${option.number} - ${option.name}`}
                </MenuItem>
              )}
              className="AdminTextFields"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Child Part"
                  error={!!childPartError}
                  helperText={childPartError}
                  required
                />
              )}
            />
            <TextField
              label="Quantity"
              className="AdminTextFields"
              type="number"
              onChange={(e) => {
                setQuantity(e.target.value);
                setQuantityError("");
              }}
              error={!!quantityError}
              helperText={quantityError}
              value={quantity}
              required
            />
          </div>

          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={newEbomLoadingData}>
              Create
            </Button>
          </div>
        </>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewEbom;
