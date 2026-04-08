import React, { useContext, useState, useEffect } from "react";
import { AlertsContext } from "../../AlertsContext/Context";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { createCompanyContact } from "../../../services/contactService";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";

const NewContact = ({ handleCloseClick, handleRefresh, contactData }) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    notes: "",
    alternatePhone: "",
    companyName: "",
    companyId: null,
    jobTitle: "",
    contactType: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const contactTypes = [
    { name: "Primary" },
    { name: "Secondary" },
    { name: "Billing" },
    { name: "Technical" },
  ];

  // Extract unique companies from contactData
  const companyOptions = Array.from(
    new Map(
      (contactData || [])
        .filter((c) => c.company && c.company.id && c.company.name)
        .map((c) => [c.company.id, { id: c.company.id, name: c.company.name }])
    ).values()
  );

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === "phoneNumber" || name === "alternatePhone") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "firstName" || name === "lastName") {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]:
          value.trim() === ""
            ? `${name === "firstName" ? "First" : "Last"} Name is required`
            : "",
      }));
    }

    if (submitted) {
      const newErrors = { ...formErrors };

      if (name === "phoneNumber") {
        newErrors.phoneNumber =
          value && !/^\d{10}$/.test(value)
            ? "Phone number must be exactly 10 digits"
            : "";
      }

      if (name === "alternatePhone") {
        newErrors.alternatePhone =
          value && !/^\d{10}$/.test(value)
            ? "Alternate phone number must be exactly 10 digits"
            : "";
      }

      setFormErrors(newErrors);
    }

    if (name === "email") {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        email:
          value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
            ? "Invalid email address"
            : "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";

    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits";
    }
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
      newErrors.alternatePhone =
        "Alternate phone number must be exactly 10 digits";
    }

    if (
      formData.email &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.contactType) {
      newErrors.contactType = "Contact Type is required";
    }

    if (!formData.companyId) {
      newErrors.companyName = "Company Name is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      notes: "",
      alternatePhone: "",
      companyName: "",
      companyId: null,
      jobTitle: "",
      contactType: null,
    });
    setFormErrors({});
    setSubmitted(false);
  };

  const handleCreateContact = async () => {
    setSubmitted(true);
    if (!validate()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);
    try {
      await createCompanyContact({
        id: formData.companyId,
        contactType: formData.contactType,
        contact: {
          ...formData,
          companyId: undefined,
        },
      });
      Alert("Contact Added Successfully!", "success");
      handleRefresh();
      resetForm();
      handleCloseClick();
    } catch (error) {
      console.error("Error creating contact:", error);
      Alert("Failed to Add Contact", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Contact</h2>
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
          <div className="CreateFlyoutBodyVendors">
            <TextField
              className="AdminTextFeilds"
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              required
            />
            <TextField
              className="AdminTextFeilds"
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              error={!!formErrors.lastName}
              required
              helperText={formErrors.lastName}
            />
            <TextField
              className="AdminTextFeilds"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              required
              helperText={formErrors.email}
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
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  contactType: newVal ? "" : "Contact Type is required",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Contact Type"
                  error={!!formErrors.contactType}
                  helperText={formErrors.contactType}
                  required
                />
              )}
            />

            <Autocomplete
              options={companyOptions}
              getOptionLabel={(opt) => opt.name || ""}
              value={
                companyOptions.find((c) => c.id === formData.companyId) || null
              }
              isOptionEqualToValue={(option, value) =>
                option.id === (value?.id || value)
              }
              onChange={(_, newVal) => {
                setFormData((prev) => ({
                  ...prev,
                  companyName: newVal ? newVal.name : "",
                  companyId: newVal ? newVal.id : null,
                }));
                setFormErrors((prev) => ({
                  ...prev,
                  companyName: newVal ? "" : "Company Name is required",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Company Name"
                  error={!!formErrors.companyName}
                  helperText={formErrors.companyName}
                  required
                />
              )}
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
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
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
              error={!!formErrors.alternatePhone}
              helperText={formErrors.alternatePhone}
            />
            <TextField
              className="AdminTextFeilds"
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Notes"
              className="AdminTextFeilds full-width"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>
            <Button onClick={handleCreateContact} disabled={loadingData}>
              {loadingData ? "Creating..." : "Create"}
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

export default NewContact;
