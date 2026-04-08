import { useState, useEffect, useContext, useMemo } from "react";
import { TextField, Button, Autocomplete } from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import {
  deleteAdditionalRecipient,
  fetchAdditionalRecipientsTemplateCode,
  updateAdditionalRecipient,
  createAdditionalRecipient,
} from "../../../services/additionalRecipientService";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import "./AdditionalRecipient.css";

const EditAdditionalRecipient = ({
  handleCloseClick,
  handleRefresh,
  selectedAdditionalRecipient,
  emailRecipientsData,
  loadingEmailRecipients,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [loadingData, setLoadingData] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [formMode, setFormMode] = useState(null);
  const [editingRecipientId, setEditingRecipientId] = useState(null);
  const [formData, setFormData] = useState({
    templateCode: "",
    email: "",
    recipientName: "",
    recipientType: "",
  });
  const [errors, setErrors] = useState({});
  const [recipientsList, setRecipientsList] = useState([]);

  useEffect(() => {
    if (!selectedAdditionalRecipient) return;

    setFormData((prev) => ({
      ...prev,
      templateCode: selectedAdditionalRecipient.templateCode || "",
    }));
  }, [selectedAdditionalRecipient]);

  useEffect(() => {
    if (!formData.templateCode) return;

    const fetchRecipients = async () => {
      try {
        setLoadingGrid(true);

        const data = await fetchAdditionalRecipientsTemplateCode(
          formData.templateCode,
        );

        const formatted = data.map((item) => ({
          id: item.id,
          email: item.email,
          recipientName: item.recipientName,
          recipientType: item.recipientType,
        }));

        setRecipientsList(formatted);
      } catch (error) {
        Alert("Failed to fetch recipients", "error");
      } finally {
        setLoadingGrid(false);
      }
    };

    fetchRecipients();
  }, [formData.templateCode]);

  const existingEmails = useMemo(
    () => recipientsList.map((r) => r.email),
    [recipientsList],
  );

  const validateFields = () => {
    let newErrors = {};
    let valid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    }
    if (!formData.recipientType.trim()) {
      newErrors.recipientType = "Recipient Type is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRowClick = (row) => {
    if (!hasPermission(PERMISSIONS.ADDITIONALRECIPIENTS?.MODIFY)) {
      Alert("No edit access", "warning");
      return;
    }

    setFormMode("edit");
    setEditingRecipientId(row.id);

    const user = emailRecipientsData?.find((u) => u.email === row.email);

    setSelectedUser(user || null);

    setFormData({
      templateCode: formData.templateCode,
      email: row.email,
      recipientName: row.recipientName,
      recipientType: row.recipientType,
    });
  };

  const handleSave = async () => {
    if (!validateFields()) {
      Alert("Please fill required fields", "error");
      return;
    }

    const isDuplicate = recipientsList.some(
      (row) => row.email === formData.email && row.id !== editingRecipientId,
    );

    if (isDuplicate) {
      Alert("Email already exists for this template", "error");
      return;
    }
    if (!hasPermission(PERMISSIONS.ADDITIONALRECIPIENTS?.MODIFY)) {
      Alert("You do not have permission to update", "warning");
      return;
    }
    setLoadingData(true);
    const payload = {
      templateCode: formData.templateCode,
      email: formData.email,
      recipientName: formData.recipientName,
      recipientType: formData.recipientType,
    };

    try {
      setLoadingData(true);

      if (formMode === "edit") {
        await updateAdditionalRecipient(editingRecipientId, payload);

        Alert("Additional Recipient updated successfully!", "success");
        handleCloseClick();
      }

      if (formMode === "add") {
        await createAdditionalRecipient(payload);

        Alert("Additional Recipient created successfully!", "success");
      }

      setFormMode(null);
      setEditingRecipientId(null);
      setSelectedUser(null);
      handleRefresh();
      handleCloseClick();
    } catch (err) {
      console.error("Update failed:", err);
      Alert("Failed to update. Try again.", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteRecipient = async (id) => {
    if (!hasPermission(PERMISSIONS.ADDITIONALRECIPIENTS?.DELETE)) {
      Alert("No delete permission", "warning");
      return;
    }

    try {
      setLoadingGrid(true);
      await deleteAdditionalRecipient(id);
      setRecipientsList((prev) => prev.filter((row) => row.id !== id));
      Alert("Deleted successfully!", "success");
    } catch {
      Alert("Delete failed", "error");
    } finally {
      setLoadingGrid(false);
    }
  };

  const columns = [
    { field: "email", headerName: "Email", flex: 1 },
    { field: "recipientName", headerName: "Recipient Name", flex: 1 },
    { field: "recipientType", headerName: "Recipient Type", flex: 1 },
    {
      headerName: "Actions",
      flex: 0.4,
      renderCell: ({ row }) => (
        <ion-icon
          name="trash-outline"
          style={{ cursor: "pointer", color: "red" }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteRecipient(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeaderNew">
        <h3>{formData.templateCode}</h3>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline" />
        </button>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="EditFlyoutBody">
          <div className="AddNewRecipientButton">
            <Button
              variant="contained"
              onClick={() => {
                setFormMode("add");
                setEditingRecipientId(null);
                setSelectedUser(null);
                setFormData((prev) => ({
                  ...prev,
                  email: "",
                  recipientName: "",
                  recipientType: "",
                }));
              }}
            >
              + Add New Recipient
            </Button>
          </div>

          {formMode && (
            <>
              <Autocomplete
                options={emailRecipientsData || []}
                getOptionLabel={(option) => option.email || ""}
                loading={loadingEmailRecipients}
                value={selectedUser}
                getOptionDisabled={(option) => {
                  if (formMode === "edit" && option.email === formData.email) {
                    return false;
                  }
                  return existingEmails.includes(option.email);
                }}
                onChange={(event, newValue) => {
                  setSelectedUser(newValue);
                  setFormData((prev) => ({
                    ...prev,
                    email: newValue?.email || "",
                    recipientName: newValue
                      ? `${newValue.firstName} ${newValue.lastName}`
                      : "",
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    email: "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Email"
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                  />
                )}
              />

              <TextField
                label="Recipient Name"
                value={formData.recipientName}
                disabled
                fullWidth
                error={!!errors.recipientName}
                helperText={errors.recipientName}
              />

              <Autocomplete
                options={["CC", "Watcher", "Stakeholder"]}
                value={formData.recipientType || null}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    recipientType: newValue || "",
                  }));
                  setErrors((prev) => ({
                    ...prev,
                    recipientType: "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Recipient Type"
                    error={!!errors.recipientType}
                    helperText={errors.recipientType}
                    required
                  />
                )}
              />

              <div className="CancelUpdateCreateButton">
                <Button variant="outlined" onClick={() => setFormMode(null)}>
                  Cancel
                </Button>

                <Button variant="contained" onClick={handleSave}>
                  {formMode === "edit" ? "Update" : "Create"}
                </Button>
              </div>
            </>
          )}

          <StyledDataGrid
            rows={recipientsList}
            columns={columns}
            pageSize={5}
            loading={loadingGrid}
            onRowClick={(params) => handleRowClick(params.row)}
          />
        </div>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditAdditionalRecipient;
