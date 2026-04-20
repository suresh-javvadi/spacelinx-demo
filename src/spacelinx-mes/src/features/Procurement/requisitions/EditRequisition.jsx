import React, { useEffect, useState, useContext, useMemo } from "react";
import { Tab, TextField, Button, Autocomplete, Divider } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import {
  fetchRequisitionById,
  updateRequisition,
  submitRequisition,
  rejectRequisition,
  approveRequisition,
} from "../../../services/requisitionService";
import {
  createPartItem,
  fetchPartsWithGoodsAndServices,
  fetchUniqueParts,
} from "../../../services/partService";
import { fetchUserLookup } from "../../../services/userService";

import "./requisition.css";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../../userContext/UserContext";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { usePartDetailsDrawer } from "../../admin/parts/PartDetailsContext";
import RequisitionApprovalTracker from "./RequisitionApprovalTracker";
import Documents from "../../../Components/Documents/Documents";
import { fetchApprovalConfigByType } from "../../../services/approvalsConfigService";
import { fetchFullBOMConsolidated } from "../../../services/childPartService";
import { createFilterOptions } from "@mui/material/Autocomplete";

const EditRequisition = ({
  handleCloseClick,
  handleRefresh,
  projectsData,
  selectedRequisition,
  userData,
}) => {
  const normalizeApproverUser = (user) => ({
    id: user?.id || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const normalizeApprovers = (approversList = []) =>
    approversList
      .map((stage) => ({
        stage: Number(stage?.stage),
        users: (stage?.users || [])
          .map(normalizeApproverUser)
          .sort(
            (a, b) =>
              a.email.localeCompare(b.email) || a.id.localeCompare(b.id),
          ),
      }))
      .filter((stage) => stage.users.length > 0)
      .sort((a, b) => a.stage - b.stage);

  const normalizeFormData = (data) => {
    if (!data) return null;

    return {
      requestedById: data.requestedById || "",
      requiredByDate: data.requiredByDate || "",
      priority: data.priority || "",
      title: data.title || "",
      projectId: data.projectId || null,
      justification: data.justification || "",
      approvers: normalizeApprovers(data.approvers),
    };
  };

  const normalizeLineItems = (items = []) =>
    items.map((item) => ({
      id: item?.id || null,
      partId: item?.partId || item?.part?.id || null,
      quantity: Number(item?.quantity || 0),
      description: item?.description || "",
    }));

  const { Alert } = useContext(AlertsContext);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const filter = createFilterOptions();

  const {
    activeRole,
    isSuperAdmin,
    hasPermission,
    userData: currentUser,
  } = useUserContext();
  const projectOptions = projectsData || [];
  const [formData, setFormData] = useState({
    requestedById: "",
    requiredByDate: "",
    priority: "Low",
    title: "",
    projectId: null,
    justification: "",
    approvers: [],
  });

  const [lineItems, setLineItems] = useState([]);
  const [partsOptions, setPartsOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [originalLineItems, setOriginalLineItems] = useState([]);
  const [newLineItem, setNewLineItem] = useState({
    part: null,
    quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [lineItemErrors, setLineItemErrors] = useState({});
  const requisitionId = selectedRequisition?.id;
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [editIndex, setEditIndex] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [approvalConfig, setApprovalConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [blockSubmit, setBlockSubmit] = useState(false);
  useEffect(() => {
    const isSame =
      JSON.stringify(normalizeFormData(originalData)) ===
        JSON.stringify(normalizeFormData(formData)) &&
      JSON.stringify(normalizeLineItems(originalLineItems)) ===
        JSON.stringify(normalizeLineItems(lineItems));

    setBlockSubmit(isSame);
  }, [formData, originalData, lineItems, originalLineItems]);

  const isRequestorSelf = useMemo(() => {
    if (!selectedRequisition?.userEmail || !currentUser) return false;
    return selectedRequisition.userEmail === currentUser.email;
  }, [selectedRequisition?.userEmail, currentUser]);

  const approverOptions = useMemo(() => {
    if (!userData) return [];
    if (isSuperAdmin) return userData;

    return userData.filter(
      (u) => u.email?.toLowerCase() !== currentUser?.email?.toLowerCase(),
    );
  }, [userData]);

  useEffect(() => {
    const fetchApprovalConfig = async () => {
      setLoadingConfig(true);
      try {
        const data = await fetchApprovalConfigByType("Requisition");
        setApprovalConfig(data);
      } catch (error) {
        console.error(error);
        Alert("Failed to load approval configuration.", "error");
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchApprovalConfig();
  }, []);

  const currentUserId = userData?.id || null;
  const activeStage = useMemo(() => {
    if (!approvals?.length) return null;

    const pendingStages = approvals
      .filter((a) => a.status === "Pending")
      .map((a) => a.stageNumber);

    return pendingStages.length ? Math.min(...pendingStages) : null;
  }, [approvals]);

  const canCurrentUserApprove = useMemo(() => {
    if (!activeStage || !currentUserId) return false;

    return approvals.some(
      (a) =>
        a.stageNumber === activeStage &&
        a.approverId === currentUserId &&
        a.status === "Pending",
    );
  }, [approvals, activeStage, currentUserId]);

  const newFlyoutTabChange = (event, newValue) =>
    setEditFlyOutTabsValue(newValue);

  const handleRequisitionAction = async (
    actionFn,
    title,
    message,
    successMsg,
    confirmMsg,
  ) => {
    const confirmed = await showConfirmation(title, message, confirmMsg);
    if (!confirmed) return;

    setLoadingData(true);
    try {
      await actionFn(selectedRequisition?.id);
      if (successMsg) {
        showAlert("success", "Success", successMsg);
      }
      handleRefresh();
      handleCloseClick();
    } catch (error) {
      console.error("Action failed:", error);
      if (error?.response?.status === 400) {
        showAlert(
          "error",
          "Approval Failed",
          "User is not a pending approver for this entity.",
        );
      } else {
        showAlert("error", "Failed", "Something went wrong. Try again.");
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [requisitionId]);
  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [user, parts, goodsServices] = await Promise.all([
        fetchUserLookup(),
        fetchUniqueParts(),
        fetchPartsWithGoodsAndServices(),
      ]);

      const response = await fetchRequisitionById(requisitionId);
      setApprovals(response.approvals || []);
      const approvals = response.approvals || [];
      const req = response.requisition;
      const groupedApprovers = {};
      approvals.forEach((approval) => {
        const stage = approval.stageNumber;
        if (!groupedApprovers[stage]) {
          groupedApprovers[stage] = { stage, users: [] };
        }
        if (approval.approver) {
          groupedApprovers[stage].users.push(approval.approver);
        }
      });

      const initialData = {
        requestedById: req?.requestedById || "",
        requiredByDate: req?.requiredByDate?.split("T")[0] || "",
        priority: req?.priority || "Low",
        title: req?.title || "",
        projectId: req?.projectId || null,
        justification: req?.justification || "",
        approvals: approvals,
        approvers: Object.values(groupedApprovers),
      };

      setFormData(initialData);
      setOriginalData(initialData);
      setApprovers(Object.values(groupedApprovers));
      setLineItems(req?.requisitionLineItems || []);
      setOriginalLineItems(req?.requisitionLineItems || []);
      setUserOptions(user);
      const existingParts = (req?.requisitionLineItems || [])
        .map((item) => item.part)
        .filter(Boolean);
      const releasedParts = parts.filter((part) => part.status === "Release");
      const onlyGoodsServices = (goodsServices || []).filter(
        (item) => item.itemType === "Goods" || item.itemType === "Services",
      );
      let mergedParts = [
        ...releasedParts,
        ...onlyGoodsServices.filter(
          (gs) => !releasedParts.some((p) => p.id === gs.id),
        ),
      ];
      mergedParts = [
        ...mergedParts,
        ...existingParts.filter(
          (ep) => !mergedParts.some((mp) => mp.id === ep.id),
        ),
      ];

      setPartsOptions(mergedParts);
    } catch (err) {
      Alert("Failed to load requisition data", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const rows = useMemo(
    () =>
      lineItems.map((item, index) => {
        const matchedPart =
          partsOptions.find((p) => p.id === item.partId) || item.part || null;

        return {
          id: item.id || `temp-${index}`,
          part: matchedPart,
          partNumber: matchedPart?.partNumber || "(Unknown Part)",
          partName: matchedPart?.name || "(Unknown Part)",
          itemType: matchedPart?.itemType || item.itemType,
          quantity: item.quantity,
          description: item.description,
          originalIndex: index,
        };
      }),
    [lineItems, partsOptions],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.requestedById)
      newErrors.requestedById = "Requested By is required";
    if (!formData.priority) newErrors.priority = "Priority is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!approvers?.length) return;
    const mappedApprovals = approvers.flatMap((stage) =>
      stage.users.map((user) => ({
        stageNumber: stage.stage,
        approverId: user.id,
        approver: user,
      })),
    );
    setApprovals(mappedApprovals);
  }, [approvers]);

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoadingData(true);
    try {
      const payload = {
        requestedById: formData.requestedById,
        requiredByDate: formData.requiredByDate,
        priority: formData.priority,
        title: formData.title,
        projectId: formData.projectId,
        justification: formData.justification,
        lineItems: lineItems.map((item) => {
          const matchedPart =
            partsOptions.find((p) => p.id === item.partId) || item.part || {};

          return {
            ...(item.id &&
            typeof item.id === "string" &&
            !item.id.startsWith("new-")
              ? { id: item.id }
              : {}),
            partId: item.partId,
            name: matchedPart?.name || "",
            itemType: matchedPart?.itemType || "",
            quantity: parseInt(item.quantity),
            description: item.description,
          };
        }),

        approvals: approvals.map((a) => ({
          id: a.id,
          stageNumber: a.stageNumber,
          approverId: a.approverId,
          status: a.status,
          actedAt: a.actedAt,
          comment: a.comment,
        })),
      };

      await updateRequisition(requisitionId, payload);
      Alert("Requisition updated successfully", "success");
      handleRefresh();
      fetchData();
    } catch (err) {
      console.error("Update Error:", err);
      Alert(
        err?.response?.data?.message || "Failed to update requisition",
        "error",
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setApprovers(originalData.approvers || []);
    }
    setLineItems(originalLineItems || []);
    setReadOnlyMode(true);
    setErrors({});
    setLineItemErrors({});
    setNewLineItem({ part: null, quantity: "", description: "" });
  };

  const handleAddLineItem = async () => {
    const errors = {
      part: newLineItem.part ? "" : "Part is required",
      quantity: newLineItem.quantity ? "" : "Quantity is required",
    };

    if (errors.part || errors.quantity) {
      setLineItemErrors(errors);
      return;
    }

    const selectedPart = newLineItem.part;
    const qty = Number(newLineItem.quantity || 1);

    // 🔒 CASE 1: EDIT MODE → UPDATE EXISTING ROW ONLY
    if (editIndex !== null) {
      setLineItems((prev) =>
        prev.map((item, idx) =>
          idx === editIndex
            ? {
                ...item,
                partId: selectedPart.id,
                quantity: qty,
                description: newLineItem.description,
              }
            : item,
        ),
      );

      resetLineItemState();
      return;
    }

    // ➕ CASE 2: ADD MODE → CHECK BOM
    const fullBom = await fetchFullBOMConsolidated(selectedPart.id);

    if (fullBom?.length > 0) {
      await addEbomPartsToGrid(selectedPart, qty, fullBom);
      resetLineItemState();
      return;
    }

    // ➕ CASE 3: ADD NON-BOM PART
    setLineItems((prev) => [
      ...prev,
      {
        partId: selectedPart.id,
        quantity: qty,
        description: newLineItem.description,
        isBom: false,
      },
    ]);

    resetLineItemState();
  };

  const resetLineItemState = () => {
    setNewLineItem({ part: null, quantity: "", description: "" });
    setLineItemErrors({});
    setEditIndex(null);
  };

  const addEbomPartsToGrid = async (parentPart, parentQty, fullBom) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const parentIndex = updated.findIndex(
        (item) => (item.partId || item.part?.id) === parentPart.id,
      );
      const parentItem = {
        partId: parentPart.id,
        quantity: parentQty,
        description: newLineItem.description,
        isBom: false,
      };

      if (parentIndex !== -1) {
        updated[parentIndex] = {
          ...updated[parentIndex],
          ...parentItem,
        };
      } else {
        updated.push(parentItem);
      }

      fullBom.forEach((child) => {
        if (!child?.id) return;

        const bomQty = child.totalQuantity ?? 1;
        const finalQty = parentQty * bomQty;

        const existingIndex = updated.findIndex(
          (item) => (item.partId || item.part?.id) === child.id,
        );
        const childItem = {
          partId: child.id,
          quantity: finalQty,
          description: `Full BOM of ${parentPart.partNumber} (${parentPart.name})`,
          isBom: true,
        };

        if (existingIndex !== -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...childItem,
          };
        } else {
          updated.push(childItem);
        }
      });

      return updated;
    });

    Alert("Parent part and consolidated BOM items added", "info");
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
      field: "partNumber",
      headerName: "Item",
      flex: 1,
      renderCell: ({ row }) => {
        const part = row?.part;

        const partNumber = part?.partNumber || "";
        const partName = part?.name || "";

        const partLabel = part
          ? `${partNumber} - ${partName}`
          : row?.partName || "";

        const isGoods = partNumber.startsWith("GDS");
        const isService = partNumber.startsWith("SVC");

        if (!part || isGoods || isService) {
          return <span>{partLabel}</span>;
        }

        return (
          <div
            className="AppHyperLink"
            onClick={(e) => {
              e.stopPropagation();
              openPartDetailsDrawer({
                partNumberSuffix: part.partNumberSuffix,
                partNumber: part.partNumber,
              });
            }}
          >
            {partLabel}
          </div>
        );
      },
      valueGetter: (_value, row) => row?.part?.partNumber || "",
    },
    {
      field: "partName",
      headerName: "Item Name",
      flex: 1,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      type: "number",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      filterable: false,
      renderCell: ({ row }) => {
        const handleDelete = async () => {
          const confirmed = await showConfirmation(
            "Delete Line Item?",
            "Are you sure you want to delete this line item?",
          );
          if (!confirmed) return;

          const index = row.originalIndex;
          setLineItems((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
          });

          showAlert("success", "Deleted!", "Line item removed.");
        };

        return !readOnlyMode ? (
          <ion-icon
            name="trash-outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          />
        ) : null;
      },
    },
  ];

  const createItem = async (input, type) => {
    const payload = {
      name: input,
      unitPrice: 0,
      itemType: type,
    };

    try {
      const newPart = await createPartItem(payload);

      Alert(`${input} Created Successfully as ${type}`, "success");

      setPartsOptions((prev) => [...prev, newPart]);

      return newPart;
    } catch (error) {
      console.error("Create Item Error:", error?.response?.data || error);

      Alert(
        error?.response?.data?.message ||
          `Failed to create ${input} as ${type}`,
        "error",
      );

      return null;
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>{selectedRequisition?.reqNumber}</h2>
        <div className="ActionsContainer">
          {selectedRequisition?.status && (
            <>
              Status:{" "}
              <span
                className={
                  selectedRequisition?.status === "Submitted"
                    ? "status-submitted"
                    : selectedRequisition?.status === "Approved"
                      ? "status-released"
                      : ""
                }
              >
                {selectedRequisition?.status === "Draft"
                  ? ""
                  : selectedRequisition?.status}
              </span>
            </>
          )}
          {readOnlyMode && selectedRequisition?.status === "Draft" && (
            <button
              onClick={() => {
                if (hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)) {
                  setReadOnlyMode(false);
                } else {
                  Alert("You do not have access to Edit..!", "warning");
                }
              }}
            >
              <ion-icon name="create-outline"></ion-icon>
            </button>
          )}
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      <div className="RequisitonApprovals">
        <RequisitionApprovalTracker
          approvers={formData.approvals}
          loadingData={loadingData}
        />
      </div>

      <TabContext value={editFlyOutTabsValue}>
        <div className="EditFlyoutTabsPanel">
          <TabList onChange={newFlyoutTabChange} centered variant="fullWidth">
            <Tab label="Details" value="1" />
            <Divider orientation="vertical" flexItem />
            <Tab label="Line Items" value="2" />
            <Divider orientation="vertical" flexItem />
            <Tab label="Documents" value="3" fullWidth />
          </TabList>
        </div>
        {loadingData ? (
          <div className="loader-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : (
          <>
            <TabPanel value="1" className="reqNewFlyoutTabPanel">
              <div className="FlyoutScrollableContent">
                <div className="GrnNewFlyoutContent">
                  <TextField
                    label="Title"
                    name="title"
                    fullWidth
                    value={formData.title}
                    onChange={handleChange}
                    inputProps={{ readOnly: readOnlyMode }}
                    error={!!errors.title}
                    helperText={errors.title}
                    required
                  />

                  <Autocomplete
                    options={userOptions}
                    getOptionLabel={(option) =>
                      `${option?.firstName || ""} ${option?.lastName || ""}`
                    }
                    value={
                      userOptions.find(
                        (s) => s.id === formData.requestedById,
                      ) || null
                    }
                    onChange={(e, val) =>
                      !readOnlyMode &&
                      setFormData((prev) => ({
                        ...prev,
                        requestedById: val?.id || "",
                      }))
                    }
                    readOnly={readOnlyMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Requested By"
                        fullWidth
                        error={!!errors.requestedById}
                        helperText={errors.requestedById}
                        required
                      />
                    )}
                  />

                  <TextField
                    label="Request Date"
                    name="requiredByDate"
                    type="date"
                    fullWidth
                    value={formData.requiredByDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ readOnly: readOnlyMode }}
                    error={!!errors.requiredByDate}
                    helperText={errors.requiredByDate}
                  />

                  <Autocomplete
                    options={["Low", "Medium", "High"]}
                    value={formData.priority}
                    onChange={(e, val) =>
                      !readOnlyMode &&
                      setFormData((prev) => ({ ...prev, priority: val || "" }))
                    }
                    readOnly={readOnlyMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Priority"
                        fullWidth
                        error={!!errors.priority}
                        helperText={errors.priority}
                        required
                      />
                    )}
                  />

                  <Autocomplete
                    options={projectOptions}
                    getOptionLabel={(option) =>
                      `${option.projectCode} - ${option.name}` || ""
                    }
                    value={
                      projectOptions.find((p) => p.id === formData.projectId) ||
                      null
                    }
                    onChange={(e, val) =>
                      !readOnlyMode &&
                      setFormData((prev) => ({
                        ...prev,
                        projectId: val?.id || "",
                      }))
                    }
                    readOnly={readOnlyMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Project"
                        fullWidth
                        error={!!errors.projectId}
                        helperText={errors.projectId}
                      />
                    )}
                  />

                  <TextField
                    label="Justification"
                    name="justification"
                    fullWidth
                    multiline
                    minRows={3}
                    value={formData.justification}
                    onChange={handleChange}
                    inputProps={{ readOnly: readOnlyMode }}
                    error={!!errors.justification}
                    helperText={errors.justification}
                  />

                  <span className="ApproversLabel">Approvers</span>
                  <div className="MultiStageApprovers">
                    {approvalConfig?.numberOfLevels &&
                      Array.from(
                        { length: approvalConfig.numberOfLevels },
                        (_, idx) => {
                          const stage = idx + 1;
                          const stageData = formData.approvers?.find(
                            (a) => a.stage === stage,
                          );
                          const stageUsers = stageData?.users || [];
                          return (
                            <div key={stage} style={{ marginTop: "16px" }}>
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
                                    fontWeight: 500,
                                  }}
                                >
                                  Stage {stage}
                                </span>

                                <Autocomplete
                                  multiple
                                  limitTags={2}
                                  options={approverOptions}
                                  value={stageUsers}
                                  readOnly={readOnlyMode}
                                  loading={loadingData}
                                  getOptionDisabled={(option) =>
                                    approvers.some(
                                      (s) =>
                                        s.stage !== stage &&
                                        s.users?.some(
                                          (u) =>
                                            u.email?.toLowerCase() ===
                                            option.email?.toLowerCase(),
                                        ),
                                    )
                                  }
                                  getOptionLabel={(o) =>
                                    `${o?.firstName ?? ""} ${
                                      o?.lastName ?? ""
                                    }`.trim()
                                  }
                                  isOptionEqualToValue={(o, v) =>
                                    o.email === v.email
                                  }
                                  onChange={(e, newValue) => {
                                    // Map users to minimal structure
                                    const mappedUsers = newValue.map((u) => ({
                                      id: u.id,
                                      firstName: u.firstName,
                                      lastName: u.lastName,
                                      email: u.email,
                                    }));

                                    setApprovers((prev) => {
                                      // Remove these users from all other stages
                                      const cleaned = prev.map((s) =>
                                        s.stage !== stage
                                          ? {
                                              ...s,
                                              users: s.users.filter(
                                                (u) =>
                                                  !mappedUsers.some(
                                                    (m) =>
                                                      m.email?.toLowerCase() ===
                                                      u.email?.toLowerCase(),
                                                  ),
                                              ),
                                            }
                                          : s,
                                      );

                                      // Update or add current stage
                                      const stageIndex = cleaned.findIndex(
                                        (s) => s.stage === stage,
                                      );
                                      if (stageIndex >= 0) {
                                        cleaned[stageIndex] = {
                                          stage,
                                          users: mappedUsers,
                                        };
                                      } else {
                                        cleaned.push({
                                          stage,
                                          users: mappedUsers,
                                        });
                                      }

                                      const newApprovers = [...cleaned];
                                      setFormData((prevForm) => ({
                                        ...prevForm,
                                        approvers: newApprovers,
                                      }));
                                      return newApprovers;
                                    });
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder={`Select Approver(s) for Stage ${stage}`}
                                      fullWidth
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
              </div>
            </TabPanel>

            <TabPanel value="2" className="reqNewFlyoutTabPanel">
              <div className="FlyoutScrollableContent">
                <div className="GrnNewFlyoutContent">
                  {!readOnlyMode && (
                    <div className="reqEditLineItems">
                      <Autocomplete
                        options={partsOptions}
                        getOptionLabel={(option) => {
                          if (option.partNumber) {
                            return `${option.partNumber} - ${option.name}`;
                          }
                          if (option?.isCustom) {
                            return `Add ${option.type}: "${option.name}"`;
                          }

                          return option?.name || "";
                        }}
                        value={newLineItem.part}
                        filterOptions={(options, state) => {
                          const filtered = filter(options, state);
                          const { inputValue } = state;

                          if (inputValue) {
                            const customOptions = [];

                            const isGoodsExist = filtered.some(
                              (opt) =>
                                opt.name === inputValue &&
                                opt.itemType === "Goods",
                            );

                            if (!isGoodsExist) {
                              customOptions.push({
                                name: inputValue,
                                type: "Goods",
                                itemType: "Goods",
                                isCustom: true,
                              });
                            }

                            const isServiceExist = filtered.some(
                              (opt) =>
                                opt.name === inputValue &&
                                opt.itemType === "Services",
                            );

                            if (!isServiceExist) {
                              customOptions.push({
                                name: inputValue,
                                type: "Services",
                                itemType: "Services",
                                isCustom: true,
                              });
                            }

                            return [...customOptions, ...filtered];
                          }

                          return filtered;
                        }}
                        onChange={async (e, newValue) => {
                          if (newValue?.isCustom) {
                            const createdPart = await createItem(
                              newValue.name,
                              newValue.type,
                            );

                            if (createdPart) {
                              setNewLineItem({
                                part: createdPart,
                                quantity: 1,
                                description: "",
                              });
                            }

                            return;
                          }

                          const existingIndex = lineItems.findIndex(
                            (item) =>
                              (item.partId || item.part?.id) === newValue?.id,
                          );

                          const matchedItem = lineItems[existingIndex];

                          setNewLineItem((prev) => ({
                            ...prev,
                            part: newValue,
                            quantity: matchedItem?.quantity ?? "",
                            description: matchedItem?.description ?? "",
                          }));

                          if (existingIndex !== -1) {
                            setEditIndex(existingIndex);
                            Alert("Part already exists...!", "warning");
                          } else {
                            setEditIndex(null);
                          }
                        }}
                        renderOption={(props, option) => {
                          if (option.isCustom) {
                            return (
                              <li {...props} className="LineItemsPartOption">
                                <p className="AddOption">+ Add {option.type}</p>
                                <div style={{ display: "flex", gap: "5px" }}>
                                  <strong>Name</strong>
                                  <p>:</p>
                                  <p>{option.name}</p>
                                </div>
                              </li>
                            );
                          }

                          return (
                            <li {...props}>
                              {option.partNumber} - {option.name} (
                              {option.itemType || "Part"})
                            </li>
                          );
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Item"
                            required
                            error={!!lineItemErrors.part}
                            helperText={lineItemErrors.part}
                          />
                        )}
                      />

                      <TextField
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={newLineItem.quantity}
                        onChange={(e) =>
                          setNewLineItem((prev) => ({
                            ...prev,
                            quantity: e.target.value,
                          }))
                        }
                        fullWidth
                        required
                        error={!!lineItemErrors.quantity}
                        helperText={lineItemErrors.quantity}
                      />

                      <TextField
                        label="Description"
                        name="description"
                        value={newLineItem.description}
                        multiline
                        rows={4}
                        onChange={(e) =>
                          setNewLineItem((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        fullWidth
                      />

                      <div className="AddLineItemButtonContainer">
                        {editIndex !== null && (
                          <Button
                            onClick={() => {
                              setNewLineItem({
                                part: null,
                                quantity: "",
                                description: "",
                              });
                              setEditIndex(null);
                              setLineItemErrors({});
                            }}
                            className="CancelButton"
                          >
                            Cancel
                          </Button>
                        )}

                        <Button
                          onClick={() => {
                            if (
                              hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)
                            ) {
                              handleAddLineItem();
                            } else {
                              Alert(
                                "You do not have permission to perform this action!",
                                "warning",
                              );
                            }
                          }}
                        >
                          {editIndex !== null ? "Update" : "Add"}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="reqEditLineItemsGrid">
                    <StyledDataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={5}
                      onRowClick={(params) => {
                        const row = params.row;
                        const originalItem = lineItems[row.originalIndex];
                        const matchedPart = partsOptions.find(
                          (p) => p.id === originalItem.partId,
                        );

                        setNewLineItem({
                          part: matchedPart || null,
                          quantity: originalItem.quantity.toString(),
                          description: originalItem.description || "",
                        });

                        setEditIndex(row.originalIndex);
                      }}
                      className="reqEditLineItemsGrid"
                    />
                  </div>
                </div>
              </div>
            </TabPanel>

            <TabPanel value="3" className="reqNewFlyoutTabPanel">
              <div className="GrnNewFlyoutContent">
                <Documents
                  entityId={selectedRequisition?.id}
                  entityType="Requisition"
                  entityNumber={selectedRequisition?.reqNumber}
                  canEdit={hasPermission(
                    PERMISSIONS.REQUISITIONS.DOCUMENTS.MODIFY,
                  )}
                  canDelete={PERMISSIONS.REQUISITIONS.DOCUMENTS.DELETE}
                  isDraft={selectedRequisition?.status === "Draft"}
                  tittle="Line Items Documents"
                />
              </div>
            </TabPanel>

            {!readOnlyMode && selectedRequisition?.status === "Draft" && (
              <div className="EditFlyoutFooter RequisitionEditFlyoutFooter">
                <Button className="CancelButton" onClick={handleReset}>
                  Reset
                </Button>
                <div className="update-reset">
                  <Button
                    disabled={!blockSubmit}
                    onClick={() => {
                      if (hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)) {
                        if (lineItems.length === 0) {
                          Alert(
                            "Please add at least one line item before submitting.",
                            "warning",
                          );
                          return;
                        }
                        if (!approvers.length) {
                          Alert(
                            "Please add at least one approver before submitting.",
                            "warning",
                          );
                          return;
                        }
                        if (!blockSubmit) {
                          Alert(
                            "Please update the requisition before submitting.",
                            "warning",
                          );
                          return;
                        }
                        handleRequisitionAction(
                          submitRequisition,
                          "Submit Requisition?",
                          "Are you sure you want to submit this requisition?",
                          "Requisition submitted successfully.",
                          "Yes, Submit it!",
                        );
                      } else {
                        Alert(
                          "You do not have permission to perform this action!",
                          "warning",
                        );
                      }
                    }}
                    className={
                      !hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)
                        ? "IonIconDisabled"
                        : undefined
                    }
                  >
                    Submit
                  </Button>
                  <Button onClick={handleUpdate}>Update</Button>
                </div>
              </div>
            )}
            {selectedRequisition?.status === "Submitted" &&
              (isSuperAdmin ||
                hasPermission(PERMISSIONS.REQUISITIONS.APPROVER)) && (
                <div className="EditFlyoutFooter RequisitionEditFlyoutFooter">
                  <Button
                    onClick={() => {
                      if (hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)) {
                        handleRequisitionAction(
                          rejectRequisition,
                          "Reject Requisition?",
                          "Are you sure you want to reject this requisition?",
                          "Requisition rejected successfully.",
                          "Yes, Reject it!",
                        );
                      } else {
                        Alert(
                          "You do not have permission to perform this action!",
                          "warning",
                        );
                      }
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      if (!isSuperAdmin && isRequestorSelf) {
                        Alert(
                          "You cannot approve your own requisition!",
                          "warning",
                        );
                        return;
                      }
                      if (hasPermission(PERMISSIONS.REQUISITIONS.MODIFY)) {
                        handleRequisitionAction(
                          approveRequisition,
                          "Approve Requisition?",
                          "Are you sure you want to approve this requisition?",
                          "Requisition approved successfully.",
                          "Yes, Approve it!",
                        );
                      } else {
                        Alert(
                          "You do not have permission to perform this action!",
                          "warning",
                        );
                      }
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}

            <div className="AlertMessages">
              <FlyoutAlerts />
            </div>
          </>
        )}
      </TabContext>
    </div>
  );
};

export default EditRequisition;
