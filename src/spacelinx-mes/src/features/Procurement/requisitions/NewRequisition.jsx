import React, { useState, useEffect, useRef, useContext } from "react";
import { Tab, TextField, Button, Autocomplete } from "@mui/material";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { createRequisition } from "../../../services/requisitionService";
import {
  createPartItem,
  fetchPartsWithGoodsAndServices,
  fetchUniqueParts,
} from "../../../services/partService";
import { fetchUserLookup } from "../../../services/userService";
import "./requisition.css";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import { fetchFullBOMConsolidated } from "../../../services/childPartService";
import { usePartDetailsDrawer } from "../../admin/parts/PartDetailsContext";
import { createFilterOptions } from "@mui/material/Autocomplete";

const NewRequisition = ({ handleCloseClick, handleRefresh, projectsData }) => {
  const { Alert } = useContext(AlertsContext);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const filter = createFilterOptions();

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    requestedById: "",
    requiredByDate: today,
    priority: "Low",
    title: "",
    projectId: null,
    justification: "",
    // totalEstimatedAmount: 0,
  });
  const [errors, setErrors] = useState({});
  const [lineItems, setLineItems] = useState([]);
  const [lineItem, setLineItem] = useState({
    part: null,
    quantity: 1,
    description: "",
  });
  const [lineItemErrors, setLineItemErrors] = useState({});
  const [partsOptions, setPartsOptions] = useState([]);
  const [partsLoading, setPartsLoading] = useState(true);
  const staffCache = useRef(null);
  const [staffOptions, setStaffOptions] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [editIndex, setEditIndex] = useState(null);

  const newFlyoutTabChange = (event, newValue) =>
    setEditFlyOutTabsValue(newValue);

  useEffect(() => {
    const loadStaff = async () => {
      if (staffCache.current) {
        setStaffOptions(staffCache.current);
        setStaffLoading(false);
        return;
      }

      try {
        const staff = await fetchUserLookup();
        staffCache.current = staff;
        setStaffOptions(staff);
      } catch (error) {
        Alert("Failed to fetch users", "error");
      } finally {
        setStaffLoading(false);
      }
    };

    const loadParts = async () => {
      try {
        setPartsLoading(true);
        const parts = await fetchUniqueParts();
        const releasedParts = parts.filter((part) => part.status === "Release");
        const goodsServices = await fetchPartsWithGoodsAndServices();
        const onlyGoodsServices = (goodsServices || []).filter(
          (item) => item.itemType === "Goods" || item.itemType === "Services",
        );
        const mergedData = [...releasedParts, ...onlyGoodsServices];
        setPartsOptions(mergedData);
      } catch (error) {
        console.error(error);
        Alert("Failed to fetch Items", "error");
      } finally {
        setPartsLoading(false);
      }
    };

    loadStaff();
    loadParts();
  }, []);
  const addOrUpdateParentWithBomLineItems = (
    parentPart,
    parentQty,
    fullBom,
  ) => {
    setLineItems((prev) => {
      const updated = [...prev];
      const parentIndex = updated.findIndex(
        (item) => item.part?.id === parentPart.id,
      );
      const parentItem = {
        part: parentPart,
        quantity: parentQty,
        description: lineItem.description || "",
        isBom: false,
      };

      if (parentIndex !== -1) {
        updated[parentIndex] = parentItem;
      } else {
        updated.push(parentItem);
      }

      fullBom.forEach((child) => {
        if (!child?.id) return;

        const bomQty = child.totalQuantity ?? 1;
        const finalQty = parentQty * bomQty;
        const existingIndex = updated.findIndex(
          (item) => item.part?.id === child.id,
        );
        const childItem = {
          part: child,
          quantity: finalQty,
          description: `Full BOM of ${parentPart.partNumber} (${parentPart.name})`,
          isBom: true,
        };

        if (existingIndex !== -1) {
          updated[existingIndex] = childItem;
        } else {
          updated.push(childItem);
        }
      });

      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleLineItemChange = (e) => {
    const { name, value } = e.target;
    setLineItem((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.requestedById) {
      newErrors.requestedById = "Requested By is required";
    }

    if (!formData.requiredByDate) {
      newErrors.requiredByDate = "Request Date is required";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (!formData.title) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLineItem = () => {
    const newErrors = {};
    if (!lineItem.part) {
      newErrors.part = "Part is required";
    }
    if (!lineItem.quantity) {
      newErrors.quantity = "Quantity is required";
    }

    setLineItemErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRowEdit = (row) => {
    setLineItem({
      part: row.part,
      quantity: row.quantity,
      description: row.description || "",
    });
    setEditIndex(row.id);
  };
  const addOrUpdateParentLineItem = (part, quantity) => {
    setLineItems((prev) => {
      const existingIndex = prev.findIndex((li) => li.part?.id === part.id);

      const newItem = {
        part,
        quantity,
        description: lineItem.description || "",
        isBom: false,
      };

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      }

      return [...prev, newItem];
    });
  };

  const resetLineItemState = () => {
    setLineItem({
      part: null,
      quantity: "",
      description: "",
    });
    setLineItemErrors({});
    setEditIndex(null);
  };

  const handleAddLineItem = async () => {
    if (!validateLineItem()) return;

    const parentPart = lineItem.part;
    const parentQty = Number(lineItem.quantity || 1);

    if (!parentPart?.id) {
      addOrUpdateParentLineItem(parentPart, parentQty);
      resetLineItemState();
      return;
    }

    try {
      const fullBom = await fetchFullBOMConsolidated(parentPart.id);

      if (Array.isArray(fullBom) && fullBom.length > 0) {
        addOrUpdateParentWithBomLineItems(parentPart, parentQty, fullBom);
        Alert("Parent part and consolidated BOM items added", "info");
        resetLineItemState();
        return;
      }

      if (false) {
        setLineItems((prev) => {
          const updated = [...prev];

          fullBom.forEach((child) => {
            if (!child?.id) return;

            const bomQty = child.totalQuantity ?? 1;
            const finalQty = parentQty * bomQty;

            const existingIndex = updated.findIndex(
              (li) => li.part?.id === child.id,
            );

            const newItem = {
              part: child,
              quantity: finalQty,
              description: `Full BOM of ${parentPart.partNumber} (${parentPart.name})`,
              isBom: true,
            };

            // 🔁 update instead of duplicate
            if (existingIndex !== -1) {
              updated[existingIndex] = newItem;
            } else {
              updated.push(newItem);
            }
          });

          return updated;
        });

        Alert("Consolidated BOM items added", "info");
        resetLineItemState();
        return;
      }

      // ✅ CASE 2: NO BOM → ADD PARENT ONLY
      addOrUpdateParentLineItem(parentPart, parentQty);
      resetLineItemState();
    } catch (err) {
      console.error(err);
      Alert("Failed to fetch BOM details", "error");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setEditFlyOutTabsValue("1");
      return;
    }

    if (
      !lineItems.length ||
      lineItems.every(
        (item) => !item?.part || (!item.part?.id && !item.part?.name),
      )
    ) {
      Alert("Please add at least one valid line item", "error");
      setEditFlyOutTabsValue("2");
      return;
    }

    const payload = {
      ...formData,
      lineItems: lineItems.map((item) => ({
        partId: item?.part?.id || null,
        name: item?.part?.name,
        itemType: item?.part?.itemType || "Part",
        quantity: parseInt(item?.quantity),
        description: item?.description,
      })),
    };

    setLoadingData(true);
    try {
      await createRequisition(payload);
      Alert("Requisition created successfully", "success");
      handleRefresh();
      handleCloseClick();
    } catch (err) {
      console.error(err);
      Alert("Failed to create requisition", "error");
    } finally {
      setLoadingData(false);
    }
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
        const isPart = !!row?.part?.id;

        return (
          <div
            className={isPart ? "AppHyperLink" : ""}
            style={{ cursor: isPart ? "pointer" : "default" }}
            onClick={(e) => {
              e.stopPropagation();

              if (isPart) {
                openPartDetailsDrawer(row.part);
              }
            }}
          >
            {row?.part?.partNumber
              ? `${row.part.partNumber}`
              : row?.part?.name || "---"}
          </div>
        );
      },
      valueGetter: (_value, row) => row.part?.partNumber || "",
    },
    {
      field: "partName",
      headerName: "Item Name",
      flex: 1,
      valueGetter: (_value, row) => row.part?.name || "",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 0.3,
      type: "number",
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      editable: true,
    },
  ];

  const createItem = async (input, type) => {
    setPartsLoading(true);
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
      console.error(error);
      Alert(`Failed to create ${input} as ${type}`, "error");
      return null;
    } finally {
      setPartsLoading(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>New Requisition</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      <TabContext value={editFlyOutTabsValue}>
        <div className="EditFlyoutTabsPanel">
          <TabList onChange={newFlyoutTabChange} centered variant="fullWidth">
            <Tab label="Details" value="1" />
            <Tab label="Line Items" value="2" />
          </TabList>
        </div>
        {loadingData ? (
          <div className="loader-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : (
          <>
            <TabPanel value="1" className="reqNewFlyoutTabPanel">
              <div className="GrnNewFlyoutContent">
                <TextField
                  label="Title"
                  name="title"
                  fullWidth
                  value={formData.title}
                  onChange={handleChange}
                  error={!!errors.title}
                  helperText={errors.title}
                  required
                />
                <Autocomplete
                  options={staffOptions}
                  getOptionLabel={(option) =>
                    `${option?.firstName || ""} ${option?.lastName || ""}`
                  }
                  value={
                    staffOptions?.find(
                      (s) => s.id === formData.requestedById,
                    ) || null
                  }
                  onChange={(e, newValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      requestedById: newValue?.id || "",
                    }));

                    if (newValue?.id) {
                      setErrors((prev) => ({
                        ...prev,
                        requestedById: "",
                      }));
                    }
                  }}
                  loading={staffLoading}
                  loadingText="Loading users..."
                  noOptionsText={staffLoading ? "Loading..." : "No users found"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Requested By"
                      required
                      fullWidth
                      error={!!errors.requestedById}
                      helperText={errors.requestedById}
                    />
                  )}
                />

                <TextField
                  label="Expected Date"
                  name="requiredByDate"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.requiredByDate}
                  onChange={handleChange}
                  error={!!errors.requiredByDate}
                  helperText={errors.requiredByDate}
                />

                <Autocomplete
                  options={["Low", "Medium", "High"]}
                  value={formData?.priority}
                  onChange={(e, newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: newValue || "",
                    }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Priority"
                      required
                      error={!!errors.priority}
                      helperText={errors.priority}
                    />
                  )}
                />

                <Autocomplete
                  options={projectsData}
                  getOptionLabel={(option) =>
                    `${option?.projectCode} -${option?.name}` || ""
                  }
                  value={
                    projectsData.find((p) => p.id === formData.projectId) ||
                    null
                  }
                  onChange={(e, newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectId: newValue?.id || "",
                    }))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Project"
                      name="projectId"
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
                  error={!!errors.justification}
                  helperText={errors.justification}
                />

                {/* <TextField
                  label="Total Estimated Amount"
                  name="totalEstimatedAmount"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                  value={formData.totalEstimatedAmount}
                  onChange={handleChange}
                  error={!!errors.totalEstimatedAmount}
                  helperText={errors.totalEstimatedAmount}
                /> */}
              </div>
            </TabPanel>
            <TabPanel value="2" className="reqNewFlyoutTabPanel">
              <div className="GrnNewFlyoutContent">
                <Autocomplete
                  key={lineItem.part?.id || lineItem.part?.name || "empty"}
                  options={partsOptions}
                  loading={partsLoading}
                  getOptionLabel={(option) => {
                    if (option?.partNumber) {
                      return `${option.partNumber} - ${option.name}`;
                    }

                    if (option?.isCustom) {
                      return `Add ${option.type}: "${option.name}"`;
                    }

                    return option?.name || "";
                  }}
                  value={lineItem.part}
                  onChange={async (e, newValue) => {
                    if (newValue?.isCustom) {
                      const createdPart = await createItem(
                        newValue.name,
                        newValue.type,
                      );

                      if (createdPart) {
                        setLineItem({
                          part: createdPart,
                          quantity: 1,
                          description: "",
                        });
                      }

                      return;
                    }

                    const existingIndex = lineItems.findIndex(
                      (item) => item.part?.id === newValue?.id,
                    );

                    const matchedItem = lineItems[existingIndex];

                    setLineItem((prev) => ({
                      ...prev,
                      part: newValue,
                      quantity: matchedItem?.quantity ?? "",
                      description: matchedItem?.description ?? "",
                    }));

                    if (existingIndex !== -1) {
                      const matchedItem = lineItems[existingIndex];

                      setLineItem({
                        part: newValue,
                        quantity: matchedItem.quantity,
                        description: matchedItem.description || "",
                      });

                      setEditIndex(existingIndex);
                      Alert("Part already exists...!", "warning");
                      return;
                    }

                    setLineItem({
                      part: newValue,
                      quantity: 1,
                      description: "",
                    });

                    setEditIndex(null);
                  }}
                  filterOptions={(options, state) => {
                    const filtered = filter(options, state);
                    const { inputValue } = state;

                    if (inputValue) {
                      const customOptions = [];

                      const isGoodsExist = filtered.some(
                        (opt) =>
                          opt.name === inputValue && opt.itemType === "Goods",
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
                  value={lineItem.quantity}
                  onChange={handleLineItemChange}
                  fullWidth
                  required
                  error={!!lineItemErrors.quantity}
                  helperText={lineItemErrors.quantity}
                />

                <TextField
                  label="Description"
                  name="description"
                  value={lineItem.description}
                  onChange={handleLineItemChange}
                  multiline
                  rows={4}
                  fullWidth
                />

                <div className="AddLineItemButtonContainer">
                  {editIndex !== null && (
                    <Button
                      onClick={() => {
                        setLineItem({
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
                  <Button onClick={handleAddLineItem}>
                    {editIndex !== null ? "Update" : "Add"}
                  </Button>
                </div>

                {lineItems.length > 0 && (
                  <div className="LineItemsGrid">
                    <StyledDataGrid
                      rows={lineItems.map((item, i) => ({ id: i, ...item }))}
                      columns={columns}
                      pageSize={5}
                      onRowClick={(params) => handleRowEdit(params.row)}
                    />
                  </div>
                )}
              </div>
            </TabPanel>

            <div className="CreateFlyoutFooter">
              <Button onClick={handleCloseClick} className="CancelButton">
                Cancel
              </Button>
              {editFlyOutTabsValue === "1" ? (
                <Button
                  onClick={() => validateForm() && setEditFlyOutTabsValue("2")}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>Create</Button>
              )}
            </div>
            <div className="AlertMessages">
              <FlyoutAlerts />
            </div>
          </>
        )}
      </TabContext>
    </div>
  );
};

export default NewRequisition;
