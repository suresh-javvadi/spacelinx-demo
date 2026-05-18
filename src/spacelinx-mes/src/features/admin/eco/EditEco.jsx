import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  TextField,
  Button,
  Autocomplete,
  MenuItem,
  Popover,
} from "@mui/material";
import "./eco.css";
import {
  fetchEcoDetailsById,
  updateEco,
  submitEco,
  rejectEco,
  approveEco,
  fetchEcoApprovalHistory,
} from "../../../services/ecoService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import {
  createEcoParts,
  deleteEcoPart,
  updateEcoPart,
} from "../../../services/ecoPartService";
import Documents from "../../../Components/Documents/Documents";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../../userContext/UserContext";
import ECOErrorDisplay from "./ECOErrorDisplay";
import ResizableDrawer from "../../../Components/ResizableDrawer/ResizableDrawer";
import { usePartDetailsDrawer } from "../parts/PartDetailsContext";
import { fetchEcoLOGByECOId } from "../../../services/ecoLogService";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useMsal } from "@azure/msal-react";
import ApprovalTracker from "./ApprovalTracker";
import ApprovalHistory from "./ApprovalHistory";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchApprovalConfigs } from "../../../services/approvalsConfigService";

const EditEco = ({
  selectedEco,
  handleCloseClick,
  handleRefresh,
  changeTypes,
  uniqueParts,
  userData,
  loadingUsersData,
  loadingUniqueParts,
  setLoadingUniqueParts,
  loadingChangeTypes,
}) => {
  const {
    hasPermission,
    isSuperAdmin,
    userData: currentUser,
  } = useUserContext();
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const { Alert } = useContext(AlertsContext);
  const [activeTab, setActiveTab] = useState("details");
  const [loadingData, setLoadingData] = useState(false);
  const [partsData, setPartsData] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [existingEcoParts, setExistingEcoParts] = useState([]);
  const [existingEcoPartsLoading, setExistingEcoPartsLoading] = useState(true);
  const [ecoApprovalConfig, setEcoApprovalConfig] = useState(null);

  const formatDate = (isoDate) => {
    if (!isoDate) return "";

    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };
  const parsedApprovers = useMemo(() => {
    if (!selectedEco?.approvers) return [];

    try {
      const approversArray = JSON.parse(selectedEco.approvers);

      const groupedByStage = {};
      approversArray.forEach((a) => {
        const stage = a.stage_number || 1;
        if (!groupedByStage[stage]) {
          groupedByStage[stage] = [];
        }
        groupedByStage[stage].push({
          id: a.approver_id,
          fullName: a.full_name,
          email: a.email,
          status: a.status,
          firstName: a.first_name || a.full_name?.split(" ")[0] || "",
          lastName: a.last_name || a.full_name?.split(" ")[1] || "",
        });
      });

      return Object.keys(groupedByStage)
        .map((stage) => ({
          stage: parseInt(stage),
          approvers: groupedByStage[stage],
        }))
        .sort((a, b) => a.stage - b.stage);
    } catch (error) {
      console.error("Error parsing approvers JSON:", error);
      return [];
    }
  }, [selectedEco]);

  const [formData, setFormData] = useState({
    name: selectedEco?.name || "",
    reasonForChange: selectedEco?.reasonForChange || "",
    description: selectedEco?.description || "",
    changeType: selectedEco?.changeType || "",
    impactAnalysis: selectedEco?.impactAnalysis || "",
    priority: selectedEco?.priority || "",
    plannedImplementationDate:
      formatDate(selectedEco?.plannedImplementationDate) || "",
    requestor: selectedEco?.requestorFullName || "",
    approvedBy: selectedEco?.approverFullName || "",
    approvedDate: selectedEco?.approvedDate
      ? formatDate(selectedEco.approvedDate)
      : "",
    approvers: parsedApprovers,
  });

  const [errors, setErrors] = useState({});
  const [editPartsMode, setEditPartsMode] = useState(false);
  const priorityOptions = ["Low", "Medium", "High"];
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [tempDescription, setTempDescription] = useState("");
  const [statusErrors, setStatusErrors] = useState({});
  const [autocompleteValue, setAutocompleteValue] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [errorDisplay, setErrorDisplay] = useState(false);
  const [addNotesDrawer, setAddNotesDrawer] = useState(false);
  const [addNotesError, setAddNotesError] = useState(null);
  const [addApproveNotesDrawer, setAddApproveNotesDrawer] = useState(false);
  const [approverECONotes, setApproverECONotes] = useState(null);
  const [existingECOLogs, setExistingECOLogs] = useState([]);
  const [existingECORejectLogs, setExistingECORejectLogs] = useState([]);
  const [selectedEcoLog, setSelectedEcoLog] = useState(null);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [approversError, setApproversError] = useState(null);
  const canModify = hasPermission(PERMISSIONS.ECO.MODIFY);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const isRequestorSelf = useMemo(() => {
    if (!selectedEco?.requestorEmail || !currentUser) return false;
    return (
      selectedEco.requestorEmail.toLowerCase() ===
      currentUser?.email?.toLowerCase()
    );
  }, [selectedEco?.requestorEmail, currentUser]);

  const currentStageInfo = useMemo(() => {
    if (!formData.approvers || !currentStage || !currentUser?.email)
      return null;

    const stageObj = formData.approvers.find((s) => s.stage === currentStage);
    if (!stageObj) return null;

    const userInStage = stageObj.approvers?.find(
      (a) => a.email?.toLowerCase() === currentUser.email.toLowerCase(),
    );

    return {
      hasPermission: !!userInStage,
      alreadyApproved: userInStage?.status === "Approved",
    };
  }, [formData.approvers, currentStage, currentUser?.email]);

  const hasPermissionToApprove = currentStageInfo?.hasPermission || false;
  const alreadyApproved = currentStageInfo?.alreadyApproved || false;

  const defaultModel = {
    oldVersion: false,
    currentStatus: false,
    manufacturerName: false,
    manufacturingPartNumber: false,
  };

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("ecoColumnVisibility");
    return saved ? { ...defaultModel, ...JSON.parse(saved) } : defaultModel;
  });

  const handleCloseAddNotesDrawer = () => {
    setAddNotesDrawer(false);
    setAddApproveNotesDrawer(false);
    setApproverECONotes("");
    setAddNotesError(null);
  };

  const handleCloseShowNotesDrawer = () => {
    setShowNotesDrawer(false);
    setSelectedEcoLog(null);
  };

  useEffect(() => {
    fetchEcoLOGData();
  }, []);
  useEffect(() => {
    if (!selectedEco?.id) return;

    loadApprovalHistory();
  }, [selectedEco?.id]);

  const loadApprovalHistory = async () => {
    try {
      const res = await fetchEcoApprovalHistory(selectedEco.id);

      setApprovalHistory(res);

      const activeStage = res.find(
        (item) => item.status === "Pending" && item.isActive,
      );

      setCurrentStage(activeStage?.stageNumber ?? null);
    } catch (error) {
      console.error("Error fetching approval history:", error);
    }
  };

  useEffect(() => {
    fetchApprovalConfigs().then((res) => {
      const ecoConfig = res.find((c) => c.entityType === "Eco" && c.isActive);
      setEcoApprovalConfig(ecoConfig);
    });
  }, []);

  const fetchEcoLOGData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchEcoLOGByECOId(selectedEco?.id);

      const sortedData = (data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      setExistingECOLogs(sortedData);

      const rejectedLogs = sortedData.filter(
        (log) => log.action === "Rejected",
      );

      setExistingECORejectLogs(rejectedLogs);
    } catch (error) {
      Alert("Failed to load ECO log data", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStatusChange = (event, rowId) => {
    const { value } = event.target;

    setStatusErrors((prev) => {
      const updatedErrors = { ...prev };
      if (value) delete updatedErrors[rowId];
      return updatedErrors;
    });

    setSelectedParts((prevParts) =>
      prevParts.map((part) =>
        part.partId === rowId ? { ...part, newStatus: value } : part,
      ),
    );
  };

  const handleOpenPopover = (event, params) => {
    setAnchorEl(event.currentTarget);
    setCurrentRowId(params.id);
    setTempDescription(params.value || "");
    setSelectedPart(params.row);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setCurrentRowId(null);
  };

  const handleSaveDescription = async () => {
    const isNewPart = selectedPart?.newPart;
    const payload = {
      id: selectedPart?.id,
      status: selectedPart?.status,
      description: tempDescription.trim() || "",
    };

    if (isNewPart) {
      setSelectedParts((prevParts) =>
        prevParts.map((part) =>
          part.partId === currentRowId
            ? { ...part, description: payload.description }
            : part,
        ),
      );
    } else {
      try {
        await updateEcoPart(selectedPart?.id, payload);
        fetchEcoPartsData();
        Alert("Part description updated successfully.", "success");
      } catch (error) {
        console.error("Error updating part description:", error);
        Alert("Failed to update part description.", "error");
      }
    }

    handleClosePopover();
  };

  const isInitialRelease =
    formData.changeType?.toLowerCase() === "initial release";

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: "",
      reasonForChange: "",
      changeType: "",
      plannedImplementationDate: "",
      priority: "",
      impactAnalysis: "",
    };

    if (!formData.name) {
      errors.name = "Name is required";
      valid = false;
    } else if (formData.name.length < 3) {
      errors.name = "Name must be at least 3 characters long";
      valid = false;
    }

    if (!isInitialRelease && !formData.reasonForChange) {
      errors.reasonForChange = "Reason for change is required";
      valid = false;
    }
    if (!formData.changeType) {
      errors.changeType = "Change Type is required";
      valid = false;
    }

    if (!formData.plannedImplementationDate) {
      errors.plannedImplementationDate = "Implementation date is required";
      valid = false;
    }
    // else {
    //   const today = new Date().toISOString().split("T")[0];
    //   if (formData.plannedImplementationDate < today) {
    //     errors.plannedImplementationDate =
    //       "Implementation date cannot be in the past";
    //     valid = false;
    //   }
    // }
    if (!formData.priority) {
      errors.priority = "Priority is required";
      valid = false;
    }
    if (!isInitialRelease && !formData.impactAnalysis) {
      errors.impactAnalysis = "Impact Analysis is required";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const isChangingToInitialRelease =
      name === "changeType" && value?.toLowerCase() === "initial release";

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(isChangingToInitialRelease
        ? { reasonForChange: "", impactAnalysis: "" }
        : {}),
    }));

    const requiredFields = {
      name: "Name is required",
      reasonForChange: "Reason for change is required",
      changeType: "Change type is required",
      plannedImplementationDate: "Implementation date is required",
      impactAnalysis: "Impact analysis is required",
    };
    setErrors({
      ...errors,
      [name]:
        value === "" || value === null || value === undefined
          ? `${requiredFields[name] || name} `
          : "",
    });
  };

  const handleResetClick = () => {
    if (!selectedEco) return;

    setFormData({
      name: selectedEco.name || "",
      reasonForChange: selectedEco.reasonForChange || "",
      description: selectedEco.description || "",
      changeType: selectedEco.changeType || "",
      impactAnalysis: selectedEco.impactAnalysis || "",
      priority: selectedEco.priority || "",
      plannedImplementationDate: selectedEco.plannedImplementationDate
        ? formatDate(selectedEco.plannedImplementationDate)
        : "",
      requestor: selectedEco.requestorFullName || "",
      approvedBy: selectedEco.approverFullName || "",
      approvedDate: selectedEco.approvedDate
        ? formatDate(selectedEco.approvedDate)
        : "",
      approvers: parsedApprovers || [],
    });

    setErrors({});
    setApproversError(null);
  };

  const getNextVersion = (version) => {
    const lastChar = version.slice(-1);
    if (isNaN(lastChar)) {
      return (
        version.slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0) + 1)
      );
    }
    return version + "A";
  };

  const columns = [
    {
      field: "serialNumber",
      headerName: "Item No.",
      minWidth: 50,
      renderCell: (params) =>
        (params.api.getRowIndexRelativeToVisibleRows(params.id) + 1) * 10,
    },
    {
      field: "partNumberSuffix",
      headerName: "Part Number",
      flex: 0.5,
      renderCell: ({ row }) => (
        <div
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            if (row?.partDetails) {
              openPartDetailsDrawer(row.partDetails);
            }
          }}
        >
          {row?.partDetails?.partNumberSuffix || "---"}
        </div>
      ),
      valueGetter: (_value, row) => row?.partDetails?.partNumberSuffix || "---",
    },

    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (_value, row) => row?.partDetails?.name || "",
    },

    {
      field: "oldVersion",
      headerName: "Current Revision",
      flex: 0.5,
      valueGetter: (_value, row) => {
        if (row.newPart) {
          return row.partDetails?.version || "---";
        }

        const { partDetails, oldVersion } = row;

        return partDetails?.version === "A" && partDetails?.status === "Draft"
          ? "---"
          : oldVersion || "";
      },
    },

    {
      field: "NextVersion",
      headerName: "Revision",
      flex: 0.5,
      valueGetter: (_value, row) => {
        const isNewPart = row.newPart;
        const { version, status } = row.partDetails || {};

        if (isNewPart) {
          const { newStatus } = row;

          if (
            (status === "Draft" && newStatus === "Release") ||
            newStatus === "Obsolete"
          ) {
            return version || "---";
          }

          if (status === "Release" && newStatus === "Release" && version) {
            return getNextVersion(version);
          }

          if (status === "Release" && newStatus === "Obsolete") {
            return version;
          }
        }

        return version || "---";
      },
    },

    {
      field: "currentStatus",
      headerName: "Current Status",
      flex: 0.5,
      valueGetter: (_value, row) => row?.previousStatus || "",
    },

    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      valueGetter: (_value, row) =>
        (row.newPart ? row.newStatus : row.status) || "",
    },

    {
      field: "makeBuy",
      headerName: "Make/Buy",
      flex: 0.5,
      valueGetter: (_value, row) =>
        ({ 0: "Make", 1: "Buy" })[row?.partDetails?.makeBuy] || "---",
    },

    {
      field: "manufacturingPartNumber",
      headerName: "Manufacturing Part Number",
      flex: 1,
      valueGetter: (_value, row) =>
        row?.partDetails?.manufacturingPartNumber || "---",
    },

    {
      field: "manufacturerName",
      headerName: "Manufacturer",
      flex: 1,
      valueGetter: (_value, row) => row?.partDetails?.manufacturerName || "---",
    },

    {
      field: "description",
      headerName: "Remarks",
      flex: 0.7,
      renderCell: ({ row, value }) => {
        if (selectedEco?.status === "Draft") {
          return (
            <div onClick={(event) => handleOpenPopover(event, { row, value })}>
              {value || "Click to edit"}
            </div>
          );
        }

        return <div>{value || "---"}</div>;
      },
    },

    ...(selectedEco?.status === "Draft" ||
    (selectedEco?.status === "Submitted" &&
      hasPermission(PERMISSIONS.ECO.APPROVER))
      ? [
          {
            field: "",
            width: 50,
            renderCell: ({ row }) => {
              const handleDelete = async () => {
                if (!hasPermission(PERMISSIONS.ECO.EFFECTEDPARTS.DELETE)) {
                  Alert(
                    "You don't have permission to delete an ECO part.",
                    "warning",
                  );
                  return;
                }

                const confirmed = await showConfirmation(
                  "Delete Part?",
                  "Are you sure you want to remove this part?",
                );
                if (!confirmed) return;

                try {
                  if (row.id && !row.newPart) {
                    await deleteEcoPart(row.id);
                    showAlert(
                      "success",
                      "Deleted!",
                      "Part deleted successfully.",
                    );
                    fetchEcoPartsData();
                  } else {
                    setSelectedParts((prev) =>
                      prev.filter((p) => p.partId !== row.partId),
                    );

                    setAutocompleteValue((prev) =>
                      prev.filter((v) => v.id !== row.partId),
                    );

                    showAlert(
                      "success",
                      "Removed!",
                      "Part removed from selection.",
                    );
                  }
                } catch (error) {
                  Alert("Failed to delete part. Try again.", "error");
                  console.error("Delete error:", error);
                }
              };

              return (
                <ion-icon
                  name="trash-outline"
                  onClick={handleDelete}
                ></ion-icon>
              );
            },
          },
        ]
      : []),
  ];

  const handleEditSubmit = async () => {
    if (!validateForm()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }

    // Check if at least Stage 1 has approvers
    const stage1Data = formData.approvers?.find((a) => a.stage === 1);
    if (
      !stage1Data ||
      !stage1Data.approvers ||
      stage1Data.approvers.length === 0
    ) {
      Alert("ECO must have at least one approver in Stage 1.", "warning");
      setApproversError("At least one approver is required for Stage 1");
      return;
    }

    setLoadingData(true);

    const approvals = [];
    if (formData.approvers && Array.isArray(formData.approvers)) {
      formData.approvers.forEach((stageData) => {
        if (stageData.approvers && Array.isArray(stageData.approvers)) {
          stageData.approvers.forEach((approver) => {
            approvals.push({
              approverId: approver.id,
              stageNumber: stageData.stage,
            });
          });
        }
      });
    }

    const updatedEco = {
      id: selectedEco.id,
      name: formData.name,
      reasonForChange: formData.reasonForChange,
      description: formData.description,
      changeType: formData.changeType,
      impactAnalysis: formData.impactAnalysis,
      priority: formData.priority,
      plannedImplementationDate: selectedEco.plannedImplementationDate,
      approvals: approvals,
    };

    try {
      await updateEco(selectedEco?.id, updatedEco);
      handleRefresh();
      setReadOnlyMode(true);
      loadApprovalHistory();
      Alert("Updated ECO Details Successfully...!", "success");
    } catch (error) {
      Alert("Couldn't Update ECO Details.. Try Again..!", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };
  const approverOptions = useMemo(() => {
    if (!Array.isArray(userData)) return [];

    // ✅ Super Admin → allow self
    if (isSuperAdmin) {
      return userData;
    }

    // ❌ Others → hide self
    return userData.filter(
      (u) => u.email?.toLowerCase() !== currentUser?.email?.toLowerCase(),
    );
  }, [userData, currentUser, hasPermission]);

  const EditPartDrawerClose = () => {
    setReadOnlyMode(true);
    handleCloseClick();
  };

  const handleUpdateParts = async () => {
    if (!hasPermission(PERMISSIONS.ECO.EFFECTEDPARTS.MODIFY)) {
      Alert("You don't have permission to modify an ECO.", "warning");
      return;
    }
    if (selectedParts.length === 0) {
      Alert("Please select at least one part to save.", "warning");
      return;
    }

    const errors = {};
    selectedParts.forEach((part) => {
      if (!part.newStatus) {
        errors[part.id] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setStatusErrors(errors);
      Alert("Each part must have a status selected", "error");
      return;
    }

    setStatusErrors({});
    setExistingEcoPartsLoading(true);

    try {
      const payload = selectedParts.map((part) => ({
        partId: part.partId,
        status: part.newStatus,
        description: part.description?.trim() || "",
      }));

      await createEcoParts(selectedEco.id, payload);
      Alert("Updated Effected Parts Successfully!", "success");
      setEditPartsMode(false);

      await fetchEcoPartsData();

      setSelectedParts([]);
      setAutocompleteValue([]);
    } catch (error) {
      Alert("Failed to update Effected Parts. Try again.", "error");
      console.error("API Error:", error);
    } finally {
      setExistingEcoPartsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "effectedparts") {
      fetchEcoPartsData();
    }
  }, [activeTab]);

  useEffect(() => {
    setLoadingUniqueParts(true);
    const filteredParts = uniqueParts.filter(
      (part) =>
        !existingEcoParts.some((ecoPart) => ecoPart?.partId === part?.id),
    );

    const sortedParts = filteredParts.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    setPartsData(sortedParts);
    setLoadingUniqueParts(false);
  }, [uniqueParts, existingEcoParts]);

  const fetchEcoPartsData = async () => {
    setExistingEcoPartsLoading(true);
    try {
      const data = await fetchEcoDetailsById(selectedEco?.id);

      const sortedParts = [...(data?.ecoParts || [])].sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
      );

      setExistingEcoParts(sortedParts);
    } catch (error) {
      Alert("Failed to load existing ECO parts", "error");
      console.error(error);
      setExistingEcoParts([]);
    } finally {
      setExistingEcoPartsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedParts.length > 0) {
      handleUpdateParts();
    }
  }, [selectedParts]);

  const approversFromHistory = useMemo(() => {
    const map = {};

    approvalHistory.forEach((item) => {
      const stage = item.stageNumber;

      if (!map[stage]) {
        map[stage] = {
          stage,
          approvers: [],
        };
      }

      map[stage].approvers.push({
        id: item.approverId,
        firstName: item.approver?.firstName,
        lastName: item.approver?.lastName,
        email: item.approver?.email,
        status: item.status,
      });
    });

    return Object.values(map).sort((a, b) => a.stage - b.stage);
  }, [approvalHistory]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      approvers: approversFromHistory,
    }));
  }, [approversFromHistory]);

  const handleSelectedPartsChange = async (value) => {
    const updatedParts = [];

    for (const part of value) {
      const existing = selectedParts.find((p) => p.partId === part.id);

      const currentStatus = part.status?.toLowerCase();
      let newStatus = "";

      // Draft -> Release
      if (currentStatus === "draft") {
        newStatus = "Release";
      }

      // Release -> Obsolete
      else if (currentStatus === "release") {
        // Prevent confirmation popup again
        const alreadyConfirmed = selectedParts.find(
          (p) => p.partId === part.id && p.newStatus === "Obsolete",
        );

        if (!alreadyConfirmed) {
          const confirmed = await showConfirmation(
            "Mark as Obsolete?",
            "This part will move from Released to Obsolete. This cannot be undone.",
            "Obsolete it",
          );

          // Skip part if cancelled
          if (!confirmed) {
            continue;
          }
        }

        newStatus = "Obsolete";
      }

      updatedParts.push({
        id: part.id,
        partId: part.id,
        newPart: true,
        ecoId: part.ecoId,
        effectiveDate: part.effectiveDate,
        newVersion: part.newVersion,
        previousStatus: part.status,
        description: existing?.description || "",
        newStatus: newStatus,
        partDetails: {
          name: part.name,
          partNumber: part.partNumber,
          partNumberSuffix: part.partNumberSuffix,
          version: part.version,
          status: part.status,
        },
      });
    }

    setSelectedParts(updatedParts.reverse());

    // Optional: keep autocomplete synced
    setAutocompleteValue(
      value.filter((part) => updatedParts.some((p) => p.partId === part.id)),
    );
  };
  const handleSubmitECO = async () => {
    if (!canModify) {
      Alert("You don't have permission to submit an ECO.", "warning");
      return;
    }

    if (selectedParts.length > 0) {
      Alert("Please save the ECO before submitting.", "warning");
      return;
    }

    if (existingEcoParts.length === 0) {
      Alert(
        "ECO must have at least one effected part before submitting.",
        "warning",
      );
      return;
    }

    // Check if at least Stage 1 has approvers
    const stage1Data = formData.approvers?.find((a) => a.stage === 1);
    if (
      !stage1Data ||
      !stage1Data.approvers ||
      stage1Data.approvers.length === 0
    ) {
      Alert(
        "ECO must have at least one approver in Stage 1 before submitting.",
        "warning",
      );
      setActiveTab("details");
      setReadOnlyMode(false);
      setApproversError("At least one approver is required for Stage 1");
      return;
    }

    // Flatten current approvers from formData
    const currentApproversFlat = [];
    if (formData.approvers && Array.isArray(formData.approvers)) {
      formData.approvers.forEach((stageData) => {
        if (stageData.approvers && Array.isArray(stageData.approvers)) {
          stageData.approvers.forEach((a) => {
            currentApproversFlat.push({
              id: a.id,
              stage: stageData.stage,
            });
          });
        }
      });
    }

    // Flatten parsed approvers for comparison
    const parsedApproversFlat = [];
    if (approversFromHistory && Array.isArray(approversFromHistory)) {
      approversFromHistory.forEach((stageData) => {
        if (stageData.approvers && Array.isArray(stageData.approvers)) {
          stageData.approvers.forEach((a) => {
            parsedApproversFlat.push({
              id: a.id,
              stage: stageData.stage,
            });
          });
        }
      });
    }

    const hasChangesInApprovers =
      currentApproversFlat.length !== parsedApproversFlat.length ||
      currentApproversFlat.some(
        (ca) =>
          !parsedApproversFlat.some(
            (pa) => pa.id === ca.id && pa.stage === ca.stage,
          ),
      );

    if (hasChangesInApprovers) {
      Alert("Please update the ECO before submitting.", "warning");
      setActiveTab("details");
      setReadOnlyMode(false);
      return;
    }

    const confirmed = await showConfirmation(
      "Submit ECO?",
      "Are you sure you want to submit this ECO?",
      "Yes, submit it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    setSubmissionError(null);
    try {
      await submitEco(selectedEco.id);
      showAlert("success", "Success", "ECO submitted successfully!");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data?.ecoMessage &&
        Array.isArray(error.response.data?.bomPartsWithNoDocuments) &&
        error.response.data.bomPartsWithNoDocuments.length === 0 &&
        Array.isArray(error.response.data?.nonReleasedMissingParts) &&
        error.response.data.nonReleasedMissingParts.length === 0 &&
        Array.isArray(error.response.data?.partsWithNoDocuments) &&
        error.response.data.partsWithNoDocuments.length === 0
      ) {
        showAlert(
          "error",
          "Documents Required",
          "Add documents to the ECO before submitting.",
        );
        setActiveTab("documents");
      } else if (
        error.response &&
        error.response.status === 400 &&
        error.response.data
      ) {
        setSubmissionError(error.response.data);
        showAlert(
          "error",
          "Error",
          "Failed to submit ECO.",
          true,
          "View Error",
          () => setErrorDisplay(true),
        );
      } else {
        showAlert("error", "Error", "Failed to submit ECO. Please try again.");
        console.error("Submission error:", error);
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddApproveECONotes = async () => {
    if (!hasPermissionToApprove) {
      Alert("You don't have permission to Approve an ECO.", "warning");
      return;
    }

    if (isRequestorSelf && !isSuperAdmin) {
      Alert(
        "You cannot approve your own ECO. Please wait for another approver.",
        "warning",
      );
      return;
    }

    if (alreadyApproved) {
      Alert("You have already approved this ECO.", "success");
      return;
    }
    const confirmed = await showConfirmation(
      "Approve ECO?",
      "Are you sure you want to approve this ECO?",
      "Yes, approve it!",
    );

    if (!confirmed) return;
    setAddApproveNotesDrawer(true);
    setApproverECONotes("");
  };

  const handleApproveECO = async () => {
    if (!hasPermissionToApprove) {
      Alert("You don't have permission to approve this ECO.", "warning");
      return;
    }

    if (isRequestorSelf && !isSuperAdmin) {
      Alert("Admin users cannot approve their own ECO.", "warning");
      return;
    }

    const confirmed = await showConfirmation(
      "Approve ECO?",
      "Are you sure you want to approve this ECO?",
      "Yes, approve it!",
    );

    if (!confirmed) return;
    setLoadingData(true);
    try {
      await approveEco(selectedEco?.id, approverECONotes);
      showAlert("success", "Success", "ECO approved successfully!");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("ECO approval failed:", error);
      showAlert("error", "Error", "Failed to approve ECO. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddRejectECONotes = async () => {
    if (!hasPermissionToApprove) {
      Alert("You don't have permission to reject an ECO.", "warning");
      return;
    }
    const confirmed = await showConfirmation(
      "Reject ECO?",
      "Are you sure you want to reject this ECO?",
      "Yes, reject it!",
    );

    if (!confirmed) return;
    setAddNotesDrawer(true);
    setApproverECONotes("");
  };

  const handleRejectECO = async () => {
    if (!approverECONotes || approverECONotes.trim() === "") {
      setAddNotesError(
        "Please provide rejection notes before rejecting the ECO.",
      );
      return;
    }

    const confirmed = await showConfirmation(
      "Reject ECO?",
      "Are you sure you want to reject this ECO?",
      "Yes, reject it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      await rejectEco(selectedEco.id, approverECONotes);
      showAlert("warning", "ECO Rejected", "ECO rejected successfully!");
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("ECO rejection failed:", error);
      showAlert("error", "Error", "Failed to reject ECO. Please try again.");
    } finally {
      setLoadingData(false);
    }
  };
  const approvalHistoryByStage = useMemo(() => {
    const map = {};

    approvalHistory.forEach((item) => {
      const stage = item.stageNumber;

      if (!map[stage]) {
        map[stage] = {
          stage,
          approvers: [],
        };
      }

      map[stage].approvers.push({
        id: item.approverId,
        firstName: item.approver?.firstName,
        lastName: item.approver?.lastName,
        email: item.approver?.email,
        status: item.status,
        isActive: item.isActive,
      });
    });

    return Object.values(map).sort((a, b) => a.stage - b.stage);
  }, [approvalHistory]);

  return (
    <div className="EditFlyout EditEcoContainer">
      <div className="EditEcoHeader">
        <div className="EditEcoHeaderChild">
          <div className="ECOHeaderTitle">
            {selectedEco?.number} ({selectedEco?.name})
          </div>

          <div className="EditECOIcons">
            <div className="DetailItem">
              Status:{" "}
              <span
                className={
                  selectedEco?.status === "Submitted"
                    ? "status-submitted"
                    : selectedEco?.status === "Released"
                      ? "status-released"
                      : ""
                }
              >
                {selectedEco?.status === "Draft" ? "" : selectedEco?.status}
              </span>
            </div>
            <div className="EditECOIconsChild">
              {activeTab === "details" && selectedEco?.status === "Draft" && (
                <button
                  onClick={() => {
                    if (!canModify) {
                      Alert(
                        "You don't have permission to edit an ECO.",
                        "warning",
                      );
                      return;
                    }
                    setReadOnlyMode(false);
                  }}
                >
                  <ion-icon
                    name="create-outline"
                    class={!canModify ? "IonIconDisabled" : undefined}
                  ></ion-icon>
                </button>
              )}
              <button onClick={EditPartDrawerClose}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>
          </div>
        </div>

        <div className="EcoSections">
          <button
            onClick={() => setActiveTab("details")}
            className={activeTab === "details" ? "active" : "inactive"}
          >
            Details
          </button>
          {hasPermission(PERMISSIONS.ECO.EFFECTEDPARTS.VIEW) && (
            <button
              onClick={() => setActiveTab("effectedparts")}
              className={activeTab === "effectedparts" ? "active" : "inactive"}
            >
              Effected Parts
            </button>
          )}
          {hasPermission(PERMISSIONS.ECO.DOCUMENTS.VIEW) && (
            <button
              onClick={() => setActiveTab("documents")}
              className={activeTab === "documents" ? "active" : "inactive"}
            >
              Documents
            </button>
          )}
          <button
            onClick={() => setActiveTab("approvalHistory")}
            className={activeTab === "approvalHistory" ? "active" : "inactive"}
          >
            Approval History
          </button>
        </div>
      </div>
      {loadingData ? (
        <Cliploader loading={loadingData} />
      ) : (
        <>
          <div className="details-tab-container">
            {activeTab === "details" && (
              <div
                className={
                  readOnlyMode ? "readonly-tab-container" : "DetailsTabContent"
                }
              >
                <div className="DetailsHeader ">
                  <div>
                    <p>
                      <span>Requestor :</span> {formData.requestor || "---"}
                    </p>
                    <p>
                      <span>Requested On :</span>{" "}
                      {formData.plannedImplementationDate || "---"}
                    </p>
                  </div>
                  <div className="EcoApprovalStatus">
                    <div className="EcoApprovalStages">
                      {(readOnlyMode && approvalHistoryByStage.length > 0
                        ? approvalHistoryByStage
                        : formData.approvers || []
                      ).map((stageData) => (
                        <div
                          key={stageData.stage}
                          className="EcoApprovalStageCard"
                        >
                          <div className="StageHeader">
                            <span className="StageLabel">
                              Stage {stageData.stage}
                            </span>
                          </div>

                          <div className="ApproversContainer">
                            {stageData.approvers.map((a) => (
                              <div key={a.id} className="StageApprover">
                                <div className="ApproverInfo">
                                  <div className="ApproverName">
                                    {a.firstName} {a.lastName}
                                  </div>
                                  <div className="ApproverEmail">{a.email}</div>
                                </div>
                                <div
                                  className={`ApproverStatus ${a.status?.toLowerCase()}`}
                                >
                                  {a.status || "Pending"}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="TwoColumnGrid">
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ readOnly: readOnlyMode }}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                  <Autocomplete
                    value={
                      changeTypes.find(
                        (option) => option.name === formData.changeType,
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      handleInputChange({
                        target: {
                          name: "changeType",
                          value: newValue?.name || "",
                        },
                      });
                    }}
                    readOnly={readOnlyMode}
                    options={changeTypes}
                    loading={loadingChangeTypes}
                    loadingText="Loading Change Types..."
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Change Type"
                        name="changeType"
                        className="AdminTextFeilds"
                        error={!!errors.changeType}
                        helperText={errors.changeType}
                        required
                      />
                    )}
                  />
                  {!isInitialRelease && (
                    <TextField
                      label="Reason for Change"
                      name="reasonForChange"
                      value={formData.reasonForChange}
                      onChange={handleInputChange}
                      fullWidth
                      InputProps={{ readOnly: readOnlyMode }}
                      error={!!errors.reasonForChange}
                      helperText={errors.reasonForChange}
                      required
                      multiline
                      rows={3}
                      className="FullWidthField"
                    />
                  )}

                  {!isInitialRelease && (
                    <TextField
                      label="Impact Analysis"
                      name="impactAnalysis"
                      value={formData.impactAnalysis}
                      onChange={handleInputChange}
                      fullWidth
                      InputProps={{ readOnly: readOnlyMode }}
                      multiline
                      rows={3}
                      error={!!errors.impactAnalysis}
                      helperText={errors.impactAnalysis}
                      required
                      className="FullWidthField"
                    />
                  )}
                  <TextField
                    select
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    fullWidth
                    InputProps={{ readOnly: readOnlyMode }}
                    error={!!errors.priority}
                    helperText={errors.priority}
                    required
                  >
                    {priorityOptions.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* MULTI-STAGE APPROVERS - UPDATED SECTION */}
                  <div
                    className="FullWidthField"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        border: "1px solid #a1a1a1",
                        borderRadius: "8px",
                      }}
                    >
                      <h4>Approvers</h4>

                      {Array.from(
                        { length: ecoApprovalConfig?.numberOfLevels || 3 },
                        (_, index) => {
                          const stage = index + 1;
                          const stageData = formData.approvers?.find(
                            (a) => a.stage === stage,
                          );
                          const stageApprovers = stageData?.approvers || [];

                          return (
                            <div key={stage} style={{ marginTop: "20px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "16px",
                                  marginBottom: "8px",
                                }}
                              >
                                <span
                                  style={{
                                    minWidth: "80px",
                                    fontWeight: "500",
                                  }}
                                >
                                  Stage {stage}
                                </span>
                                <Autocomplete
                                  multiple
                                  limitTags={2}
                                  options={approverOptions}
                                  loading={loadingUsersData}
                                  loadingText="Loading Users..."
                                  getOptionDisabled={(option) =>
                                    formData.approvers?.some(
                                      (stageObj) =>
                                        stageObj.stage !== stage &&
                                        stageObj.approvers?.some(
                                          (a) =>
                                            a.email?.toLowerCase() ===
                                            option.email?.toLowerCase(),
                                        ),
                                    )
                                  }
                                  value={
                                    Array.isArray(stageApprovers)
                                      ? approverOptions.filter((user) =>
                                          stageApprovers.some(
                                            (a) =>
                                              a.email?.toLowerCase() ===
                                              user.email?.toLowerCase(),
                                          ),
                                        )
                                      : []
                                  }
                                  getOptionLabel={(option) =>
                                    option
                                      ? `${option.firstName} ${option.lastName}`
                                      : ""
                                  }
                                  isOptionEqualToValue={(option, value) =>
                                    option.email === value.email
                                  }
                                  readOnly={readOnlyMode}
                                  onChange={(e, newValue) => {
                                    const mappedApprovers = newValue.map(
                                      (user) => ({
                                        id: user.id,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        email: user.email,
                                      }),
                                    );

                                    setFormData((prev) => {
                                      const existingApprovers =
                                        prev.approvers || [];

                                      const cleanedApprovers =
                                        existingApprovers.map((stageObj) => {
                                          if (stageObj.stage !== stage) {
                                            return {
                                              ...stageObj,
                                              approvers:
                                                stageObj.approvers.filter(
                                                  (a) =>
                                                    !mappedApprovers.some(
                                                      (m) =>
                                                        m.email?.toLowerCase() ===
                                                        a.email?.toLowerCase(),
                                                    ),
                                                ),
                                            };
                                          }
                                          return stageObj;
                                        });

                                      // 2️⃣ Update current stage
                                      const stageIndex =
                                        cleanedApprovers.findIndex(
                                          (a) => a.stage === stage,
                                        );

                                      let updatedApprovers;

                                      if (stageIndex >= 0) {
                                        updatedApprovers = [
                                          ...cleanedApprovers,
                                        ];
                                        updatedApprovers[stageIndex] = {
                                          ...updatedApprovers[stageIndex],
                                          approvers: mappedApprovers,
                                        };
                                      } else {
                                        updatedApprovers = [
                                          ...cleanedApprovers,
                                          { stage, approvers: mappedApprovers },
                                        ];
                                      }

                                      return {
                                        ...prev,
                                        approvers: updatedApprovers,
                                      };
                                    });

                                    if (newValue.length > 0) {
                                      setApproversError(null);
                                    }
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder={`Select Approver(s) for Stage ${stage}`}
                                      error={stage === 1 && !!approversError}
                                      helperText={
                                        stage === 1 ? approversError : ""
                                      }
                                    />
                                  )}
                                  sx={{ flex: 1 }}
                                />
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>

                  <TextField
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                    InputProps={{ readOnly: readOnlyMode }}
                    error={!!errors.description}
                    helperText={errors.description}
                    className="FullWidthField"
                  />
                </div>
                {existingECORejectLogs.length > 0 && (
                  <div className="RejectNotesContainer">
                    {existingECORejectLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`RejectNoteCard ${
                          selectedEcoLog?.id === log.id ? "selected" : ""
                        }`}
                      >
                        <div className="RejectNotesHeader">
                          <p>
                            <span className="RejectNotesLabel">
                              Rejected by :
                            </span>{" "}
                            {log.actionBy || "Unknown"}
                          </p>
                          {log.createdAt && (
                            <p>
                              <span className="RejectNotesLabel">On :</span>{" "}
                              <span className="RejectNotesDate">
                                {formatDate(log.createdAt)}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="RejectNotesText">
                          {log.notes || "No notes"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTab === "effectedparts" && (
            <div className="EffectedPartsContainer">
              {selectedEco?.status === "Draft" && (
                <Autocomplete
                  multiple
                  options={partsData}
                  loading={loadingUniqueParts}
                  loadingText="Loading Parts..."
                  getOptionLabel={(option) =>
                    `${option.partNumber} - ${option.name}`
                  }
                  value={autocompleteValue}
                  onChange={(e, value) => {
                    handleSelectedPartsChange(value);
                  }}
                  renderTags={() => null}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Parts" />
                  )}
                  disableClearable
                />
              )}
              <div
                className={
                  selectedEco?.status === "Draft"
                    ? "EcoDataGrid"
                    : selectedEco?.status === "Submitted"
                      ? "SubmittedDataGrid"
                      : "EcoDataGridReadOnly"
                }
              >
                <StyledDataGrid
                  rows={[...(selectedParts || []), ...(existingEcoParts || [])]}
                  columns={columns}
                  pageSize={5}
                  getRowId={(row) => row?.partId || row?.id}
                  loading={existingEcoPartsLoading}
                  columnVisibilityModel={columnVisibilityModel}
                  onColumnVisibilityModelChange={(newModel) => {
                    setColumnVisibilityModel(newModel);
                    localStorage.setItem(
                      "ecoColumnVisibility",
                      JSON.stringify(newModel),
                    );
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="ECODocumentsTab">
              <Documents
                entityId={selectedEco?.id}
                entityType="ECO"
                entityNumber={selectedEco?.number}
                canEdit={hasPermission(PERMISSIONS.ECO.DOCUMENTS.MODIFY)}
                canDelete={
                  selectedEco?.status == "Draft" &&
                  hasPermission(PERMISSIONS.ECO.DOCUMENTS.DELETE)
                }
                isDraft={selectedEco?.status === "Draft"}
                tittle="Effected Parts Documents"
              />
            </div>
          )}

          {activeTab === "approvalHistory" && (
            <div className="ApprovalHistoryContainer">
              <ApprovalHistory selectedEcoId={selectedEco?.id} />
            </div>
          )}

          {!readOnlyMode && (
            <div className="EditFlyoutFooter">
              {activeTab === "details" && (
                <div className="DetailsTabContainer">
                  <Button
                    className="CancelButton EditFlyoutFooterECOResetButton"
                    onClick={handleResetClick}
                  >
                    Reset
                  </Button>
                  <div className="update-reset">
                    <Button onClick={handleEditSubmit}>Update</Button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "effectedparts" && (
            <>
              {selectedEco?.status === "Draft" && (
                <div className="EditECOEffectedPartsFooterDraft">
                  <Button onClick={handleSubmitECO} className="HighlightBtn">
                    Submit
                  </Button>
                </div>
              )}
              {selectedEco?.status === "Submitted" &&
                hasPermissionToApprove && (
                  <div className="EditECOEffectedPartsFooter">
                    <Button onClick={handleAddRejectECONotes}>Reject</Button>
                    <Button
                      onClick={handleAddApproveECONotes}
                      className="HighlightBtn"
                    >
                      Approve
                    </Button>
                  </div>
                )}
            </>
          )}

          <Popover
            open={!!addNotesDrawer || !!addApproveNotesDrawer}
            anchorEl={addNotesDrawer || addApproveNotesDrawer}
            onClose={() => handleCloseAddNotesDrawer()}
            anchorOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
          >
            <div className="EcoRejectNotesPopOver">
              <div className="AddRejectionNotesHeader">
                <h3>
                  {`Add ${
                    addApproveNotesDrawer ? "Approval" : "Rejection"
                  } Notes:`}{" "}
                </h3>
              </div>
              <TextField
                label="Add Notes"
                multiline
                rows={8}
                fullWidth
                value={approverECONotes}
                onChange={(e) => {
                  setApproverECONotes(e.target.value);
                  if (e.target.value.trim() === "") {
                    setAddNotesError("Rejection notes are required.");
                  } else {
                    setAddNotesError(null);
                  }
                }}
                helperText={addNotesError}
                error={!!addNotesError}
                required={!addApproveNotesDrawer}
              />
              <div className="EcoRejectNotesActions">
                <Button
                  onClick={() => handleCloseAddNotesDrawer()}
                  className="CancelButton"
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    addApproveNotesDrawer ? handleApproveECO : handleRejectECO
                  }
                >
                  Confirm
                </Button>
              </div>
            </div>
          </Popover>

          <Popover
            open={!!showNotesDrawer}
            anchorEl={showNotesDrawer}
            onClose={() => handleCloseShowNotesDrawer()}
            anchorOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
          >
            <div className="EcoRejectNotesPopOver">
              <div className="EcoRejectNotesHeader">
                <h3>Rejection Notes by: {selectedEcoLog?.actionBy}</h3>
                <p>Rejected on: {formatDate(selectedEcoLog?.createdAt)}</p>
              </div>
              <TextField
                label="Notes"
                multiline
                rows={8}
                fullWidth
                value={selectedEcoLog?.notes || ""}
                InputProps={{ readOnly: true }}
              />
              <div className="EcoRejectNotesActions">
                <Button
                  onClick={() => handleCloseShowNotesDrawer()}
                  className="CancelButton"
                >
                  Close
                </Button>
              </div>
            </div>
          </Popover>

          <Popover
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={handleClosePopover}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            <div className="EcoDataGridDesPopOver">
              <TextField
                label="Edit Description"
                multiline
                rows={4}
                fullWidth
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
              />
              <Button onClick={handleSaveDescription}>Save</Button>
            </div>
          </Popover>
          <ResizableDrawer
            anchor="right"
            open={errorDisplay}
            onClose={() => setErrorDisplay(false)}
            defaultWidth={60}
            maxWidth={70}
          >
            <ECOErrorDisplay
              handleCloseClick={() => setErrorDisplay(false)}
              errorData={submissionError}
              selectedEco={selectedEco}
              fetchEcoPartsData={fetchEcoPartsData}
            />
          </ResizableDrawer>
          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default EditEco;
