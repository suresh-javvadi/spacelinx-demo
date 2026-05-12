import { useContext, useEffect, useState } from "react";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
} from "@mui/material";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { updateDepartment } from "../../../services/departmentService";
import { fetchUserLookup } from "../../../services/userService";

const EditDepartment = ({
  selectedDepartment,
  handleClose,
  handleRefresh,
  existingDepartments,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    parentDepartmentId: "",
    headOfDepartmentUserId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUserLookup();
        setUsers(data ?? []);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      setFormData({
        code: selectedDepartment.code ?? "",
        name: selectedDepartment.name ?? "",
        description: selectedDepartment.description ?? "",
        parentDepartmentId: selectedDepartment.parentDepartmentId ?? "",
        headOfDepartmentUserId: selectedDepartment.headOfDepartmentUserId ?? "",
      });
    }
  }, [selectedDepartment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.code.trim()) e.code = "Required";
    else if (
      existingDepartments.some(
        (d) =>
          d.id !== selectedDepartment.id &&
          d.code.toLowerCase() === formData.code.trim().toLowerCase()
      )
    )
      e.code = "Duplicate code not allowed";
    if (!formData.name.trim()) e.name = "Required";
    if (
      formData.parentDepartmentId &&
      formData.parentDepartmentId === selectedDepartment.id
    )
      e.parentDepartmentId = "A department cannot be its own parent";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert("Please fix validation errors", "error");
      return;
    }
    setLoading(true);
    try {
      await updateDepartment(selectedDepartment.id, {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parentDepartmentId: formData.parentDepartmentId || null,
        headOfDepartmentUserId: formData.headOfDepartmentUserId || null,
      });
      Alert("Department updated successfully!", "success");
      handleClose();
      handleRefresh();
    } catch (err) {
      console.error("Update error:", err);
      Alert("Failed to update Department", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>Edit Department</h2>
        <button onClick={handleClose}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <div className="CreateFlyoutBody">
        <h3>Edit the details</h3>
        <FormGroup>
          <TextField
            label="Code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 50 }}
            error={!!errors.code}
            helperText={errors.code}
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            inputProps={{ maxLength: 255 }}
            error={!!errors.name}
            helperText={errors.name}
          />
        </FormGroup>
        <FormGroup>
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            minRows={3}
          />
        </FormGroup>
        <FormGroup>
          <FormControl fullWidth error={!!errors.parentDepartmentId}>
            <InputLabel>Parent Department</InputLabel>
            <Select
              label="Parent Department"
              name="parentDepartmentId"
              value={formData.parentDepartmentId}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {existingDepartments
                .filter((d) => d.id !== selectedDepartment?.id)
                .map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </FormGroup>
        <FormGroup>
          <FormControl fullWidth>
            <InputLabel>Head of Department</InputLabel>
            <Select
              label="Head of Department"
              name="headOfDepartmentUserId"
              value={formData.headOfDepartmentUserId}
              onChange={handleChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FormGroup>
      </div>

      <div className="CreateFlyoutFooter">
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          Update
        </Button>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditDepartment;
