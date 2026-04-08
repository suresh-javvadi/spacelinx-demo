import React, { useContext, useState, useEffect } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { UpdateCompanyContact } from "../../../services/contactService";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { fetchCompanyContactByVendorId } from "../../../services/companyContactService";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useUserContext } from "../../userContext/UserContext";

const EditContact = ({ handleCloseClick, handleRefresh, contactData }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    notes: "",
    alternatePhone: "",
    jobTitle: "",
    companyName: "",
    contactType: null,
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [rows, setRows] = useState([]);

  const contactTypes = [
    { name: "Primary" },
    { name: "Secondary" },
    { name: "Billing" },
    { name: "Technical" },
  ];

  const requiredFields = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    contactType: "Contact Type",
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "phoneNumber") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        phoneNumber:
          value.trim() !== "" && !/^\d{10}$/.test(value.trim())
            ? "Phone number must be exactly 10 digits"
            : "",
      }));
    }

    if (name === "alternatePhone") {
      setErrors((prevErrors) => ({
        ...prevErrors,
        alternatePhone:
          value.trim() !== "" && !/^\d{10}$/.test(value.trim())
            ? "Alternate phone number must be exactly 10 digits"
            : "",
      }));
    }

    if (requiredFields[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: value.trim() ? "" : `${requiredFields[name]} is required`,
      }));
    }
  };

  const validateFields = () => {
    const newErrors = {};
    Object.keys(requiredFields).forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${requiredFields[field]} is required`;
      }
    });

    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = "Invalid email format";
      }
    }

    if (formData.phoneNumber.trim()) {
      if (!/^\d{10}$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      }
    }

    if (formData.alternatePhone.trim()) {
      if (!/^\d{10}$/.test(formData.alternatePhone.trim())) {
        newErrors.alternatePhone =
          "Alternate phone number must be exactly 10 digits.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditContact = async () => {
    if (!contactData || !editId) return;
    if (!validateFields()) {
      Alert("Please fill in all required fields", "error");
      return;
    }

    setLoadingData(true);

    try {
      const isPrimary = formData.contactType === "Primary";
      const { companyName, contactType, ...contactFields } = formData;
      const payload = {
        id: contactData?.contactId,
        contactType: formData.contactType,
        contact: {
          id: contactData?.contactId,
          ...contactFields,
          isPrimary,
        },
      };
      await UpdateCompanyContact(contactData?.companyId, payload);
      fetchContacts();
      Alert("Contact updated successfully!", "success");
      handleRefresh();
      setReadOnlyMode(true);
      handleCloseClick();
    } catch (error) {
      Alert("Error updating contact", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const data = await fetchCompanyContactByVendorId(contactData?.companyId);
      setRows(data || []);
    } catch (error) {
      Alert("Failed to fetch contacts", "error");
      setRows([]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (contactData) {
      setFormData({
        firstName: contactData?.contact?.firstName || "",
        lastName: contactData?.contact?.lastName || "",
        email: contactData?.contact?.email || "",
        phoneNumber: contactData?.contact?.phoneNumber || "",
        notes: contactData?.contact?.notes || "",
        alternatePhone: contactData?.contact?.alternatePhone || "",
        companyName: contactData.company?.name || "",
        jobTitle: contactData?.contact?.jobTitle || "",
        contactType: contactData.contactType
          ? contactData.contactType
          : contactData.isPrimary
          ? "Primary"
          : "",
      });
      setEditId(contactData.id || null);
    }
  }, [contactData]);

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h2>Edit Contact</h2>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.CONTACTS.MODIFY)) {
                Alert("You don't have permission to edit Tool", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon
              name="create-outline"
              class={
                !hasPermission(PERMISSIONS.CONTACTS.MODIFY)
                  ? "IonIconDisabled"
                  : undefined
              }
            ></ion-icon>
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
        <>
          <div
            style={{
              marginTop: "50px",
              marginLeft: "20px",
              marginBottom: "20px",
            }}
          >
            {" "}
            <div className="row">
              <p className="label">Company</p>
              <p className="separator">:</p>
              <p className="value">{formData.companyName}</p>
            </div>
            <div className="EditFlyoutBodyContacts">
              <TextField
                className="AdminTextFeilds"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                error={!!errors.firstName}
                helperText={errors.firstName}
                required
                disabled={readOnlyMode}
              />
              <TextField
                className="AdminTextFeilds"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={!!errors.lastName}
                required
                helperText={errors.lastName}
                disabled={readOnlyMode}
              />
              <TextField
                className="AdminTextFeilds"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                required
                helperText={errors.email}
                disabled={readOnlyMode}
              />
              <Autocomplete
                options={contactTypes}
                getOptionLabel={(opt) => opt.name || ""}
                value={
                  contactTypes.find((t) => t.name === formData.contactType) ||
                  null
                }
                isOptionEqualToValue={(option, value) =>
                  option.name === (value?.name || value)
                }
                onChange={(_, newVal) => {
                  setFormData((prev) => ({
                    ...prev,
                    contactType: newVal ? newVal.name : null,
                    isPrimary: newVal && newVal.name === "Primary",
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    contactType: newVal ? "" : "Contact Type is required",
                  }));
                }}
                getOptionDisabled={(option) =>
                  option.name === "Primary" &&
                  contactData &&
                  contactData?.contact?.isPrimary !== undefined &&
                  !contactData?.contact?.isPrimary
                    ? false
                    : option.name === "Primary" &&
                      contactData &&
                      contactData?.contact?.isPrimary
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Contact Type"
                    error={!!errors.contactType}
                    helperText={errors.contactType}
                    required
                  />
                )}
                disabled={readOnlyMode}
              />

              <TextField
                className="AdminTextFeilds"
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 10);
                }}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                disabled={readOnlyMode}
              />
              <TextField
                className="AdminTextFeilds"
                label="Alternate Phone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleInputChange}
                onInput={(e) => {
                  e.target.value = e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 10);
                }}
                disabled={readOnlyMode}
                error={!!errors.alternatePhone}
                helperText={errors.alternatePhone}
              />
              <TextField
                className="AdminTextFeilds"
                label="Job Title"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                disabled={readOnlyMode}
              />
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Notes"
                name="notes"
                className="AdminTextFeilds full-width"
                value={formData.notes}
                onChange={handleInputChange}
                disabled={readOnlyMode}
              />
            </div>
          </div>

          {!readOnlyMode && (
            <div className="CreateFlyoutFooter">
              <Button onClick={handleCloseClick} className="CancelButton">
                Cancel
              </Button>
              <Button onClick={handleEditContact} disabled={loadingData}>
                {loadingData ? "Updating..." : "Update"}
              </Button>
            </div>
          )}

          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default EditContact;
