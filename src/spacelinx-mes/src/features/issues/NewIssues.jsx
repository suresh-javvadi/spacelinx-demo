import React, { useContext, useState, useEffect } from "react";
import { Autocomplete, TextField, Button } from "@mui/material";
import { renderIcon } from "../../utils/iconRegistry.jsx";
import { AlertsContext } from "../AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import { createIssue } from "../../services/issuesService";
import "./Issues.css";
import { fetchProductsLookup } from "../../services/productService";
import { fetchGuidesLookup } from "../../services/guideService";
import { fetchWorkordersLookup } from "../../services/WOrderService";
import { fetchOptionSetByAppName } from "../../services/optionSetService";
import { useIssues } from "./IssuesContext";

const NewIssues = ({ handleCloseClick, onDialog }) => {
  const { Alert } = useContext(AlertsContext);
  const { fetchIssuesData } = useIssues();
  const [formData, setFormData] = useState({
    projectName: "",
    issueType: "",
    priority: "",
    summary: "",
    description: "",
    productId: "",
    guideId: "",
    workOrderId: "",
  });
  const [errors, setErrors] = useState({
    issueType: "",
    priority: "",
    summary: "",
  });

  const [guidesData, setGuidesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [workOrdersData, setWorkOrdersData] = useState([]);
  const [issuesTypes, setIssuesTypes] = useState([]);
  const [issuesPriorities, setIssuesPriorities] = useState([]);
  const [projectNames, setProjectNames] = useState([]);
  const [loadingIssueData, setLoadingIssueData] = useState(true);

  useEffect(() => {
    if (issuesTypes.length > 0 && !formData.issueType) {
      const defaultIssue = issuesTypes.find((opt) => opt.name === "Bug");
      if (defaultIssue) {
        setFormData((prev) => ({ ...prev, issueType: defaultIssue }));
      }
    }
  }, [issuesTypes]);

  useEffect(() => {
    if (issuesPriorities.length > 0 && !formData.priority) {
      const defaultPriority = issuesPriorities.find(
        (opt) => opt.name === "Medium"
      );
      if (defaultPriority) {
        setFormData((prev) => ({ ...prev, priority: defaultPriority }));
      }
    }
  }, [issuesPriorities]);
  const getIconComponent = (iconName, color) => {
    return renderIcon(iconName, color);
  };

  useEffect(() => {
    const fetchOptionsData = async () => {
      setLoadingIssueData(true);
      try {
        const [optionSet, guides, products, workOrders] = await Promise.all([
          fetchOptionSetByAppName(),
          fetchGuidesLookup(),
          fetchProductsLookup(),
          fetchWorkordersLookup(),
        ]);

        const issuesTypesData = optionSet.find(
          (item) => item.name === "issues_types_jira"
        );
        const issuesPrioritiesData = optionSet.find(
          (item) => item.name === "issues_priorities"
        );
        const projectNamesData = optionSet.find(
          (item) => item.name === "Project_Names"
        );

        if (issuesTypesData) {
          setIssuesTypes(JSON.parse(issuesTypesData.values));
        }

        if (issuesPrioritiesData) {
          setIssuesPriorities(JSON.parse(issuesPrioritiesData.values));
        }

        if (projectNamesData) {
          setProjectNames(JSON.parse(projectNamesData.values));
        }

        setGuidesData(guides);
        setProductsData(products);
        setWorkOrdersData(workOrders);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingIssueData(false);
      }
    };
    fetchOptionsData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const requiredFields = {
      summary: "Summary",
    };

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]:
        typeof value === "string" && value.trim()
          ? ""
          : `${requiredFields[name] || name} is required`,
    }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value || null }));

    const requiredFields = {
      issueType: "Issue Type",
      priority: "Priority",
    };

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: value ? "" : `${requiredFields[name] || name} is required`,
    }));
  };

  const validateCreateFields = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.issueType) {
      newErrors.issueType = "Issue Type is required";
      valid = false;
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
      valid = false;
    }

    if (!formData.summary) {
      newErrors.summary = "Summary is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateCreateFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }

    const payload = {};
    if (formData.projectName) payload.projectName = formData.projectName.name;
    if (formData.issueType) payload.issueType = formData.issueType.name;
    if (formData.priority) payload.priority = formData.priority.name;
    if (formData.summary) payload.summary = formData.summary;
    if (formData.description) payload.description = formData.description;
    if (formData.productId) payload.productId = formData.productId.id;
    if (formData.guideId) payload.guideId = formData.guideId.id;
    if (formData.workOrderId) payload.workOrderId = formData.workOrderId.id;

    try {
      await createIssue(payload);

      Alert("Issue created successfully..!", "success");

      setFormData({
        projectName: "",
        issueType: null,
        priority: null,
        summary: "",
        description: "",
        productId: null,
        guideId: null,
        workOrderId: null,
      });

      await fetchIssuesData();
      handleCloseClick();
    } catch (error) {
      console.error("Error creating issue:", error);
      Alert("Failed to create issue. Please try again.", "error");
    }
  };

  return (
    <div className="NewIssuesContainer">
      <h2 className={`${onDialog ? "IssueDialogHeader" : "NewIssuesHeader"}`}>
        Create Issue
      </h2>

      <div className={`NewIssuesForm ${onDialog ? "IssueDialogForm" : ""}`}>
        <TextField
          label="Summary"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          error={!!errors.summary}
          helperText={errors.summary}
          fullWidth
          margin="normal"
          required
          multiline
          rows={3}
        />

        <Autocomplete
          freeSolo
          options={issuesTypes}
          loading={loadingIssueData}
          loadingText="Loading Issue Types...."
          getOptionLabel={(option) => option.name}
          value={
            issuesTypes.find((opt) => opt.name === formData.issueType?.name) ||
            null
          }
          isOptionEqualToValue={(option, value) => option.name === value.name}
          onChange={(e, value) => handleAutocompleteChange("issueType", value)}
          renderOption={(props, option) => (
            <div key={option.name} {...props} className="NewIssuesTypesOption">
              {getIconComponent(option.icon, option.color)}{" "}
              <span>{option.name}</span>
            </div>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Issue Type"
              error={!!errors.issueType}
              helperText={errors.issueType}
              fullWidth
              margin="normal"
              required
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
            issuesPriorities.find(
              (opt) => opt.name === formData.priority?.name
            ) || null
          }
          isOptionEqualToValue={(option, value) => option.name === value.name}
          onChange={(e, value) => handleAutocompleteChange("priority", value)}
          renderOption={(props, option) => (
            <div {...props} className="NewIssuesPriorityOption">
              {getIconComponent(option.icon, option.color)}{" "}
              <span>{option.name}</span>
            </div>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Priority"
              error={!!errors.priority}
              helperText={errors.priority}
              fullWidth
              margin="normal"
              required
            />
          )}
        />

        <TextField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />

        <Autocomplete
          options={productsData}
          loading={loadingIssueData}
          loadingText="Loading Products...."
          getOptionLabel={(option) => `${option.number} - ${option.name}` || ""}
          value={
            productsData.find((p) => p.id === formData.productId?.id) || null
          }
          onChange={(e, value) => handleAutocompleteChange("productId", value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Product"
              fullWidth
              margin="normal"
            />
          )}
        />

        <Autocomplete
          options={projectNames}
          loading={loadingIssueData}
          loadingText="Loading Project Names...."
          getOptionLabel={(option) => option.name}
          value={
            projectNames.find(
              (opt) => opt.name === formData.projectName?.name
            ) || null
          }
          isOptionEqualToValue={(option, value) => option.name === value.name}
          onChange={(e, value) =>
            handleAutocompleteChange("projectName", value)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Project Name"
              fullWidth
              margin="normal"
            />
          )}
        />

        <Autocomplete
          options={guidesData}
          loading={loadingIssueData}
          loadingText="Loading Select Guides...."
          getOptionLabel={(option) => `${option.number} - ${option.name}` || ""}
          value={guidesData.find((g) => g.id === formData.guideId?.id) || null}
          onChange={(e, value) => handleAutocompleteChange("guideId", value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Guide"
              fullWidth
              margin="normal"
            />
          )}
        />

        <Autocomplete
          options={workOrdersData}
          loading={loadingIssueData}
          loadingText="Loading WorkOrders...."
          getOptionLabel={(option) => `${option.number} - ${option.name}` || ""}
          value={
            workOrdersData.find((w) => w.id === formData.workOrderId?.id) ||
            null
          }
          onChange={(e, value) =>
            handleAutocompleteChange("workOrderId", value)
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select WorkOrder"
              fullWidth
              margin="normal"
            />
          )}
        />
      </div>

      <div className="NewIssuesFooter">
        <Button className="CancelButton" onClick={handleCloseClick}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Issue
        </Button>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewIssues;
