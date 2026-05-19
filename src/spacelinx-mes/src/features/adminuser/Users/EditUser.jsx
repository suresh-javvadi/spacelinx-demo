import {
  Button,
  FormControlLabel,
  TextField,
  Checkbox,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { useState, useEffect, useContext } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { fetchRoles } from "../../../services/roleService";
import {
  updateUser,
  updateactivate,
  updatedeactivate,
} from "../../../services/userService";
import { fetchDepartmentLookup } from "../../../services/departmentService";
import { useUserContext } from "../../userContext/UserContext";
import "../../materialKits/Kits.css";

const EditUser = ({ handleCloseClick, selectedUserData, fetchUsersData }) => {
  const { Alert } = useContext(AlertsContext);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "",
    departmentId: "",
  });
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [allFetchedRoles, setAllFetchedRoles] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState({});
  const { activeRole, fetchUserRoles } = useUserContext();
  const currentUserIsSuperAdmin = activeRole?.role?.roleName === "Super Admin";

  useEffect(() => {
    if (selectedUserData) {
      setUserDataForEdit();
    }
  }, [selectedUserData]);

  const setUserDataForEdit = () => {
    setFormValues({
      firstName: selectedUserData.firstName,
      lastName: selectedUserData.lastName,
      email: selectedUserData.email,
      status: selectedUserData.isActive ? "Active" : "Inactive",
      departmentId: selectedUserData.departmentId ?? "",
    });
    setSelectedRoles(selectedUserData.roles.map((role) => role.id));
  };

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

  useEffect(() => {
    const fetchRolesData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchRoles();
        if (data) {
          const sortedData = data.sort((a, b) => a.roleNumber - b.roleNumber);
          setAllFetchedRoles(sortedData);

          const displayable = sortedData.filter((role) => {
            if (role.roleName === "Super Admin") {
              return (
                currentUserIsSuperAdmin ||
                selectedUserData.roles.some((r) => r.roleName === "Super Admin")
              );
            }
            return true;
          });

          setRoleOptions(displayable);
        }
      } catch (error) {
        console.log(error);
        Alert("Failed to load roles. Please try again.", "error");
      } finally {
        setLoadingData(false);
      }
    };

    fetchRolesData();
  }, []);

  const handleRoleChange = (event) => {
    if (readOnlyMode) {
      return;
    }
    const roleId = event.target.value;
    setSelectedRoles((prevRoles) => {
      const newSelectedRoles = prevRoles.includes(roleId)
        ? prevRoles.filter((prevRoleId) => prevRoleId !== roleId)
        : [...prevRoles, roleId];
      validateForm(newSelectedRoles);
      return newSelectedRoles;
    });
  };

  const handleUserStatus = async (isActive) => {
    setLoadingData(true);
    try {
      if (isActive) {
        await updatedeactivate(selectedUserData.id);
        setFormValues((prevFormValues) => ({
          ...prevFormValues,
          status: "InActive",
        }));
        Alert("User Deactivated Successfully..!", "success");
      } else {
        await updateactivate(selectedUserData.id);
        setFormValues((prevFormValues) => ({
          ...prevFormValues,
          status: "Active",
        }));
        Alert("User Activated Successfully..!", "success");
      }
    } catch (error) {
      Alert("Error Toggling User Status", "error");
    } finally {
      setLoadingData(false);
      handleCloseClick();
      fetchUsersData();
    }
  };

  const handleResetClick = () => {
    setUserDataForEdit();
    setErrors({});
  };

  const validateForm = (newSelectedRoles = selectedRoles) => {
    const newErrors = {};

    if (!formValues.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!formValues.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!formValues.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email))
      newErrors.email = "Invalid email format.";
    if (newSelectedRoles.length === 0) {
      newErrors.roles = "Please select at least one role.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (readOnlyMode) {
      return;
    }
    if (!validateForm()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);
    try {
      const updatedRoles = allFetchedRoles.filter((role) =>
        selectedRoles.includes(role.id)
      );
      const updatedUser = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        departmentId: formValues.departmentId || null,
        roles: updatedRoles,
        isActive: formValues.status === "Active",
      };
      await updateUser(selectedUserData.id, updatedUser);
      handleCloseClick();
      fetchUsersData();
      fetchUserRoles();
      Alert("User Updated Successfully!", "success");
    } catch (error) {
      Alert("Error Updating User Details", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>Edit User</h3>
        <div>
          <button onClick={() => setReadOnlyMode(false)}>
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="CreateFlyoutBody">
          <h3>User Details</h3>
          <TextField
            label="First Name"
            value={formValues.firstName}
            onChange={(e) => {
              const newFirstName = e.target.value;
              setFormValues({ ...formValues, firstName: newFirstName });
              if (!newFirstName.trim()) {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  firstName: "First name is required",
                }));
              } else {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  firstName: "",
                }));
              }
            }}
            error={!!errors.firstName}
            helperText={errors.firstName}
            disabled={readOnlyMode}
          />

          <TextField
            label="Last Name"
            value={formValues.lastName}
            onChange={(e) => {
              const newLastName = e.target.value;
              setFormValues({ ...formValues, lastName: newLastName });
              if (!newLastName.trim()) {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  lastName: "Last name is required",
                }));
              } else {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  lastName: "",
                }));
              }
            }}
            error={!!errors.lastName}
            helperText={errors.lastName}
            disabled={readOnlyMode}
          />

          <TextField label="Email" value={formValues.email} disabled />

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
            disabled={readOnlyMode}
            renderInput={(params) => (
              <TextField {...params} label="Department" />
            )}
          />

          <div className="roles-container">
            <h4>Roles:</h4>

            {roleOptions.map((role) => {
              const isSuperAdminRole = role.roleName === "Super Admin";
              const isChecked = selectedRoles.includes(role.id);
              const isDisabled =
                readOnlyMode || (isSuperAdminRole && !currentUserIsSuperAdmin);

              return (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={handleRoleChange}
                      value={role.id}
                      disabled={isDisabled}
                    />
                  }
                  label={role.roleName}
                />
              );
            })}
          </div>
          {errors.roles && <p className="roleErrorMessage">{errors.roles}</p>}
        </div>
      )}

      {!readOnlyMode && (
        <div className="EditFlyoutFooterUser">
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleResetClick}>
              Reset
            </Button>
            <Button onClick={handleSubmit} disabled={loadingData}>
              Update
            </Button>
          </div>
          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUser;
