import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Autocomplete,
} from "@mui/material";
import { createCompany } from "../../../services/companyService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { fetchCurrencies } from "../../../services/currencyService";
import { fetchPaymentTerms } from "../../../services/paymentTermService";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";

const isURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const isEmail = (string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(string).toLowerCase());
};

const isPhoneNumber = (string) => {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(String(string).replace(/\s/g, ""));
};

const CreateCompany = ({ pageTabValue, setPageDrawer, fetchCompanyData }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(true);
  const [currencies, setCurrencies] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    phoneNumber: "",
    alternatePhone: "",
    website: "",
    taxId: "",
    currencyId: null,
    qualityScore: 0,
    category: null,
    department: "",
    paymentTermId: null,
    logoUrl: "",
    notes: "",
    isVendor: pageTabValue === "Vendors",
    isCustomer: pageTabValue === "Customers",
    isPartner: pageTabValue === "Partners",
    email: "",
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    onTimeDeliveryRate: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [categoryTypes, setCategoryTypes] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingData(true);
      try {
        const response = await fetchOptionSetByName("vendor_categories");
        setCategoryTypes(response ? JSON.parse(response.values) : []);
      } catch (error) {
        Alert("Error fetching categories", "error");
      } finally {
        setLoadingData(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [currenciesData, paymentTermsData] = await Promise.all([
        fetchCurrencies(),
        fetchPaymentTerms(),
      ]);
      setCurrencies(currenciesData || []);
      setPaymentTerms(paymentTermsData || []);
    } catch (error) {
      Alert("Error fetching data", "error");
    } finally {
      setLoadingData(false);
    }
  }, [Alert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      isVendor: pageTabValue === "Vendors",
      isCustomer: pageTabValue === "Customers",
      isPartner: pageTabValue === "Partners",
    }));
  }, [pageTabValue]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name) {
      errors.name = "Name is required.";
    }
    if (formData.website && !isURL(formData.website)) {
      errors.website = "Invalid website URL.";
    }
    if (formData.email && !isEmail(formData.email)) {
      errors.email = "Invalid email address.";
    }
    if (
      formData.phoneNumber &&
      !isPhoneNumber(formData.phoneNumber) &&
      !isPhoneNumber(`+${formData.phoneNumber}`)
    ) {
      errors.phoneNumber = "Invalid phone number.";
    }
    if (
      formData.alternatePhone &&
      !isPhoneNumber(formData.alternatePhone) &&
      !isPhoneNumber(`+${formData.alternatePhone}`)
    ) {
      errors.alternatePhone = "Invalid alternate phone number.";
    }
    return errors;
  };

  const handleCreateCompany = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Alert("Please correct the form errors.", "error");
      return;
    }
    setFormErrors({});
    setIsCreating(true);
    try {
      const payload = {
        name: formData.name,
        contactName: formData.contactName,
        phoneNumber: formData.phoneNumber,
        alternatePhone: formData.alternatePhone,
        website: formData.website,
        taxId: formData.taxId,
        currencyCode: formData.currencyId?.code || "",
        qualityScore: formData.qualityScore,
        category: formData.category?.name || "",
        department: formData.department,
        paymentTermId: formData.paymentTermId?.id || null,
        currencyId: formData.currencyId?.id || null,
        logoUrl: formData.logoUrl,
        notes: formData.notes,
        totalOrders: formData.totalOrders,
        totalSpent: formData.totalSpent,
        avgOrderValue: formData.avgOrderValue,
        onTimeDeliveryRate: formData.onTimeDeliveryRate,
        memberSince: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        email: formData.email,
        isVendor: formData.isVendor,
        isCustomer: formData.isCustomer,
        isPartner: formData.isPartner,
      };
      await createCompany(payload);
      Alert("Company created successfully!", "success");
      fetchCompanyData();
      setPageDrawer(null);
    } catch (error) {
      Alert(`Failed to create company: ${error.message}`, "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseClick = () => {
    setPageDrawer(null);
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>New {pageTabValue}</h2>
        <button
          onClick={() => {
            setPageDrawer(null);
          }}
        >
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      <div className="CreateFlyoutBodyVendors">
        <TextField
          label="Name"
          className="AdminTextFeilds"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!formErrors.name}
          helperText={formErrors.name}
          required
        />
        <TextField
          label="Contact Name"
          name="contactName"
          className="AdminTextFeilds"
          value={formData.contactName}
          onChange={handleChange}
        />
        <TextField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          className="AdminTextFeilds"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={!!formErrors.phoneNumber}
          helperText={formErrors.phoneNumber}
        />
        <TextField
          label="Alternate Phone Number"
          name="alternatePhone"
          type="tel"
          className="AdminTextFeilds"
          value={formData.alternatePhone}
          onChange={handleChange}
          error={!!formErrors.alternatePhone}
          helperText={formErrors.alternatePhone}
        />
        <TextField
          label="Email"
          name="email"
          placeholder="e.g., example@domain.com"
          className="AdminTextFeilds"
          value={formData.email}
          onChange={handleChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
        />
        <TextField
          label="Tax Number"
          name="taxId"
          className="AdminTextFeilds"
          value={formData.taxId}
          onChange={handleChange}
        />
        <TextField
          label="Department"
          name="department"
          className="AdminTextFeilds"
          value={formData.department}
          onChange={handleChange}
        />
        <TextField
          label="Logo URL"
          name="logoUrl"
          className="AdminTextFeilds"
          value={formData.logoUrl}
          onChange={handleChange}
        />
        <Autocomplete
          options={currencies}
          getOptionLabel={(option) => option.code || ""}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={formData.currencyId}
          onChange={(e, newValue) =>
            setFormData((prev) => ({ ...prev, currencyId: newValue }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Currency"
              className="AdminTextFeilds"
            />
          )}
        />
        <Autocomplete
          options={paymentTerms}
          getOptionLabel={(option) => option.name || ""}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={formData.paymentTermId}
          onChange={(e, newValue) =>
            setFormData((prev) => ({ ...prev, paymentTermId: newValue }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Payment Term"
              className="AdminTextFeilds"
            />
          )}
        />
        <Autocomplete
          options={categoryTypes}
          getOptionLabel={(option) => option.name || ""}
          isOptionEqualToValue={(option, value) => option.name === value.name}
          value={formData.category}
          onChange={(e, newValue) =>
            setFormData((prev) => ({ ...prev, category: newValue }))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              className="AdminTextFeilds"
            />
          )}
        />
        <TextField
          label="Website"
          name="website"
          className="AdminTextFeilds"
          value={formData.website}
          onChange={handleChange}
          error={!!formErrors.website}
          helperText={formErrors.website}
          placeholder="e.g., www.example.com"
        />
        <TextField
          label="Notes"
          name="notes"
          className="AdminTextFeilds full-width"
          value={formData.notes}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />
      <div className="VendorCheckBoxGroup create">
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isVendor}
                onChange={handleChange}
                name="isVendor"
              />
            }
            disabled={!hasPermission(PERMISSIONS.VENDORS.MODIFY)}
            label="Vendor"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isCustomer}
                onChange={handleChange}
                name="isCustomer"
              />
            }
            disabled={!hasPermission(PERMISSIONS.CUSTOMERS.MODIFY)}
            label="Customer"
          />
          <FormControlLabel
            disabled={!hasPermission(PERMISSIONS.PARTNERS.MODIFY)}
            control={
              <Checkbox
                checked={formData.isPartner}
                onChange={handleChange}
                name="isPartner"
              />
            }
            label="Partner"
          />
        </div>
      </div>
      <div className="CreateFlyoutFooter">
        <Button
          className="CancelButton"
          onClick={handleCloseClick}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button onClick={handleCreateCompany} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create"}
        </Button>
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default CreateCompany;
