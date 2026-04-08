import React, { useContext, useEffect, useState } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createEcoWithParts } from "../../../services/ecoService";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { TextField, Button, Autocomplete, Popover } from "@mui/material";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";

const NewEco = ({
  handleCloseClick,
  handleRefresh,
  selectedPart,
  changeTypes,
  userData,
  loadingChangeTypes,
  loadingUsersData,
  handleOpenEditDrawer,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    reasonForChange: "",
    description: "",
    changeType: changeTypes[1],
    impactAnalysis: "",
    priority: "Low",
    ecoParts: [],
    approvers: [],
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    reasonForChange: "",
    ecoParts: "",
  });
  const [ecoPriorities, setEcoPriorities] = useState(["Low", "Medium", "High"]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [activeTab, setActiveTab] = useState("CreateECO");
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [tempDescription, setTempDescription] = useState("");
  const [statusErrors, setStatusErrors] = React.useState({});

  const handleOpenPopover = (event, params) => {
    setAnchorEl(event.currentTarget);
    setCurrentRowId(params.id);
    setTempDescription(params.value || "");
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setCurrentRowId(null);
  };

  const handleSaveDescription = () => {
    setSelectedParts((prevParts) =>
      prevParts.map((part) =>
        part.id === currentRowId
          ? { ...part, description: tempDescription }
          : part,
      ),
    );
    handleClosePopover();
  };

  useEffect(() => {
    if (selectedPart && selectedPart.length > 0) {
      const processed = processSelectedParts(selectedPart, selectedParts);
      setSelectedParts(processed);
    }
  }, [selectedPart]);

  const isInitialRelease =
    formValues.changeType?.name?.toLowerCase() === "initial release";

  const validateCreateEcoFields = () => {
    let valid = true;
    const errors = {
      name: "",
      reasonForChange: "",
      ecoParts: "",
    };

    if (!formValues.name) {
      errors.name = "Eco Name is required";
      valid = false;
    } else if (!formValues.name.length > 250) {
      errors.name = "Eco Name must be at most 250 characters long";
      valid = false;
    }

    if (!isInitialRelease) {
      if (!formValues.reasonForChange) {
        errors.reasonForChange = "Reason For Change is required";
        valid = false;
      } else if (!formValues.reasonForChange.length > 250) {
        errors.reasonForChange =
          "Reason For Change must be at most 250 characters long";
        valid = false;
      }
    }
    if (!formValues.changeType) {
      errors.changeType = "Change Type is required";
      valid = false;
    }

    if (!formValues.priority) {
      errors.priority = "Priority is required";
      valid = false;
    }

    if (!isInitialRelease && !formValues.impactAnalysis) {
      errors.impactAnalysis = "Impact Analysis is required";
      valid = false;
    }
    setFormErrors(errors);
    return valid;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const isChangingToInitialRelease =
      name === "changeType" && value?.name?.toLowerCase() === "initial release";
    setFormValues({
      ...formValues,
      [name]: value,
      ...(isChangingToInitialRelease
        ? { reasonForChange: "", impactAnalysis: "" }
        : {}),
    });
    const requiredFields = {
      name: "Eco Name",
      reasonForChange: "Reason For Change",
      changeType: "Change Type",
      impactAnalysis: "Impact Analysis",
    };
    setFormErrors({
      ...formErrors,
      [name]:
        value === "" || value === null || value === undefined
          ? `${requiredFields[name]} is required`
          : "",
    });
  };

  const handleAutocompleteChange = (name, newValue) => {
    setFormValues({ ...formValues, [name]: newValue });
  };

  const getNextVersion = (version) => {
    const lastChar = version.slice(-1);
    if (isNaN(lastChar)) {
      return (
        version.slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0) + 1)
      );
    }
    return version + "A";
  };

  const handleStatusChange = (event, rowId) => {
    const value = event.target.value;

    setStatusErrors((prev) => {
      const updatedErrors = { ...prev };
      if (value) delete updatedErrors[rowId];
      return updatedErrors;
    });

    setSelectedParts((prevParts) =>
      prevParts.map((part) =>
        part.id === rowId ? { ...part, newStatus: value } : part,
      ),
    );
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Number",
      flex: 0.7,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
    },
    {
      field: "version",
      headerName: "Current Revision",
      flex: 0.7,
      valueGetter: (value, row) => {
        const { status, version } = row;
        return status === "Draft" && version === "A" ? "---" : version || "";
      },
    },
    {
      field: "NextVersion",
      headerName: "Revision",
      flex: 0.7,
      valueGetter: (value, row) => {
        const { status, version, newStatus } = row;

        if (
          (status === "Draft" && newStatus === "Release") ||
          newStatus === "Obsolete"
        ) {
          return version || "---";
        }

        if (status === "Release" && newStatus === "Release" && version) {
          return getNextVersion(version);
        } else if (status === "Release" && newStatus === "Obsolete") {
          return version;
        }

        return "---";
      },
    },
    {
      field: "status",
      headerName: "Current Status",
      flex: 0.5,
    },
    {
      field: "newStatus",
      headerName: "Status",
      flex: 0.8,
    },
    {
      field: "description",
      headerName: "Remarks",
      flex: 0.7,
      editable: true,
      renderCell: (params) => (
        <div onClick={(event) => handleOpenPopover(event, params)}>
          {params.value || "Click to edit"}
        </div>
      ),
    },
    {
      field: "actions",
      width: 50,
      renderCell: (params) => {
        const handleDelete = async () => {
          const isConfirmed = await showConfirmation(
            "Are you sure?",
            "You won't be able to undo this action!",
          );

          if (isConfirmed) {
            try {
              setSelectedParts((prevParts) =>
                prevParts.filter((part) => part.id !== params.row.id),
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

  const initialGridState = {
    columns: {
      columnVisibilityModel: {
        version: false,
        status: false,
      },
    },
  };
  const handleSubmit = async (e) => {
    const errors = {};

    // Validate required fields
    if (!validateCreateEcoFields()) {
      errors.form = "Please Fill All the Required Fields";
    }

    // Validate selected parts
    const partErrors = selectedParts.reduce((acc, part) => {
      if (!part.newStatus) acc[part.id] = true;
      return acc;
    }, {});

    if (Object.keys(partErrors).length > 0) {
      errors.parts = partErrors;
    }

    // If there are any errors, show alerts and update the state
    if (Object.keys(errors).length > 0) {
      if (errors.form) Alert(errors.form, "error");
      if (errors.parts) Alert("Each part must have a status selected", "error");
      setStatusErrors(errors.parts || {});
      return;
    }

    // Clear errors if all validations pass
    setStatusErrors({});

    const payload = {
      name: formValues.name,
      reasonForChange: formValues.reasonForChange,
      description: formValues.description,
      changeType: formValues.changeType?.name,
      impactAnalysis: formValues.impactAnalysis,
      priority: formValues.priority,
      approvals: formValues.approvers
        ? formValues.approvers.map((approver) => ({
            approverId: approver.id,
            stageNumber: 1,
          }))
        : [],
      ecoParts: selectedParts.map((part) => ({
        partId: part.id,
        status: part.newStatus,
        description: part.description || "",
      })),
    };

    try {
      setLoadingData(true);
      await createEcoWithParts(payload);
      setSelectedParts([]);
      Alert("ECO created successfully", "success");
      handleCloseClick();
      handleRefresh();
      handleOpenEditDrawer();
    } catch (error) {
      Alert("Failed to create ECO", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleNextClick = () => {
    if (validateCreateEcoFields()) {
      setActiveTab("effectedparts");
    } else {
      Alert("Please Fill All the Required Fields", "error");
    }
  };

  const processSelectedParts = (parts, prevParts) => {
    const newSelectedParts = [...parts];
    const partIds = new Set();
    const uniqueSelectedParts = [];

    for (const part of newSelectedParts) {
      if (!partIds.has(part.id)) {
        partIds.add(part.id);
        uniqueSelectedParts.push(part);
      } else {
        // If part is already selected, remove it
        const index = uniqueSelectedParts.findIndex((p) => p.id === part.id);
        if (index !== -1) {
          uniqueSelectedParts.splice(index, 1);
        }
      }
    }

    const prevPartsMap = new Map(
      (prevParts || []).map((part) => [part.id, part]),
    );

    return uniqueSelectedParts.map((part) => {
      const prevPart = prevPartsMap.get(part.id);
      const currentStatus = part.status?.toLowerCase();

      let newStatus = "";
      if (currentStatus === "draft") {
        newStatus = "Release";
      } else if (currentStatus === "release") {
        newStatus = "Obsolete";
      } else {
        newStatus = prevPart?.newStatus || "";
      }

      return {
        ...part,
        description: prevPart?.description || "",
        newStatus,
      };
    });
  };

  const handleAutocompleteChangeParts = (e, value) => {
    const processed = processSelectedParts(value, selectedParts);
    setSelectedParts(processed);
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create ECO</h2>
        <button onClick={handleCloseClick} className="ECOHeaderCloseIcon">
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          {activeTab === "CreateECO" && (
            <div className="CreateFlyoutBody">
              <h3>Enter The Details</h3>
              <TextField
                label="ECO Name"
                name="name"
                className="AdminTextFeilds"
                value={formValues.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
              <Autocomplete
                options={changeTypes}
                loading={loadingChangeTypes}
                loadingText="Loading Change Types..."
                getOptionLabel={(option) => option.name}
                value={formValues.changeType || null}
                onChange={(event, newValue) =>
                  handleChange({
                    target: { name: "changeType", value: newValue },
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Change Type"
                    name="changeType"
                    className="AdminTextFeilds"
                    error={!!formErrors.changeType}
                    helperText={formErrors.changeType}
                    required
                  />
                )}
              />
              <Autocomplete
                options={ecoPriorities}
                value={formValues.priority || null}
                onChange={(event, newValue) => {
                  handleAutocompleteChange("priority", newValue);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Priority" required />
                )}
              />
              {!isInitialRelease && (
                <TextField
                  label="Reason For Change"
                  name="reasonForChange"
                  className="AdminTextFeilds"
                  value={formValues.reasonForChange}
                  onChange={handleChange}
                  error={!!formErrors.reasonForChange}
                  helperText={formErrors.reasonForChange}
                  required
                  multiline
                  rows={3}
                />
              )}
              {!isInitialRelease && (
                <TextField
                  label="Impact Analysis"
                  name="impactAnalysis"
                  className="AdminTextFeilds"
                  value={formValues.impactAnalysis}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  error={!!formErrors.impactAnalysis}
                  helperText={formErrors.impactAnalysis}
                  required
                />
              )}
              {/* <Autocomplete
                multiple
                options={userData}
                loading={loadingUsersData}
                loadingText="Loading Users..."
                value={formValues.approvers || []}
                onChange={(event, newValue) => {
                  handleAutocompleteChange("approvers", newValue);
                }}
                getOptionLabel={(option) =>
                  option ? `${option.firstName} ${option.lastName}` : ""
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Select Approver(s)" />
                )}
              /> */}

              <TextField
                label="Description"
                name="description"
                className="AdminTextFeilds"
                value={formValues.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
              {selectedParts.length > 0 && (
                <div className="SelectedPartsContainer">
                  <h2>Selected Parts</h2>
                  <StyledDataGrid
                    rows={selectedParts}
                    columns={columns}
                    autoHeight
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    getRowId={(row) => row.id}
                    initialState={initialGridState}
                    disableSelectionOnClick
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="CreateFlyoutFooter">
        <Button onClick={handleCloseClick} className="CancelButton">
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loadingData}>
          Create
        </Button>
      </div>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <div className="EcoDataGridDesPopOver">
          <TextField
            label="Edit Description"
            multiline
            rows={4}
            fullWidth
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
          />
          <Button onClick={handleSaveDescription}>Save</Button>
        </div>
      </Popover>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewEco;
