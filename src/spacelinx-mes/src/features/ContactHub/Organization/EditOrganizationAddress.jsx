import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { fetchCountryLookUp } from "../../../services/countryService";
import {
  createOrganizationAddress,
  deleteOrganizationAddress,
  fetchAllOrganizationAddressById,
  updateOrganizationAddress,
} from "../../../services/organizationAddressService";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { AlertsContext } from "../../AlertsContext/Context";
import "./Organization.css";
import "../Company/Company.css";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../userContext/UserContext";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
const EditOrganizationAddress = ({
  selectedOrganizationData,
  handleRefresh,
}) => {
  const [accordionOpen, setAccordionOpen] = useState(false);
  const { hasPermission } = useUserContext();
  const [formValues, setFormValues] = useState({
    addressType: null,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    countryId: null,
    phoneNumber: "",
    latitude: "",
    longitude: "",
    addressId: null,
  });
  const [countries, setCountries] = useState([]);
  const [loadCountries, setLoadCountries] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [addressesloading, setAddressesloading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [addressTypes, setAddressTypes] = useState([]);
  const [loadAddressTypes, setLoadAddressTypes] = useState(true);
  const { Alert } = useContext(AlertsContext);
  const [formErrors, setFormErrors] = useState({});

  const commonReset = () => {
    setFormValues({
      addressType: null,
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      countryId: null,
      phoneNumber: "",
      latitude: "",
      longitude: "",
      addressId: null,
    });
    setFormErrors({});
    setIsEditing(false);
    setEditId(null);
  };

  const closeAccordionAndReset = () => {
    commonReset();
    setAccordionOpen(false);
  };

  useEffect(() => {
    const fetchCountriesData = async () => {
      setLoadCountries(true);
      if (countries.length === 0) {
        try {
          const countriesData = await fetchCountryLookUp();
          setCountries(countriesData || []);
        } catch (error) {
          console.error("Failed to fetch countries:", error);
          setCountries([]);
        }
      }
      setLoadCountries(false);
    };
    fetchCountriesData();
  }, []);

  const fetchOrganizationAddresses = async () => {
    setAddressesloading(true);
    try {
      const organizationAddressesData = await fetchAllOrganizationAddressById(
        selectedOrganizationData
      );

      const mappedAddresses = (organizationAddressesData || []).map((va) => {
        const addressDetails = va.address || {};
        return {
          id: va.id,
          addressId: addressDetails.id || null,
          addressLine1: addressDetails.addressLine1 || "",
          addressLine2: addressDetails.addressLine2 || "",
          city: addressDetails.city || "",
          state: addressDetails.state || "",
          postalCode: addressDetails.postalCode || "",
          countryId: addressDetails.countryId || null,
          phoneNumber: addressDetails.phoneNumber || "",
          latitude:
            addressDetails.latitude !== undefined
              ? addressDetails.latitude
              : "",
          longitude:
            addressDetails.longitude !== undefined
              ? addressDetails.longitude
              : "",
          addressType: va.addressType || "",
        };
      });
      setAddresses(mappedAddresses);
    } catch (error) {
      setAddresses([]);
    } finally {
      setAddressesloading(false);
    }
  };
  useEffect(() => {
    if (
      selectedOrganizationData !== null &&
      selectedOrganizationData !== undefined
    ) {
      fetchOrganizationAddresses();
    } else {
      setAddresses([]);
      setLoading(false);
      closeAccordionAndReset();
    }
  }, [selectedOrganizationData]);

  const handleCountryChange = (event, newValue) => {
    setFormValues((prevData) => ({
      ...prevData,
      countryId: newValue ? newValue.id : null,
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      countryId: "",
    }));
  };

  const columns = [
    {
      field: "addressLine1",
      headerName: "Address Line 1",
      flex: 1,
    },
    {
      field: "city",
      headerName: "City",
      flex: 1,
    },
    {
      field: "state",
      headerName: "State",
      flex: 1,
    },
    {
      field: "countryId",
      headerName: "Country",
      flex: 1,
      renderCell: ({ row }) => {
        const country = countries.find((c) => c.id === row.countryId);
        return country ? country.name : "N/A";
      },
    },
    {
      field: "addressType",
      headerName: "Address Type",
      flex: 1,
    },
    {
      headerName: "Actions",
      flex: 0.5,
      renderCell: ({ row }) => (
        <ion-icon
          name="trash-outline"
          onClick={(event) => {
            event.stopPropagation();
            if (!hasPermission(PERMISSIONS.ORGANIZATION.ADDRESS.DELETE)) {
              Alert("You do not have access to delete.", "warning");
              return;
            }
            handleDeleteOrganizationAddress(row.id);
          }}
        />
      ),
    },
  ];

  const handleCancelButtonClick = () => {
    closeAccordionAndReset();
  };

  const validate = () => {
    const errors = {};

    if (!formValues.addressLine1.trim()) {
      errors.addressLine1 = "Address Line 1 is required.";
    }

    if (formValues.phoneNumber.trim()) {
      if (!/^\d{10}$/.test(formValues.phoneNumber.trim())) {
        errors.phoneNumber = "Phone number must be exactly 10 digits.";
      }
    }

    if (!formValues.city.trim()) {
      errors.city = "City is required.";
    }

    if (!formValues.state.trim()) {
      errors.state = "State is required.";
    }
    if (!formValues.postalCode.trim()) {
      errors.postalCode = "Postal Code is required.";
    }

    if (!formValues.countryId) {
      errors.countryId = "Country is required.";
    }

    if (!formValues.addressType) {
      errors.addressType = "Address Type is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAddress = async () => {
    if (!validate()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    if (!selectedOrganizationData && selectedOrganizationData !== 0) {
      Alert("Cannot create address: Organization is not selected.", "error");
      return;
    }
    setLoading(true);
    setAddressesloading(true);
    closeAccordionAndReset();
    try {
      const payload = {
        addressType: formValues.addressType,
        address: {
          addressLine1: formValues.addressLine1 || "",
          addressLine2: formValues.addressLine2 || "",
          city: formValues.city || "",
          state: formValues.state || "",
          postalCode: formValues.postalCode || "",
          countryId: formValues.countryId,
          phoneNumber: formValues.phoneNumber || "",
          latitude: parseFloat(formValues.latitude) || null,
          longitude: parseFloat(formValues.longitude) || null,
        },
      };

      const response = await createOrganizationAddress(
        payload,
        selectedOrganizationData
      );

      if (response && response.addressId) {
        await fetchOrganizationAddresses();
        closeAccordionAndReset();
        Alert("Address Added successfully!", "success");
        handleRefresh();
      } else {
        Alert("FAILED or UNEXPECTED RESPONSE. Condition NOT MET.", "error");
      }
    } catch (error) {
      Alert("Error adding address. Please try again.", "error");
    } finally {
      setLoading(false);
      setAddressesloading(false);
    }
  };

  const handleEditAddress = async () => {
    if (!validate()) {
      Alert("Please fill in all required fields", "error");
      return;
    }
    if (!selectedOrganizationData && selectedOrganizationData !== 0) {
      Alert(
        "Cannot update address: Organization is not selected or Organization data is missing.",
        "error"
      );
      return;
    }
    if (!editId) {
      Alert("Cannot update address: Address identifier is missing.", "error");
      return;
    }

    setLoading(true);
    closeAccordionAndReset();
    setAddressesloading(true);
    try {
      const payload = {
        id: editId,
        addressType: formValues.addressType,
        address: {
          id: formValues.addressId,
          addressLine1: formValues.addressLine1 || "",
          addressLine2: formValues.addressLine2 || "",
          city: formValues.city || "",
          state: formValues.state || "",
          postalCode: formValues.postalCode || "",
          countryId: formValues.countryId,
          phoneNumber: formValues.phoneNumber || "",
          latitude: parseFloat(formValues.latitude) || null,
          longitude: parseFloat(formValues.longitude) || null,
        },
      };
      await updateOrganizationAddress(selectedOrganizationData, payload);

      await fetchOrganizationAddresses();
      Alert("Address updated successfully!", "success");
      handleRefresh();
    } catch (error) {
      Alert("Error updating address. Please try again.", "error");
    } finally {
      setLoading(false);
      setAddressesloading(false);
    }
  };

  const handleDeleteOrganizationAddress = async (id) => {
    const confirmed = await showConfirmation(
      "Are you sure?",
      "You want to delete this address?"
    );
    if (confirmed) {
      try {
        await deleteOrganizationAddress(id);
        showAlert("success", "Deleted!", "Address deleted successfully!");
        handleRefresh();
        setAddresses((prevAddresses) =>
          prevAddresses.filter((address) => address.id !== id)
        );
      } catch (error) {
        console.error("Delete error:", error);
        showAlert("error", "Error", "Failed to delete address. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRowClick = (params) => {
    const selectedRow = params?.row;
    setFormValues({
      addressType: selectedRow?.addressType || null,
      addressLine1: selectedRow?.addressLine1 || "",
      addressLine2: selectedRow?.addressLine2 || "",
      city: selectedRow?.city || "",
      state: selectedRow?.state || "",
      postalCode: selectedRow?.postalCode || "",
      countryId: selectedRow?.countryId || null,
      phoneNumber: selectedRow?.phoneNumber || "",
      latitude:
        selectedRow?.latitude !== undefined ? selectedRow?.latitude : "",
      longitude:
        selectedRow?.longitude !== undefined ? selectedRow?.longitude : "",
      addressId: selectedRow?.addressId || null,
    });
    setEditId(selectedRow?.id);
    setIsEditing(true);
    setAccordionOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "phoneNumber") {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber:
          value.trim() !== "" && !/^\d{10}$/.test(value.trim())
            ? "Phone number must be exactly 10 digits"
            : "",
      }));
    } else {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleAccordionNativeToggle = (event, isExpanded) => {
    setAccordionOpen(isExpanded);
    if (isExpanded) {
      if (!isEditing) {
        commonReset();
      }
    } else {
      closeAccordionAndReset();
    }
  };

  useEffect(() => {
    const fetchAddressTypesData = async () => {
      setLoadAddressTypes(true);
      try {
        const response = await fetchOptionSetByName("address_type");
        setAddressTypes(response ? JSON.parse(response.values) : []);
      } catch (error) {
        Alert("Error fetching address types. Please try again.", "error");
        setAddressTypes([]);
      }
    };
    fetchAddressTypesData();
    setLoadAddressTypes(true);
  }, []);

  return (
    <div className="bank-details-container">
      <Accordion
        expanded={accordionOpen}
        onChange={(event, isExpanded) => {
          if (!hasPermission(PERMISSIONS.ORGANIZATION.ADDRESS.MODIFY)) {
            Alert("You do not have permission to view address!", "warning");
            return;
          }

          // allow toggle
          handleAccordionNativeToggle(event, isExpanded);
        }}
      >
        <AccordionSummary
          expandIcon={
            accordionOpen ? (
              <CloseIcon className="AppHyperLink" />
            ) : (
              <AddCircleOutlineIcon className="AppHyperLink" />
            )
          }
        >
          <Typography variant="subtitle1">
            {isEditing ? "Edit Address" : "Add Address"}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="bank-details-grid">
            <TextField
              className="AdminTextFeilds"
              label="Address Line 1"
              name="addressLine1"
              value={formValues.addressLine1}
              onChange={handleInputChange}
              fullWidth
              required
              error={!!formErrors.addressLine1}
              helperText={formErrors.addressLine1}
            />
            <TextField
              className="AdminTextFeilds"
              label="Address Line 2"
              name="addressLine2"
              value={formValues.addressLine2}
              fullWidth
              onChange={handleInputChange}
            />
            <TextField
              className="AdminTextFeilds"
              label="City"
              name="city"
              value={formValues.city}
              onChange={handleInputChange}
              required
              error={!!formErrors.city}
              helperText={formErrors.city}
            />
            <TextField
              className="AdminTextFeilds"
              label="State"
              name="state"
              value={formValues.state}
              onChange={handleInputChange}
              required
              error={!!formErrors.state}
              helperText={formErrors.state}
            />
            <TextField
              className="AdminTextFeilds"
              label="Postal Code"
              name="postalCode"
              value={formValues.postalCode}
              onChange={handleInputChange}
              required
              error={!!formErrors.postalCode}
              helperText={formErrors.postalCode}
            />
            <Autocomplete
              options={countries}
              loading={loadCountries}
              loadingText="Loading Countries..."
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) =>
                option && value && option.id === value.id
              }
              value={
                countries.find(
                  (country) => country.id === formValues.countryId
                ) || null
              }
              onChange={handleCountryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  variant="outlined"
                  className="AdminTextFeilds"
                  required
                  error={!!formErrors.countryId}
                  helperText={formErrors.countryId}
                />
              )}
            />
            <Autocomplete
              options={addressTypes}
              loading={loadAddressTypes}
              loadingText="Loading AddressTypes...."
              getOptionLabel={(option) => option.name || ""}
              value={
                addressTypes.find(
                  (opt) => opt.name === formValues.addressType
                ) || null
              }
              isOptionEqualToValue={(option, value) =>
                option.name === (value?.name || value)
              }
              getOptionDisabled={(option) =>
                option.name === "Primary" &&
                addresses.some(
                  (item) =>
                    item.addressType === "Primary" &&
                    (!isEditing || item.id !== editId)
                )
              }
              onChange={(event, newValue) => {
                setFormValues((prevData) => ({
                  ...prevData,
                  addressType: newValue ? newValue.name : null,
                }));
                setFormErrors((prevErrors) => ({
                  ...prevErrors,
                  addressType: "",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Address Type"
                  variant="outlined"
                  className="AdminTextFeilds"
                  required
                  error={!!formErrors.addressType}
                  helperText={formErrors.addressType}
                />
              )}
            />

            <TextField
              className="AdminTextFeilds"
              label="Phone Number"
              name="phoneNumber"
              type="text"
              inputMode="numeric"
              value={formValues.phoneNumber}
              onChange={handleInputChange}
              onInput={(e) => {
                e.target.value = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 10);
              }}
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
            />

            <TextField
              className="AdminTextFeilds"
              label="Latitude"
              name="latitude"
              type="text"
              value={formValues.latitude}
              onChange={handleInputChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9.]/g, "");
              }}
              inputMode="decimal"
            />
            <TextField
              className="AdminTextFeilds"
              label="Longitude"
              name="longitude"
              type="text"
              value={formValues.longitude}
              onChange={handleInputChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9.]/g, "");
              }}
              inputMode="decimal"
            />
          </div>
          <div className="bank-actions-row">
            <Button className="CancelButton" onClick={handleCancelButtonClick}>
              Cancel
            </Button>
            <Button
              className="CreateButton"
              onClick={isEditing ? handleEditAddress : handleCreateAddress}
              disabled={loading}
            >
              {isEditing ? "Update " : "Add"}
            </Button>
          </div>
        </AccordionDetails>
      </Accordion>

      <div className="dataGridContainer">
        <StyledDataGrid
          rows={addresses}
          columns={columns}
          onRowClick={(params) => {
            if (!hasPermission(PERMISSIONS.ORGANIZATION.ADDRESS.MODIFY)) {
              Alert("You do not have access to edit.", "warning");
              return;
            }
            handleRowClick(params);
          }}
          loading={addressesloading}
          getRowId={(row) => row.id}
        />
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditOrganizationAddress;
