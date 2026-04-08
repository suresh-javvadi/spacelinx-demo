import React, { useContext, useState } from "react";
import { TextField, Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { createPaymentTerm } from "../../../services/paymentTermService";
import "../../Administration/Adminstration.css";
import "../../features.css";
import "../../ContactHub/Staff/Staff.css";
import "../../materialKits/Kits.css";

const NewPaymentTerm = ({ handleClose, handleRefresh, existingTerms }) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDays: "",
    discountDays: "",
    discountPercent: "",
    paymentTerms: "",
    paymentTermType: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let message = "";

    if (name === "name") {
      if (!value.trim()) message = "Required";
      else if (value.length > 50) message = "Max 50 characters allowed";
      else if (
        existingTerms.some(
          (term) =>
            term.name.toLowerCase().trim() === value.toLowerCase().trim()
        )
      )
        message = "Duplicate name not allowed";
    }

    if (name === "description") {
      if (!value.trim()) message = "Required";
      else if (value.length > 100) message = "Max 100 characters allowed";
      else if (
        existingTerms.some(
          (term) =>
            term.description.toLowerCase().trim() === value.toLowerCase().trim()
        )
      )
        message = "Duplicate description not allowed";
    }

    if (name === "dueDays") {
      if (value === "") message = "Required";
      else if (isNaN(value) || Number(value) < 0)
        message = "Due days must be a number ≥ 0";
    }

    if (name === "discountDays") {
      if (value !== "" && (isNaN(value) || Number(value) < 0))
        message = "Discount days must be ≥ 0";
    }

    if (name === "discountPercent") {
      const val = parseFloat(value);
      if (value !== "") {
        if (isNaN(val) || val < 0 || val > 100)
          message = "Must be between 0 and 100";
        else if (!/^\d{1,3}(\.\d{1,2})?$/.test(value))
          message = "Max 2 decimal places allowed";
      }
    }

    if (name === "paymentTermType") {
      if (!value.trim()) message = "Required";
      else if (value.length > 100) message = "Max 100 characters allowed";
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const validate = () => {
    const newErrors = {};

    const nameExists = existingTerms.some(
      (term) =>
        term.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    );

    if (!formData.name.trim()) newErrors.name = "Required";
    else if (formData.name.length > 50)
      newErrors.name = "Max 50 characters allowed";
    else if (nameExists) newErrors.name = "Duplicate name not allowed";

    if (formData.dueDays === "") newErrors.dueDays = "Required";
    else if (isNaN(formData.dueDays) || Number(formData.dueDays) < 0)
      newErrors.dueDays = "Due days must be a number ≥ 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert("Please fix validation errors", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDays: parseInt(formData.dueDays) || 0,
        discountDays: parseInt(formData.discountDays) || 0,
        discountPercent: parseFloat(formData.discountPercent) || 0,
        paymentTerms: formData.paymentTerms || null,
        paymentTermType: formData.paymentTermType.trim(),
      };

      await createPaymentTerm(payload);
      Alert("Payment Term created successfully!", "success");
      handleClose();
      handleRefresh();
    } catch (error) {
      console.error("Creation error:", error);
      Alert("Failed to create Payment Term", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>New Payment Term</h2>
        <button onClick={handleClose}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="CreateFlyoutBody">
        <h3>Enter the details</h3>
        <div className="CreateFlyoutBodyTwoColumns">
          <TextField
            label="Label"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 50 }}
            error={!!errors.name}
            helperText={errors.name}
          />{" "}
          <TextField
            label="Due Days"
            name="dueDays"
            type="number"
            value={formData.dueDays}
            onChange={handleChange}
            required
            error={!!errors.dueDays}
            helperText={errors.dueDays}
          />{" "}
          {/* <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            inputProps={{ maxLength: 100 }}
            error={!!errors.description}
            helperText={errors.description}
          />
          <TextField
            label="Payment Term Type"
            name="paymentTermType"
            value={formData.paymentTermType}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 100 }}
            error={!!errors.paymentTermType}
            helperText={errors.paymentTermType}
          />
          <TextField
            label="Discount Days"
            name="discountDays"
            type="number"
            value={formData.discountDays}
            onChange={handleChange}
            error={!!errors.discountDays}
            helperText={errors.discountDays}
          />
          <TextField
            label="Discount Percent"
            name="discountPercent"
            type="number"
            value={formData.discountPercent}
            onChange={handleChange}
            error={!!errors.discountPercent}
            helperText={errors.discountPercent}
          /> */}
        </div>{" "}
        <TextField
          label="Terms and Conditions"
          name="paymentTerms"
          value={formData.paymentTerms}
          onChange={handleChange}
          multiline
          minRows={10}
        />{" "}
        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          inputProps={{ maxLength: 100 }}
          error={!!errors.description}
          helperText={errors.description}
        />
      </div>

      <div className="CreateFlyoutFooter">
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          Create
        </Button>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewPaymentTerm;
