import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  RadioGroup,
  Radio,
  FormLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import { createCompany } from "../../../services/companyService";
import { createDocumentWithEntity } from "../../../services/documentsService";
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

const MSME_CERTIFICATE_ACCEPT = ".pdf,.jpg,.jpeg,.png";

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CreateCompany = ({ pageTabValue, setPageDrawer, fetchCompanyData }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const canModifyVendors = hasPermission(PERMISSIONS.VENDORS.MODIFY);
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
    isMsmeCertified: null,
    email: "",
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    onTimeDeliveryRate: 0,
  });
  const [formErrors, setFormErrors] = useState({});
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [msmeCertificateFile, setMsmeCertificateFile] = useState(null);

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
      isMsmeCertified: pageTabValue === "Vendors" ? prev.isMsmeCertified : null,
    }));
    if (pageTabValue !== "Vendors") {
      setMsmeCertificateFile(null);
    }
  }, [pageTabValue]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isVendor" && !checked ? { isMsmeCertified: null } : {}),
    }));
    if (name === "isVendor" && !checked) {
      setMsmeCertificateFile(null);
    }
  };

  const handleMsmeCertifiedChange = (e) => {
    const isYes = e.target.value === "yes";
    setFormData((prev) => ({ ...prev, isMsmeCertified: isYes }));
    if (!isYes) {
      setMsmeCertificateFile(null);
      setFormErrors((prev) => ({ ...prev, msmeCertificate: undefined }));
    }
  };

  const handleMsmeCertificateFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    // Reset the input value so picking the same file again still fires onChange.
    e.target.value = "";
    if (!file) return;
    setMsmeCertificateFile(file);
    setFormErrors((prev) => ({ ...prev, msmeCertificate: undefined }));
  };

  const handleMsmeCertificateRemove = () => {
    setMsmeCertificateFile(null);
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
    if (
      formData.isVendor &&
      formData.isMsmeCertified === true &&
      !msmeCertificateFile
    ) {
      errors.msmeCertificate =
        "MSME certificate is required when MSME certified is Yes.";
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
        isMsmeCertified: formData.isVendor ? formData.isMsmeCertified : null,
      };
      const created = await createCompany(payload);
      // The alert context holds a single slot, so collect the outcome here and
      // raise exactly one message below.
      let certUploadFailed = false;
      if (
        formData.isVendor &&
        formData.isMsmeCertified === true &&
        msmeCertificateFile
      ) {
        if (!created?.id) {
          certUploadFailed = true;
        } else {
          try {
            const docFormData = new FormData();
            docFormData.append("documentFiles[0].entityId", created.id);
            // Guarded by formData.isVendor above, so this matches what the
            // Documents tab derives for the same company.
            docFormData.append("documentFiles[0].entityType", "Vendors");
            docFormData.append(
              "documentFiles[0].documentType",
              "MSME Certificate"
            );
            docFormData.append(
              "documentFiles[0].documentFile",
              msmeCertificateFile
            );
            await createDocumentWithEntity(docFormData);
          } catch (docError) {
            certUploadFailed = true;
          }
        }
      }
      Alert(
        certUploadFailed
          ? "Company created, but the MSME certificate upload failed. Please attach it from the Documents tab."
          : "Company created successfully!",
        certUploadFailed ? "warning" : "success"
      );
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
          {formData.isVendor && (
            <div className="MsmeCertifiedRow">
              <div className="MsmeCertifiedInline">
                <FormLabel component="legend" className="MsmeCertifiedLabel">
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
                  onChange={handleMsmeCertifiedChange}
                >
                  <FormControlLabel
                    value="yes"
                    control={<Radio />}
                    label="Yes"
                    disabled={!canModifyVendors}
                  />
                  <FormControlLabel
                    value="no"
                    control={<Radio />}
                    label="No"
                    disabled={!canModifyVendors}
                  />
                </RadioGroup>
              </div>
              {formData.isMsmeCertified === true && (
                <div className="MsmeCertificateUpload">
                  {!msmeCertificateFile ? (
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      startIcon={<AttachFileIcon />}
                      disabled={!canModifyVendors}
                      className={`MsmeUploadButton${
                        formErrors.msmeCertificate ? " error" : ""
                      }`}
                    >
                      Upload Certificate *
                      <input
                        type="file"
                        hidden
                        accept={MSME_CERTIFICATE_ACCEPT}
                        onChange={handleMsmeCertificateFileChange}
                      />
                    </Button>
                  ) : (
                    <div className="MsmeFileChip">
                      <InsertDriveFileIcon className="MsmeFileChipIcon" />
                      <Tooltip title={msmeCertificateFile.name}>
                        <span className="MsmeFileChipName">
                          {msmeCertificateFile.name}
                        </span>
                      </Tooltip>
                      <span className="MsmeFileChipSize">
                        {formatFileSize(msmeCertificateFile.size)}
                      </span>
                      <Button
                        component="label"
                        size="small"
                        className="MsmeFileChipAction"
                        disabled={!canModifyVendors}
                      >
                        Replace
                        <input
                          type="file"
                          hidden
                          accept={MSME_CERTIFICATE_ACCEPT}
                          onChange={handleMsmeCertificateFileChange}
                        />
                      </Button>
                      <Tooltip title="Remove">
                        <IconButton
                          size="small"
                          className="MsmeFileChipRemove"
                          onClick={handleMsmeCertificateRemove}
                          aria-label="Remove MSME certificate"
                          disabled={!canModifyVendors}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
                  {formErrors.msmeCertificate && (
                    <div className="MsmeCertificateError">
                      {formErrors.msmeCertificate}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
