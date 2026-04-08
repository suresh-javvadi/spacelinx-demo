import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { createMachine, fetchMachines } from "../../../services/machineService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import {
  createMachineType,
  fetchMachineTypesLookUp,
} from "../../../services/machineTypeService";
import "../../materialKits/Kits.css";

const NewMachine = ({ handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [formValues, setFormValues] = useState({
    machineName: "",
    machineNumber: "",
    machineType: "",
  });
  const { machineName, machineNumber, machineType } = formValues;
  const [formErrors, setFormErrors] = useState({
    machineName: "",
    machineNumber: "",
    machineType: "",
  });
  const [machineTypes, setMachineTypes] = useState([]);
  const [machinesNumbersData, setMachinesNumbersData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [machineTypesLoading, setMachineTypesLoading] = useState(true);
  const [loadMachineTypes, setLoadMachineTypes] = useState(true);

  useEffect(() => {
    if (!loadMachineTypes) {
      return;
    }
    fetchData();
  }, [loadMachineTypes]);

  const fetchData = async () => {
    setMachineTypesLoading(true);
    try {
      const machineTypesData = await fetchMachineTypesLookUp();
      setMachineTypes(machineTypesData);
    } catch (error) {
      Alert("Couldn't fetch Machine Types...!", "error");
      console.error("Error fetching Machine types data:", error);
    } finally {
      setMachineTypesLoading(true);
    }
  };

  useEffect(() => {
    const fetchMachinesNumberData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchMachines();
        if (data) {
          setMachinesNumbersData(data.map((machine) => machine.number));
        }
      } catch (error) {
        console.error("Error fetching machines:", error);
        Alert("Couldn't Fetch Machines...!", "error");
      } finally {
        setLoadingData(false);
      }
    };
    fetchMachinesNumberData();
  }, []);

  const validateCreateMachineFields = () => {
    let valid = true;
    const errors = { machineName: "", machineNumber: "", machineType: "" };

    if (!machineName) {
      errors.machineName = "Machine Name is required";
      valid = false;
    } else if (!/^[a-zA-Z\s\d]+$/.test(machineName)) {
      errors.machineName =
        "Machine Name should only contain letters, spaces, and numbers";
      valid = false;
    } else if (machineName.length > 250) {
      errors.machineName = "Machine Name must be at most 250 characters long";
      valid = false;
    }

    if (!machineNumber) {
      errors.machineNumber = "Machine Number is required";
      valid = false;
    } else if (machineNumber.length > 100) {
      errors.machineNumber =
        "Machine Number must be at most 100 characters long";
      valid = false;
    } else if (
      machinesNumbersData.find(
        (number) => number.toLowerCase() === machineNumber.toLowerCase(),
      )
    ) {
      errors.machineNumber = "The Machine Number already exists";
      valid = false;
    }

    if (!machineType) {
      errors.machineType = "Machine Type is required";
      valid = false;
    }
    setFormErrors(errors);

    return valid;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreateMachineFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);

    const machine = {
      name: machineName,
      number: machineNumber,
      machineTypeId: machineType?.id,
    };

    try {
      const newMachine = await createMachine(machine);
      handleRefresh();
      handleCloseClick();
      Alert("Machine Created Successfully!", "success");
      setFormValues({ machineName: "", machineNumber: "", machineType: "" });
      setFormErrors({
        machineName: "",
        machineNumber: "",
        machineType: "",
      });
    } catch (error) {
      Alert("Couldn't Create Machine!", "error");
      console.error("Error creating machine:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddMachineType = async (event, newValue) => {
    setLoadingData(true);
    if (newValue && newValue.newMachineTypeValue) {
      const newMachineTypeData = {
        name: newValue.newMachineTypeValue,
      };
      try {
        const response = await createMachineType(newMachineTypeData);
        setFormValues({
          ...formValues,
          machineType: { id: response.id, name: response.name },
        });
        fetchData();
        setFormErrors({ ...formErrors, machineType: "" });
        Alert("Machine Type Added Successfully!", "success");
      } catch (error) {
        Alert("Couldn't Add Machine Type!", "error");
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    } else {
      setLoadingData(false);
    }
  };

  const filter = createFilterOptions();

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Machine</h2>
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
            <h3>Enter The Details</h3>
            <FormGroup>
              <TextField
                label="Machine Number"
                className="AdminTextFeilds"
                onBlur={(e) => {
                  const machineNumberValue = e.target.value.trim();
                  const exactMatch = machinesNumbersData.some(
                    (number) =>
                      number.toLowerCase() === machineNumberValue.toLowerCase(),
                  );
                  const errorMessage = exactMatch
                    ? "The Machine Number Already Exists"
                    : "";

                  setFormErrors({ ...formErrors, machineNumber: errorMessage });

                  if (!errorMessage) {
                    setFormValues({
                      ...formValues,
                      MachineNumber: machineNumberValue,
                    });
                  }
                }}
                onChange={(e) => {
                  setFormValues({
                    ...formValues,
                    machineNumber: e.target.value,
                  });
                  setFormErrors({ ...formErrors, machineNumber: "" });
                }}
                value={machineNumber}
                error={!!formErrors.machineNumber}
                required
              />
              <FormHelperText error={!!formErrors.machineNumber}>
                {formErrors.machineNumber}
              </FormHelperText>
            </FormGroup>
            <FormGroup>
              <TextField
                label="Machine Name"
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({ ...formValues, machineName: e.target.value });
                  setFormErrors({ ...formErrors, machineName: "" });
                }}
                value={machineName}
                error={!!formErrors.machineName}
                required
              />
              <FormHelperText error={!!formErrors.machineName}>
                {formErrors.machineName}
              </FormHelperText>
            </FormGroup>
            <Autocomplete
              value={machineType}
              loading={machineTypesLoading}
              loadingText="Loading Machine Types..."
              onChange={(event, newValue) => {
                if (newValue && newValue.newMachineTypeValue) {
                  handleAddMachineType(event, newValue);
                  setFormValues({
                    ...formValues,
                    machineType: { name: newValue.newMachineTypeValue },
                  });
                } else {
                  setFormValues({ ...formValues, machineType: newValue });
                  setFormErrors({ ...formErrors, machineType: "" });
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;

                if (
                  inputValue &&
                  !options.find((option) => option.name === inputValue)
                ) {
                  filtered.push({
                    newMachineTypeValue: inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="machine-type-autocomplete"
              options={machineTypes}
              getOptionLabel={(option) => option.name || ""}
              renderOption={(props, option, index) => (
                <MenuItem {...props} id={index} key={option.id || index}>
                  {option.name}
                </MenuItem>
              )}
              freeSolo
              className="AdminTextFields"
              renderInput={(params) => (
                <>
                  <TextField
                    {...params}
                    label="Machine Type"
                    error={!!formErrors.machineType}
                    required
                  />
                  <FormHelperText error={!!formErrors.machineType}>
                    {formErrors.machineType}
                  </FormHelperText>
                </>
              )}
            />
          </div>
          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loadingData || !!formErrors.machineNumber}
            >
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

export default NewMachine;
