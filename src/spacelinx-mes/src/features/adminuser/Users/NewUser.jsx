import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormHelperText,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { fetchRoles } from "../../../services/roleService";
import { createUser } from "../../../services/userService";
import { fetchDepartmentLookup } from "../../../services/departmentService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { useUserContext } from "../../userContext/UserContext";
import "../../materialKits/Kits.css";

const NewUser = ({
  handleCloseClick,
  fetchUsersData,
  usersData,
  selectedRoleId,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { activeRole } = useUserContext();
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
  });
  const [loadingData, setLoadingData] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    roles: "",
  });

  const currentUserIsSuperAdmin = activeRole?.role?.roleName === "Super Admin";

  const capitalizeFirstLetter = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  useEffect(() => {
    const fetchRolesData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchRoles();
        if (data) {
          let filteredData = data;
          if (!currentUserIsSuperAdmin) {
            filteredData = data.filter(
              (role) => role.roleName !== "Super Admin"
            );
          }
          const sortedData = filteredData.sort(
            (a, b) => a.roleNumber - b.roleNumber
          );
          setRoleOptions(sortedData);

          if (selectedRoleId) {
            const matched = sortedData.find((r) => r.id === selectedRoleId);
            if (matched) {
              setSelectedRoles([matched]);
            }
          }
        }
      } catch (error) {
        console.log(error);
        Alert("Failed to load roles. Please try again.", "error");
      } finally {
        setLoadingData(false);
      }
    };

    fetchRolesData();
  }, [selectedRoleId]);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchDepartmentLookup();
        setDepartmentOptions(data ?? []);
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    })();
  }, []);

  const validateCreateUserFields = () => {
    let valid = true;
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      roles: "",
    };

    if (!formValues.firstName) {
      errors.firstName = "First Name is required";
      valid = false;
    }

    if (!formValues.lastName) {
      errors.lastName = "Last Name is required";
      valid = false;
    }

    if (!formValues.email) {
      errors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = "Invalid email address";
      valid = false;
    }

    if (selectedRoles.length === 0) {
      errors.roles = "At least one role is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleCreateUser = async () => {
    if (!validateCreateUserFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);
    const user = {
      firstName: capitalizeFirstLetter(formValues.firstName),
      lastName: capitalizeFirstLetter(formValues.lastName),
      email: formValues.email,
      departmentId: formValues.departmentId || null,
      roles: selectedRoles.map((role) => ({
        id: role.id,
        roleName: role.roleName,
      })),
    };

    try {
      const newUser = await createUser(user);

      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        departmentId: "",
      });
      setFormErrors({
        firstName: "",
        lastName: "",
        email: "",
        roles: "",
      });
      setSelectedRoles([]);
      handleCloseClick();
      fetchUsersData();
      Alert("User Created Successfully..!", "success");
    } catch (error) {
      console.error("Error creating user:", "error");
      Alert("Couldn't Create User..!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleRoleChange = (role) => {
    const exists = selectedRoles.find((r) => r.id === role.id);
    const updated =
      exists === undefined
        ? [...selectedRoles, role]
        : selectedRoles.filter((r) => r.id !== role.id);
    setSelectedRoles(updated);
    setFormErrors({ ...formErrors, roles: "" });
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create User</h2>
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
                label="First Name"
                onChange={(e) => {
                  setFormValues({ ...formValues, firstName: e.target.value });
                  setFormErrors({ ...formErrors, firstName: "" });
                }}
                value={formValues.firstName}
                error={!!formErrors.firstName}
              />
              <FormHelperText error={!!formErrors.firstName}>
                {formErrors.firstName}
              </FormHelperText>
            </FormGroup>
            <FormGroup>
              <TextField
                label="Last Name"
                onChange={(e) => {
                  setFormValues({ ...formValues, lastName: e.target.value });
                  setFormErrors({ ...formErrors, lastName: "" });
                }}
                value={formValues.lastName}
                error={!!formErrors.lastName}
              />
              <FormHelperText error={!!formErrors.lastName}>
                {formErrors.lastName}
              </FormHelperText>
            </FormGroup>
            <FormGroup>
              <TextField
                label="Email"
                onBlur={(e) => {
                  const email = e.target.value.trim();
                  const exactMatch = usersData.some(
                    (user) => user.email.toLowerCase() === email.toLowerCase()
                  );
                  const errorMessage = exactMatch
                    ? "The Email Already Exists"
                    : "";

                  setFormErrors({
                    ...formErrors,
                    email: errorMessage,
                  });

                  if (!errorMessage) {
                    setFormValues({
                      ...formValues,
                      email: email,
                    });
                  }
                }}
                onChange={(e) => {
                  setFormValues({
                    ...formValues,
                    email: e.target.value,
                  });
                  setFormErrors({
                    ...formErrors,
                    email: "",
                  });
                }}
                value={formValues.email}
                error={!!formErrors.email}
              />
              <FormHelperText error={!!formErrors.email}>
                {formErrors.email}
              </FormHelperText>
            </FormGroup>

            <FormGroup>
              <Autocomplete
                options={departmentOptions}
                getOptionLabel={(option) => option.name ?? ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={
                  departmentOptions.find(
                    (d) => String(d.id) === String(formValues.departmentId)
                  ) ?? null
                }
                onChange={(_, selected) =>
                  setFormValues({
                    ...formValues,
                    departmentId: selected ? String(selected.id) : "",
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Department" />
                )}
              />
            </FormGroup>

            <div className="roles-container">
              <h4>Roles:</h4>
              {roleOptions.map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={selectedRoles.some(
                        (selectedRole) => selectedRole.id === role.id
                      )}
                      onChange={() => handleRoleChange(role)}
                    />
                  }
                  label={role.roleName}
                />
              ))}
            </div>
            <FormHelperText error={!!formErrors.roles}>
              {formErrors.roles}
            </FormHelperText>
          </div>
          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button disabled={loadingData} onClick={handleCreateUser}>
              Create
            </Button>
          </div>
          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default NewUser;
