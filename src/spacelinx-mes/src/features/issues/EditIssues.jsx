import React, { useContext, useState, useEffect } from "react";
import { Autocomplete, TextField, Button } from "@mui/material";
import { renderIcon } from "../../utils/iconRegistry.jsx";
import { AlertsContext } from "../AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import { updateIssue, deleteIssue } from "../../services/issuesService";
import "./Issues.css";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useIssues } from "./IssuesContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { useUserContext } from "../userContext/UserContext";

const EditIssues = ({
  handleCloseClick,
  selectedIssue,
  loadingIssueData,
  issuesTypes,
  issuesPriorities,
  productsData,
  projectNames,
  guidesData,
  workOrdersData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const { fetchIssuesData } = useIssues();
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    projectName: null,
    issueType: null,
    priority: null,
    summary: "",
    description: "",
    productId: null,
    guideId: null,
    workOrderId: null,
    jiraId: "",
    devopsId: "",
  });
  const [errors, setErrors] = useState({
    summary: "",
    priority: "",
  });
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loadingPrioritys, setLoadingPrioritys] = useState(true);

  useEffect(() => {
    if (selectedIssue) {
      setFormData({
        projectName: selectedIssue.projectName || "",
        issueType: selectedIssue.issueType || "",
        priority: selectedIssue.priority || "",
        summary: selectedIssue.summary || "",
        description: selectedIssue.description || "",
        productId: selectedIssue.productId || "",
        guideId: selectedIssue.guideId || "",
        workOrderId: selectedIssue.workOrderId || "",
      });
      setLoadingData(false);
    }
  }, [selectedIssue]);

  const validateFields = () => {
    let valid = true;
    const newErrors = {};
    if (!formData.summary.trim()) {
      newErrors.summary = "Summary is required";
      valid = false;
    }
    if (!formData.priority) {
      newErrors.priority = "Priority is required";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const getIconComponent = (iconName, color) => {
    return renderIcon(iconName, color);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: value ? "" : `${name} is required`,
    }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value ? value.name : "",
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: value ? "" : `${name} is required`,
    }));
  };

  const handleSubmit = async () => {
    if (!validateFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }

    const payload = {};
    if (formData.projectName) payload.projectName = formData.projectName;
    if (formData.issueType) payload.issueType = formData.issueType;
    if (formData.priority) payload.priority = formData.priority;
    if (formData.summary) payload.summary = formData.summary;
    if (formData.description) payload.description = formData.description;
    if (formData.productId) payload.productId = formData.productId;
    if (formData.guideId) payload.guideId = formData.guideId;
    if (formData.workOrderId) payload.workOrderId = formData.workOrderId;
    if (formData.jiraId) payload.jiraId = formData.jiraId;
    if (formData.devopsId) payload.devopsId = formData.devopsId;

    try {
      await updateIssue(selectedIssue.id, payload);
      Alert("Issue updated successfully..!", "success");
      handleCloseClick();
      await fetchIssuesData();
    } catch (error) {
      console.error("Error updating issue:", error);
      Alert("Failed to update issue. Please try again.", "error");
    }
  };

  const handleReset = () => {
    setFormData({
      projectName: selectedIssue.projectName || null,
      issueType: selectedIssue.issueType || null,
      priority: selectedIssue.priority || null,
      summary: selectedIssue.summary || "",
      description: selectedIssue.description || "",
      productId: selectedIssue.productId || null,
      guideId: selectedIssue.guideId || null,
      workOrderId: selectedIssue.workOrderId || null,
      jiraId: selectedIssue.jiraId || "",
      devopsId: selectedIssue.devopsId || "",
    });
    setErrors({});
  };

  const handleDelete = async () => {
    try {
      await deleteIssue(selectedIssue.id);
      Alert("Issue deleted successfully..!", "success");
      await fetchIssuesData();
      handleCloseClick();
    } catch (error) {
      console.error("Error deleting issue:", error);
      Alert("Failed to delete issue. Please try again.", "error");
    }
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeader">
        <h3>Edit Issue</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.ISSUES.MODIFY)) {
                Alert("You do not have access to edit.", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon name="create-outline"></ion-icon>
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
        <div className="CreateFlyoutBody">
          <TextField
            label="Summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            error={!!errors.summary}
            helperText={errors.summary}
            className="AdminTextFeilds"
            inputProps={{ readOnly: readOnlyMode }}
          />

          <Autocomplete
            disabled
            freeSolo
            options={issuesTypes}
            loading={loadingIssueData}
            loadingText="Loading Issue Types...."
            getOptionLabel={(option) => option.name}
            value={
              issuesTypes.find((opt) => opt.name === formData.issueType) || null
            }
            isOptionEqualToValue={(option, value) =>
              option.name === (value?.name || value)
            }
            onChange={(e, value) =>
              handleAutocompleteChange("issueType", value ? value.name : "")
            }
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              return (
                <div key={key} {...rest} className="NewIssuesTypesOption">
                  {getIconComponent(option.icon, option.color)}{" "}
                  <span>{option.name}</span>
                </div>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Issue Type"
                error={!!errors.issueType}
                helperText={errors.issueType}
                className="AdminTextFeilds"
              />
            )}
          />

          <Autocomplete
            freeSolo
            options={issuesPriorities}
            loading={loadingIssueData}
            loadingText="Loading Priorities...."
            getOptionLabel={(option) => option.name}
            value={
              issuesPriorities.find((opt) => opt.name === formData.priority) ||
              null
            }
            isOptionEqualToValue={(option, value) => option.name === value.name}
            onChange={(e, value) => handleAutocompleteChange("priority", value)}
            renderOption={(props, option) => (
              <div {...props} className="NewIssuesPriorityOption">
                {getIconComponent(option.icon, option.color)}{" "}
                <span>{option.name}</span>
              </div>
            )}
            readOnly={readOnlyMode}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Priority"
                error={!!errors.priority}
                helperText={errors.priority}
                className="AdminTextFeilds"
              />
            )}
          />

          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            fullWidth
            margin="normal"
            inputProps={{ readOnly: readOnlyMode }}
          />

          <Autocomplete
            disabled
            options={productsData}
            loading={loadingIssueData}
            loadingText="Loading Products...."
            getOptionLabel={(option) =>
              `${option.number} - ${option.name}` || ""
            }
            value={
              productsData.find(
                (product) => product.id === formData.productId
              ) || null
            }
            onChange={(e, value) =>
              handleAutocompleteChange("productId", value)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product"
                className="AdminTextFeilds"
                error={Boolean(!!errors.productId)}
                helperText={errors.productId}
              />
            )}
          />

          <Autocomplete
            disabled
            options={projectNames}
            loading={loadingIssueData}
            loadingText="Loading Project Names...."
            getOptionLabel={(option) => option.name}
            value={
              projectNames.find((opt) => opt.name === formData.projectName) ||
              null
            }
            isOptionEqualToValue={(option, value) => option.name === value.name}
            onChange={(e, value) =>
              handleAutocompleteChange("projectName", value)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Project Name"
                error={!!errors.projectName}
                helperText={errors.projectName}
                className="AdminTextFeilds"
              />
            )}
          />

          <Autocomplete
            disabled
            options={guidesData}
            loading={loadingIssueData}
            loadingText="Loading Select Guides...."
            getOptionLabel={(option) =>
              option ? `${option.number} - ${option.name}` : ""
            }
            value={
              guidesData.find((guide) => guide.id === formData.guideId) || null
            }
            onChange={(e, value) => handleAutocompleteChange("guideId", value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label=" Select Guide"
                className="AdminTextFeilds"
              />
            )}
            getOptionKey={(option) => option.id}
          />

          <Autocomplete
            disabled
            options={workOrdersData}
            loading={loadingIssueData}
            loadingText="Loading WorkOrders...."
            getOptionLabel={(option) =>
              `${option.number} - ${option.name}` || ""
            }
            value={
              workOrdersData.find(
                (workOrder) => workOrder.id === formData.workOrderId
              ) || null
            }
            onChange={(e, value) =>
              handleAutocompleteChange("workOrderId", value)
            }
            renderInput={(params) => (
              <TextField {...params} label="WorkOrder" fullWidth />
            )}
          />
        </div>
      )}

      {!readOnlyMode && (
        <div className="EditFlyoutFooter">
          <ion-icon name="trash-outline" onClick={handleDelete}></ion-icon>
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSubmit}>Update</Button>
          </div>
        </div>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditIssues;
