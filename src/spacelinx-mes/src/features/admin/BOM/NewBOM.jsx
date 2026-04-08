import React, { useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import {
  fetchDraftMakePartsWithOutEBOM,
  fetchMakePartsWithOutEBOM,
} from "../../../services/partService";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { Autocomplete, TextField, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { createBom } from "../../../services/childPartService";
import { Link } from "react-router-dom";

const NewBOM = ({ handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [draftPartsWithoutEBOM, setDraftPartsWithoutEBOM] = useState([]);
  const [partsWithoutEBOM, setPartsWithoutEBOM] = useState([]);
  const [selectedParentPart, setSelectedParentPart] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [quantityError, setQuantityError] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const handleCreate = async () => {
    if (!validateCreateFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);
    try {
      const payload = selectedParts.map((part) => ({
        partId: part.id,
        quantity: part.quantity,
      }));
      await createBom(selectedParentPart?.id, payload);
      handleRefresh();
      handleCloseClick();
      Alert("BOM created successfully!", "success");
      setSelectedParts([]);
    } catch (error) {
      Alert("Couldn't create BOM...!", "error");
      console.error("Error creating BOM:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPartsData();
  }, []);

  const fetchPartsData = async () => {
    setLoadingData(true);
    try {
      const [makeParts, draftParts] = await Promise.all([
        fetchMakePartsWithOutEBOM(),
        fetchDraftMakePartsWithOutEBOM(),
      ]);

      setPartsWithoutEBOM(
        makeParts.filter((part) => part.status !== "Obsolete")
      );
      setDraftPartsWithoutEBOM(draftParts);
    } catch (error) {
      Alert("Couldn't fetch part data...!", "error");
      console.error("Error fetching part data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAutocompleteChange = (name, value) => {
    if (name === "selectedParentPart") {
      setSelectedParentPart(value);
      setSelectedParts([]);
    } else if (name === "selectedPart") {
      setSelectedPart(value);
    }
    const requiredFields = {
      selectedParentPart: "Please select a part.",
      selectedParts: "Please add a part as BOM.",
    };

    setErrors({
      ...errors,
      [name]: !value ? requiredFields[name] : "",
    });
  };

  const handleAttach = () => {
    if (selectedPart && selectedQuantity) {
      setSelectedParts((prevParts) => {
        const existingPartIndex = prevParts.findIndex(
          (part) => part.id === selectedPart.id
        );

        if (existingPartIndex !== -1) {
          const updatedParts = [...prevParts];
          updatedParts[existingPartIndex].quantity = parseInt(
            selectedQuantity,
            10
          );
          return updatedParts;
        } else {
          return [
            ...prevParts,
            { ...selectedPart, quantity: parseInt(selectedQuantity, 10) },
          ];
        }
      });

      setSelectedPart(null);
      setSelectedQuantity(1);
    } else {
      Alert("Please select a part...!", "warning");
    }
  };

  const validateCreateFields = () => {
    let valid = true;
    const errors = { selectedParentPart: "", selectedParts: [] };
    if (!selectedParentPart) {
      errors.selectedParentPart = "Please select a part.";
      valid = false;
    }
    if (selectedParts.length === 0) {
      errors.selectedParts = "Please add at least one part as BOM.";
      valid = false;
    }
    setErrors(errors);
    return valid;
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Number",
      headerClassName: "DataGridColumn",
      flex: 0.5,
    },
    {
      field: "name",
      headerName: "Name",
      headerClassName: "DataGridColumn",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      headerClassName: "DataGridColumn",
      flex: 0.3,
    },
    {
      field: "partType",
      headerName: "Type",
      headerClassName: "DataGridColumn",
      flex: 0.5,
      valueGetter: (params) =>
        params.row.partType ? params.row.partType.name : "",
    },
    {
      field: "makeBuy",
      headerName: "Make/Buy",
      renderCell: (params) =>
        params.value != null ? (params.value ? "Buy" : "Make") : "",
      flex: 0.3,
      headerClassName: "DataGridColumn",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 0.3,
      headerClassName: "DataGridColumn",
      renderCell: (params) => (
        <Link className="AppHyperLink">{params.row.quantity}</Link>
      ),
    },
    {
      field: " ",
      width: 50,
      headerClassName: "DataGridColumn",
      renderCell: (params) => {
        const handleDelete = async () => {
          const isConfirmed = await showConfirmation(
            "Are you sure?",
            "You won't be able to undo this action!"
          );

          if (isConfirmed) {
            try {
              setSelectedParts((prevParts) =>
                prevParts.filter((part) => part.id !== params.row.id)
              );
              showAlert("success", "Deleted!", "Part removed from selection.");
            } catch (error) {
              showAlert("error", "Error!", "Failed to delete part. Try again.");
              console.error("Delete error:", error);
            }
          }
        };

        return (
          <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
        );
      },
    },
  ];

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create BOM</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <Autocomplete
              options={draftPartsWithoutEBOM}
              getOptionLabel={(option) =>
                `${option.partNumber} - ${option.name}`
              }
              onChange={(e, value) =>
                handleAutocompleteChange("selectedParentPart", value)
              }
              className="AdminTextFields"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Part"
                  error={!!errors?.selectedParentPart}
                  helperText={errors?.selectedParentPart}
                  required
                />
              )}
            />
            <div className="NewBOMContainer">
              <Autocomplete
                options={partsWithoutEBOM.filter(
                  (part) =>
                    part.id !== selectedParentPart?.id &&
                    !selectedParts.some((p) => p.id === part.id)
                )}
                getOptionLabel={(option) =>
                  `${option.partNumber} - ${option.name}`
                }
                value={selectedPart}
                onChange={(e, value) =>
                  handleAutocompleteChange("selectedPart", value)
                }
                disabled={!selectedParentPart}
                className="NewBOMAutocomplete"
                onMouseEnter={(e) => {
                  if (!selectedParentPart) {
                    e.preventDefault();
                    Alert("Please select a parent part first!", "warning");
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Part"
                    error={!!errors?.selectedParts}
                    helperText={errors?.selectedParts}
                    required
                  />
                )}
              />
              <TextField
                label="Quantity"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
              />
              <Button onClick={handleAttach}>ADD</Button>
            </div>

            <div className="EcoDataGrid">
              <DataGrid
                rows={selectedParts}
                columns={columns}
                onCellClick={(params) => {
                  if (params.field === "quantity") {
                    setSelectedPart(params.row);
                    setSelectedQuantity(params.row.quantity);
                  }
                }}
              />
            </div>
          </div>
          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loadingData}>
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

export default NewBOM;
