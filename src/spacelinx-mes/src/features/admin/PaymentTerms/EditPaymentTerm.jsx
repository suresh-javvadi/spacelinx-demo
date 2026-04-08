import React, { useContext, useEffect, useState } from "react";
import { TextField, Button } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  updatePaymentTerm,
  deletePaymentTerm,
} from "../../../services/paymentTermService";
import ClipLoader from "react-spinners/ClipLoader";
import "../../Administration/Adminstration.css";
import { showConfirmation } from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import "../../features.css";
import "../../ContactHub/Staff/Staff.css";
import "../../materialKits/Kits.css";

const EditPaymentTerm = ({ selectedTerm, handleClose, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedTerm) {
      setFormData({
        name: selectedTerm.name || "",
        description: selectedTerm.description || "",
        dueDays: selectedTerm.dueDays || "",
        discountDays: selectedTerm.discountDays || "",
        discountPercent: selectedTerm.discountPercent || "",
        paymentTerms: selectedTerm.paymentTerms || "",
        paymentTermType: selectedTerm.paymentTermType || "",
      });
    }
  }, [selectedTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    let message = "";

    if (name === "name") {
      if (!value.trim()) message = "Required";
      else if (value.length > 50) message = "Max 50 characters allowed";
    }

    if (name === "description") {
      if (!value.trim()) message = "Required";
      else if (value.length > 100) message = "Max 100 characters allowed";
    }

    if (name === "dueDays") {
      if (value === "") message = "Required";
      else if (isNaN(value) || Number(value) < 0)
        message = "Due Days must be a number ≥ 0";
    }

    if (name === "discountDays") {
      if (value !== "" && (isNaN(value) || Number(value) < 0))
        message = "Discount Days must be ≥ 0";
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

  const handleResetClick = () => {
    if (selectedTerm) {
      setFormData({
        name: selectedTerm.name || "",
        description: selectedTerm.description || "",
        dueDays: selectedTerm.dueDays || "",
        discountDays: selectedTerm.discountDays || "",
        discountPercent: selectedTerm.discountPercent || "",
        paymentTerms: selectedTerm.paymentTerms || "",
        paymentTermType: selectedTerm.paymentTermType || "",
      });
      setErrors({});
    }
  };
  const handleDelete = async (id) => {
    const confirmed = await showConfirmation(
      "Remove Payment Term?",
      "Are you sure you want to delete this Payment Term?"
    );
    if (!confirmed) return;

    try {
      await deletePaymentTerm(id);
      Alert("Payment Term deleted successfully!", "success");
      handleRefresh();
      handleClose();
    } catch (error) {
      Alert("Failed to delete Payment Term", "error");
      console.error(error);
    }
  };
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Required";
    else if (formData.name.length > 50)
      newErrors.name = "Max 50 characters allowed";

    if (!formData.description.trim()) newErrors.description = "Required";
    else if (formData.description.length > 100)
      newErrors.description = "Max 100 characters allowed";

    if (formData.dueDays === "") newErrors.dueDays = "Required";
    else if (isNaN(formData.dueDays) || Number(formData.dueDays) < 0)
      newErrors.dueDays = "Due Days must be a number ≥ 0";

    if (formData.discountDays !== "") {
      if (isNaN(formData.discountDays) || Number(formData.discountDays) < 0)
        newErrors.discountDays = "Discount Days must be ≥ 0";
    }

    if (formData.discountPercent !== "") {
      const val = parseFloat(formData.discountPercent);
      if (isNaN(val) || val < 0 || val > 100)
        newErrors.discountPercent = "Must be between 0 and 100";
      else if (!/^\d{1,3}(\.\d{1,2})?$/.test(formData.discountPercent))
        newErrors.discountPercent = "Max 2 decimal places allowed";
    }

    if (!formData.paymentTermType.trim())
      newErrors.paymentTermType = "Required";
    else if (formData.paymentTermType.length > 100)
      newErrors.paymentTermType = "Max 100 characters allowed";

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
        id: selectedTerm.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        dueDays: parseInt(formData.dueDays) || 0,
        discountDays: parseInt(formData.discountDays) || 0,
        discountPercent: parseFloat(formData.discountPercent) || 0,
        paymentTerms: formData.paymentTerms || null,
        paymentTermType: formData.paymentTermType.trim(),
      };

      await updatePaymentTerm(selectedTerm.id, payload);
      Alert("Payment Term updated successfully!", "success");
      handleRefresh();
      handleClose();
    } catch (error) {
      console.error("Update error:", error);
      Alert("Failed to update Payment Term", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeaderNew">
        <h3>Edit Payment Term</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.PAYMENTTERMS.MODIFY)) {
                Alert("You do not have access to edit.", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button onClick={handleClose}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loader-container">
          <ClipLoader loading={loading} />
        </div>
      ) : (
        <div className="EditFlyoutBodyNew">
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
              disabled={readOnlyMode}
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
              disabled={readOnlyMode}
            />
            {/* <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 100 }}
              error={!!errors.description}
              helperText={errors.description}
              InputProps={{ readOnly: readOnlyMode }}
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
              InputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Discount Days"
              name="discountDays"
              type="number"
              value={formData.discountDays}
              onChange={handleChange}
              error={!!errors.discountDays}
              helperText={errors.discountDays}
              InputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Discount Percent"
              name="discountPercent"
              type="number"
              value={formData.discountPercent}
              onChange={handleChange}
              error={!!errors.discountPercent}
              helperText={errors.discountPercent}
              InputProps={{ readOnly: readOnlyMode }}
            />
            <TextField
              label="Payment Terms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              InputProps={{ readOnly: readOnlyMode }}
              multiline
              minRows={1}
            /> */}{" "}
          </div>
          <TextField
            label="Terms and Conditions"
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            disabled={readOnlyMode}
            multiline
            minRows={10}
          />{" "}
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 100 }}
            error={!!errors.description}
            helperText={errors.description}
            disabled={readOnlyMode}
          />
        </div>
      )}

      {!readOnlyMode && (
        <div className="EditFlyoutFooter">
          <ion-icon
            name="trash-outline"
            onClick={() => {
              if (!hasPermission(PERMISSIONS.PAYMENTTERMS.DELETE)) {
                Alert("You don't have access to delete", "warning");
                return;
              }
              handleDelete(selectedTerm.id);
            }}
          ></ion-icon>
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleResetClick}>
              Reset
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              Update
            </Button>
          </div>
        </div>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditPaymentTerm;
