import React, { useState, useEffect, useContext } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import ClipLoader from "react-spinners/ClipLoader";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { createProgram } from "../../../services/programService";
import { fetchUsers } from "../../../services/userService";
import { fetchCustomerLookUp } from "../../../services/customerService";
import Cliploader from "../../../Components/Loaders/Cliploader";

const filter = createFilterOptions();

const NewProgram = ({
  handleCloseClick,
  handleRefresh,
  staffData,
  loadingStaff,
  customers,
  loadingCustomers,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [startDate, setStartDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs());
  const [managerRole, setManagerRole] = useState(null);
  const [technicianRole, setTechnicianRole] = useState(null);
  const [buyerRole, setBuyerRole] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    customerId: "",
    programManagerId: "",
    supplyChainManagerId: "",
    buyerId: "",
    actualSpend: 0,
    budget: 0,
    goals: "",
    status: "Not Started",
  });

  const [formErrors, setFormErrors] = useState({});

  const validateCreatePartFields = () => {
    let valid = true;
    const errors = {
      name: "",
    };

    if (!formValues.name.trim()) {
      errors.name = "Name is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleCreate = async () => {
    if (!validateCreatePartFields()) {
      Alert("Please fill all required fields correctly", "error");
      return;
    }

    const payload = {
      name: formValues.name,
      programManagerId: managerRole?.id || null,
      supplyChainManagerId: technicianRole?.id || null,
      buyerId: buyerRole?.id || null,
      customerId: formValues.customerId || null,
      description: formValues.description || null,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: dueDate ? dueDate.toISOString() : null,
      actualSpend: parseFloat(formValues.actualSpend) || 0,
      budget: parseFloat(formValues.budget) || 0,
      goals: formValues.goals || null,
      status: formValues.status || null,
    };

    try {
      await createProgram(payload);
      Alert("Program Created Successfully!", "success");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("Error creating program:", error);
      Alert("Failed to create program!", "error");
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Program</h2>
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
            <div className="TwoColumnGrid2">
              <div>
                <TextField
                  label="Name"
                  fullWidth
                  className="AdminTextFeilds"
                  onChange={(e) => {
                    setFormValues({ ...formValues, name: e.target.value });
                    setFormErrors({ ...formErrors, name: "" });
                  }}
                  value={formValues.name}
                  error={!!formErrors.name}
                  required
                />
                <FormHelperText error={!!formErrors.name}>
                  {formErrors.name}
                </FormHelperText>
              </div>
              <div>
                <Autocomplete
                  id="manager-autocomplete"
                  options={
                    technicianRole
                      ? staffData.filter(
                          (item) => item.id !== technicianRole.id,
                        )
                      : staffData
                  }
                  loading={loadingStaff}
                  loadingText="Loading Project Manager ..."
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}`
                  }
                  renderOption={(props, option) => (
                    <MenuItem {...props}>
                      {`${option.firstName} ${option.lastName}`}
                    </MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Project Manager"
                      className="AdminTextFeilds"
                      error={!!formErrors.managerRole}
                      helperText={formErrors.managerRole}
                    />
                  )}
                  value={managerRole}
                  onChange={(event, newValue) => {
                    setManagerRole(newValue);
                    setFormErrors((errors) => ({
                      ...errors,
                      managerRole: "",
                    }));
                  }}
                />
              </div>
              <div>
                <Autocomplete
                  id="supply-chain-autocomplete"
                  options={
                    managerRole
                      ? staffData.filter((item) => item.id !== managerRole.id)
                      : staffData
                  }
                  loading={loadingStaff}
                  loadingText="Loading Supply Chain Manager ..."
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}`
                  }
                  renderOption={(props, option) => (
                    <MenuItem {...props}>
                      {`${option.firstName} ${option.lastName}`}
                    </MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Supply Chain Manager"
                      className="AdminTextFeilds"
                      error={!!formErrors.supplyChainManagerRole}
                      helperText={formErrors.supplyChainManagerRole}
                    />
                  )}
                  value={technicianRole}
                  onChange={(event, newValue) => {
                    setTechnicianRole(newValue);
                    setFormErrors((errors) => ({
                      ...errors,
                      supplyChainManagerRole: "",
                    }));
                  }}
                />
              </div>
              <div>
                <Autocomplete
                  id="buyer-autocomplete"
                  options={
                    managerRole
                      ? staffData.filter((item) => item.id !== managerRole.id)
                      : staffData
                  }
                  loading={loadingStaff}
                  loadingText="Loading Buyer ..."
                  getOptionLabel={(option) =>
                    `${option.firstName} ${option.lastName}`
                  }
                  renderOption={(props, option) => (
                    <MenuItem {...props}>
                      {`${option.firstName} ${option.lastName}`}
                    </MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buyer"
                      className="AdminTextFeilds"
                      error={!!formErrors.buyerRole}
                      helperText={formErrors.buyerRole}
                    />
                  )}
                  value={buyerRole}
                  onChange={(event, newValue) => {
                    setBuyerRole(newValue);
                    setFormErrors((errors) => ({
                      ...errors,
                      buyerRole: "",
                    }));
                  }}
                />
              </div>
              <div>
                <Autocomplete
                  id="customer-autocomplete"
                  options={customers}
                  loading={loadingCustomers}
                  loadingText="Loading Customers"
                  getOptionLabel={(option) => option.name}
                  renderOption={(props, option) => (
                    <MenuItem {...props}>{option.name}</MenuItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer"
                      className="AdminTextFeilds"
                      error={!!formErrors.customerId}
                      helperText={formErrors.customerId}
                    />
                  )}
                  value={selectedCustomer}
                  onChange={(event, newValue) => {
                    setSelectedCustomer(newValue);
                    setFormValues((prev) => ({
                      ...prev,
                      customerId: newValue?.id || "",
                    }));
                    setFormErrors((prev) => ({
                      ...prev,
                      customerId: "",
                    }));
                  }}
                />
              </div>
              <div>
                <TextField
                  select
                  label="Status"
                  className="AdminTextFeilds"
                  fullWidth
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      status: e.target.value,
                    });
                    setFormErrors({ ...formErrors, status: "" });
                  }}
                  value={formValues.status}
                  error={!!formErrors.status}
                >
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="Planning">Planning</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </TextField>
                <FormHelperText error={!!formErrors.status}>
                  {formErrors.status}
                </FormHelperText>
              </div>
              <div>
                <TextField
                  label="Budget (in ₹)"
                  className="AdminTextFeilds"
                  type="number"
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      budget: e.target.value,
                    });
                    setFormErrors({ ...formErrors, budget: "" });
                  }}
                  value={formValues.budget}
                  error={!!formErrors.budget}
                />
                <FormHelperText error={!!formErrors.budget}>
                  {formErrors.budget}
                </FormHelperText>
              </div>
              <div>
                <TextField
                  label="Actual Spend (in ₹)"
                  className="AdminTextFeilds"
                  type="number"
                  fullWidth
                  InputProps={{ inputProps: { min: 0 } }}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      actualSpend: e.target.value,
                    });
                    setFormErrors({ ...formErrors, actualSpend: "" });
                  }}
                  value={formValues.actualSpend}
                  error={!!formErrors.actualSpend}
                />
                <FormHelperText error={!!formErrors.actualSpend}>
                  {formErrors.actualSpend}
                </FormHelperText>
              </div>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                />
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  minDate={startDate}
                  onChange={(newValue) => setDueDate(newValue)}
                />
              </LocalizationProvider>
              <div className="description">
                <TextField
                  fullWidth
                  label="Description"
                  className="AdminTextFeilds"
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      description: e.target.value,
                    });
                    setFormErrors({ ...formErrors, description: "" });
                  }}
                  value={formValues.description}
                  error={!!formErrors.description}
                />
                <FormHelperText error={!!formErrors.description}>
                  {formErrors.description}
                </FormHelperText>
                <TextField
                  label="Goals"
                  className="AdminTextFeilds"
                  multiline
                  rows={3}
                  onChange={(e) => {
                    setFormValues({
                      ...formValues,
                      goals: e.target.value,
                    });
                    setFormErrors({ ...formErrors, goals: "" });
                  }}
                  value={formValues.goals}
                  error={!!formErrors.goals}
                />
                <FormHelperText error={!!formErrors.goals}>
                  {formErrors.goals}
                </FormHelperText>
              </div>
            </div>
          </div>
          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button
              disabled={loadingData || !!formErrors.name}
              onClick={handleCreate}
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

export default NewProgram;
