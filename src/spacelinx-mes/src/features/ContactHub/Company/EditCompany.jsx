import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Tab,
  TextField,
  Button,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import "./Company.css";
import { updateCompany } from "../../../services/companyService";
import { AlertsContext } from "../../AlertsContext/Context";
import Documents from "../../../Components/Documents/Documents";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { fetchCurrencies } from "../../../services/currencyService";
import { fetchPaymentTerms } from "../../../services/paymentTermService";
import EditAddress from "./EditAddress";
import EditContacts from "./EditContacts";
import EditBankDetails from "./EditBankDetails";
import CompanyParts from "./CompanyParts";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import Cliploader from "../../../Components/Loaders/Cliploader";

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

// Documents are stored against a company with an entityType. Derive it from the
// company's own flags rather than the list tab it was opened from, so the same
// company always resolves to the same value. A company can carry more than one
// flag, so the order below is the precedence.
const getCompanyEntityType = (company) => {
  if (company?.isVendor) return "Vendors";
  if (company?.isCustomer) return "Customers";
  if (company?.isPartner) return "Partners";
  return "Companies";
};

const EditCompany = ({
  setPageDrawer,
  selectedCompanyData,
  fetchCompanyData,
  pageTabValue,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [loadingData, setLoadingData] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [readOnlyMode, setReadOnlyMode] = useState(true);
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

  const fetchLookups = useCallback(async () => {
    try {
      const [currencyLookup, paymentTermLookup] = await Promise.all([
        fetchCurrencies(),
        fetchPaymentTerms(),
      ]);
      setCurrencies(currencyLookup || []);
      setPaymentTerms(paymentTermLookup || []);
    } catch (error) {
      Alert("Error fetching lookup data", "error");
    } finally {
      setLoadingData(false);
    }
  }, [Alert]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    if (selectedCompanyData) {
      setFormData({
        ...selectedCompanyData,
        currencyId:
          currencies.find((c) => c.id === selectedCompanyData.currencyId) ||
          null,
        paymentTermId:
          paymentTerms.find(
            (p) => p.id === selectedCompanyData.paymentTermId,
          ) || null,
        category:
          categoryTypes.find((c) => c.name === selectedCompanyData.category) ||
          null,
      });
    }
  }, [selectedCompanyData, currencies, paymentTerms, categoryTypes]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // MSME applies to vendors only — drop the flag rather than persisting a
      // stale answer the form can no longer show.
      ...(name === "isVendor" && !checked ? { isMsmeCertified: null } : {}),
    }));
  };

  const handleTabChange = (event, newValue) => {
    setEditFlyOutTabsValue(newValue);
  };

  const validate = () => {
    const errors = {};
    if (!formData.name) {
      errors.name = "Company name is required.";
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

  const handleUpdate = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Alert("Please correct the form errors.", "error");
      return;
    }
    setFormErrors({});
    setIsUpdating(true);
    try {
      const payload = {
        ...formData,
        currencyId: formData.currencyId?.id,
        paymentTermId: formData.paymentTermId?.id,
        category: formData.category?.name,
        currencyCode: formData.currencyId?.code,
        memberSince: selectedCompanyData.memberSince,
        lastActivityDate: new Date().toISOString(),
      };
      await updateCompany(selectedCompanyData?.id, payload);
      Alert("Company updated successfully!", "success");
      fetchCompanyData();
      setPageDrawer(null);
      setReadOnlyMode(true);
    } catch (error) {
      Alert(`Failed to update company: ${error.message}`, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = () => {
    setReadOnlyMode(false);
  };

  const onUpdateField = (id, data) => {
    setFormData((prev) => ({ ...prev, [id]: data }));
  };

  return (
    <div className="EditFlyout">
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="EditFlyoutHeader">
            <h3
              style={{
                marginLeft: "10px",
              }}
            >
              {pageTabValue === "Customers"
                ? `${selectedCompanyData?.customerCode || ""} - ${
                    selectedCompanyData?.name || ""
                  }`
                : pageTabValue === "Vendors"
                  ? `${selectedCompanyData?.vendorCode || ""} - ${
                      selectedCompanyData?.name || ""
                    }`
                  : pageTabValue === "Partners"
                    ? `${selectedCompanyData?.partnerCode || ""} - ${
                        selectedCompanyData?.name || ""
                      }`
                    : `${selectedCompanyData?.companyCode || ""} - ${
                        selectedCompanyData?.name || ""
                      }`}
            </h3>
            <div className="EditFlyoutHeaderIcons">
              {editFlyOutTabsValue === "1" && (
                <button
                  onClick={handleEditClick}
                  // onClick={() => {
                  //   if (canModifyVendors) {
                  //     setReadOnlyMode(false);
                  //   } else {
                  //     Alert(
                  //       "You do not have access to Edit the Vendors ..! ",
                  //       "warning"
                  //     );
                  //   }
                  // }}
                >
                  <ion-icon
                    name="create-outline"
                    // class={!canModifyVendors ? "IonIconDisabled" : undefined}
                  ></ion-icon>
                </button>
              )}
              <button onClick={() => setPageDrawer(null)}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>
          </div>
          <TabContext value={editFlyOutTabsValue}>
            <Box className="EditFlyoutTabsPanel">
              <TabList
                onChange={handleTabChange}
                aria-label="edit tabs"
                className="Tabs"
              >
                <Tab label="Company" value="1" />
                <Tab label="Address" value="2" />
                <Tab label="Contacts" value="3" />
                <Tab label="Bank Details" value="4" />
                {pageTabValue === "Vendors" && <Tab label="Parts" value="5" />}
                <Tab label="Documents" value="6" />
              </TabList>
            </Box>
            <TabPanel value="1" className="EditFlyoutTabPanel">
              <div
                className={
                  readOnlyMode ? "EditFlyoutBody2" : "EditFlyoutBody2WithFooter"
                }
              >
                <TextField
                  label="Name"
                  className="AdminTextFeilds"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Contact Name"
                  name="contactName"
                  className="AdminTextFeilds"
                  value={formData.contactName || ""}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  className="AdminTextFeilds"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  error={!!formErrors.phoneNumber}
                  helperText={formErrors.phoneNumber}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Alternate Phone Number"
                  name="alternatePhone"
                  type="tel"
                  className="AdminTextFeilds"
                  value={formData.alternatePhone || ""}
                  onChange={handleChange}
                  error={!!formErrors.alternatePhone}
                  helperText={formErrors.alternatePhone}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Email"
                  name="email"
                  placeholder="e.g., example@domain.com"
                  className="AdminTextFeilds"
                  value={formData.email || ""}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Tax Number"
                  name="taxId"
                  className="AdminTextFeilds"
                  value={formData.taxId || ""}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Department"
                  name="department"
                  className="AdminTextFeilds"
                  value={formData.department || ""}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Logo URL"
                  name="logoUrl"
                  className="AdminTextFeilds"
                  value={formData.logoUrl || ""}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Quality Score"
                  name="qualityScore"
                  type="number"
                  className="AdminTextFeilds"
                  value={formData.qualityScore || 0}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <Autocomplete
                  options={currencies}
                  getOptionLabel={(option) => option.code || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  value={formData.currencyId}
                  onChange={(e, newValue) =>
                    onUpdateField("currencyId", newValue)
                  }
                  disabled={readOnlyMode}
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
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  value={formData.paymentTermId}
                  onChange={(e, newValue) =>
                    onUpdateField("paymentTermId", newValue)
                  }
                  disabled={readOnlyMode}
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
                  isOptionEqualToValue={(option, value) =>
                    option.name === value.name
                  }
                  value={formData.category}
                  onChange={(e, newValue) =>
                    onUpdateField("category", newValue)
                  }
                  disabled={readOnlyMode}
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
                  value={formData.website || ""}
                  onChange={handleChange}
                  error={!!formErrors.website}
                  helperText={formErrors.website}
                  placeholder="e.g., www.example.com"
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Total Orders"
                  name="totalOrders"
                  type="number"
                  className="AdminTextFeilds"
                  value={formData.totalOrders || 0}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Total Spent"
                  name="totalSpent"
                  type="number"
                  className="AdminTextFeilds"
                  value={formData.totalSpent || 0}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="Avg Order Value"
                  name="avgOrderValue"
                  type="number"
                  className="AdminTextFeilds"
                  value={formData.avgOrderValue || 0}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                <TextField
                  label="On Time Delivery Rate"
                  name="onTimeDeliveryRate"
                  type="number"
                  className="AdminTextFeilds"
                  value={formData.onTimeDeliveryRate || 0}
                  onChange={handleChange}
                  disabled={readOnlyMode}
                />
                {formData.isVendor && (
                  <TextField
                    label="PAN Number"
                    name="panNumber"
                    className="AdminTextFeilds"
                    value={formData.panNumber || ""}
                    onChange={handleChange}
                    disabled={readOnlyMode}
                  />
                )}
                <TextField
                  label="Notes"
                  name="notes"
                  className="AdminTextFeilds full-width"
                  value={formData.notes || ""}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={readOnlyMode}
                />
                <div className="VendorCheckBoxGroup edit">
                  <FormControlLabel
                    disabled={
                      !hasPermission(PERMISSIONS.VENDORS.MODIFY) || readOnlyMode
                    }
                    control={
                      <Checkbox
                        checked={!!formData.isVendor}
                        name="isVendor"
                        onChange={handleChange}
                      />
                    }
                    label="Vendor"
                  />
                  <FormControlLabel
                    disabled={
                      !hasPermission(PERMISSIONS.CUSTOMERS.MODIFY) ||
                      readOnlyMode
                    }
                    control={
                      <Checkbox
                        checked={!!formData.isCustomer}
                        name="isCustomer"
                        onChange={handleChange}
                      />
                    }
                    label="Customer"
                  />
                  <FormControlLabel
                    disabled={
                      !hasPermission(PERMISSIONS.PARTNERS.MODIFY) ||
                      readOnlyMode
                    }
                    control={
                      <Checkbox
                        checked={!!formData.isPartner}
                        name="isPartner"
                        onChange={handleChange}
                      />
                    }
                    label="Partner"
                  />
                  {formData.isVendor && (
                    <div className="MsmeCertifiedRow">
                      <div className="MsmeCertifiedInline">
                        <FormLabel
                          component="legend"
                          className="MsmeCertifiedLabel"
                        >
                          Is it MSME certified?
                        </FormLabel>
                        <RadioGroup
                          row
                          name="isMsmeCertified"
                          value={
                            formData.isMsmeCertified === true
                              ? "yes"
                              : formData.isMsmeCertified === false
                                ? "no"
                                : ""
                          }
                          onChange={(e) =>
                            onUpdateField(
                              "isMsmeCertified",
                              e.target.value === "yes",
                            )
                          }
                        >
                          <FormControlLabel
                            value="yes"
                            control={<Radio />}
                            label="Yes"
                            disabled={
                              readOnlyMode ||
                              !hasPermission(PERMISSIONS.VENDORS.MODIFY)
                            }
                          />
                          <FormControlLabel
                            value="no"
                            control={<Radio />}
                            label="No"
                            disabled={
                              readOnlyMode ||
                              !hasPermission(PERMISSIONS.VENDORS.MODIFY)
                            }
                          />
                        </RadioGroup>
                      </div>
                      {formData.isMsmeCertified === true &&
                        !readOnlyMode &&
                        hasPermission(
                          PERMISSIONS.COMPANIES.DOCUMENTS.MODIFY
                        ) && (
                          <span className="MsmeCertificateHint">
                            Attach the certificate in the
                            <Button
                              variant="text"
                              size="small"
                              className="MsmeCertificateHintLink"
                              onClick={() => setEditFlyOutTabsValue("6")}
                            >
                              Documents
                            </Button>
                            tab.
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </div>
              {!readOnlyMode && (
                <div className="CreateFlyoutFooter">
                  <Button
                    className="CancelButton"
                    onClick={() => setPageDrawer(null)}
                  >
                    Cancel
                  </Button>
                  <Button disabled={isUpdating} onClick={handleUpdate}>
                    Update
                  </Button>
                </div>
              )}
            </TabPanel>
            <TabPanel value="2">
              <EditAddress selectedCompanyId={selectedCompanyData?.id} />
            </TabPanel>
            <TabPanel value="3">
              <EditContacts selectedCompanyId={selectedCompanyData?.id} />
            </TabPanel>
            <TabPanel value="4">
              <EditBankDetails selectedCompanyId={selectedCompanyData?.id} />
            </TabPanel>
            <TabPanel value="5">
              <CompanyParts selectedCompanyId={selectedCompanyData?.id} />
            </TabPanel>
            <TabPanel value="6">
              <Documents
                entityId={selectedCompanyData?.id}
                entityType={getCompanyEntityType(formData)}
                canEdit={hasPermission(PERMISSIONS.COMPANIES.DOCUMENTS.VIEW)}
                canUpload={
                  hasPermission(PERMISSIONS.COMPANIES.DOCUMENTS.MODIFY) &&
                  !readOnlyMode
                }
              />
            </TabPanel>
          </TabContext>
          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default EditCompany;
