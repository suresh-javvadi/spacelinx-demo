import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  TextField,
  Button,
  FormGroup,
  Autocomplete,
  Divider,
} from "@mui/material";
import {
  fetchUniquePartsWithOutobsolete,
  fetchEntirePartHierarchy,
  exportAsExcel,
} from "../../../services/partService";
import {
  createNewEBom,
  deleteEBom,
  fetchChildParts,
  updateEBom,
} from "../../../services/childPartService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { usePartDetailsDrawer } from "./PartDetailsContext";
import {
  showAlert,
  showConfirmation,
} from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { useNavigate } from "react-router-dom";
import { useFeatureBitContext } from "../../adminuser/FeatureBit/FeatureBitContext";
import TableChartIcon from "@mui/icons-material/TableChart";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { LoadingOutlined } from "@ant-design/icons";
import { StyledDataGrid } from "../../../Components/StyledDataGrid/StyledDataGrid";
import ConsolidatedBOMView from "./ConsolidatedBOMView";
import TableViewIcon from "@mui/icons-material/TableView";
import ChildPartAntTableView from "./ChildPartAntTableView";
import { fetchAssemblyLocations } from "../../../services/assemblyLocationService";
import SubsystemViewAntDTable from "./SubsystemViewAntDTable";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import LocationViewAntDTable from "./LocationViewAntDTable";
import "../../Procurement/procurement.css";

const formatBomTreeData = (data, parentId) => {
  if (!Array.isArray(data)) return [];

  return data.map((bom) => ({
    ...bom,
    key: `bom/${bom.ebomId}`,
    parentId: parentId,
    children: formatBomChildren(bom.children, bom?.id, `bom/${bom.ebomId}`),
  }));
};

const formatBomChildren = (children, parentId, parentPath) => {
  if (!Array.isArray(children) || children.length === 0) return undefined;

  return children.map((child) => {
    const currentPath = `${parentPath}/${child.ebomId}`;

    return {
      ...child,
      key: currentPath,
      parentId: parentId,
      parentPath: parentPath,
      children: formatBomChildren(child.children, parentId, currentPath),
    };
  });
};

const ChildPart = ({
  selectedId,
  canEdit,
  setIsParentPart,
  selectedPart,
  handleClose,
}) => {
  const { featureBitData } = useFeatureBitContext();
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [formValues, setFormValues] = useState({
    childPartData: null,
    quantity: null,
    assemblyLocationId: null,
  });
  const navigateTo = useNavigate();
  const [csvDownloadLoading, setCSVDownloadLoaing] = useState(false);
  const [availableParts, setAvailableParts] = useState([]);
  const [availablePartsLoading, setAvailablePartsLoading] = useState(true);
  const [childParts, setChildParts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedChildPartId, setSelectedChildPartId] = useState("");
  const [selectedEBomId, setSelectedEBomId] = useState("");
  const [quantityError, setQuantityError] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [bomViewOption, setBomViewOption] = useState(1);
  const [bomTreeData, setBomTreeData] = useState([]);
  const [loadingBomTreeData, setLoadingBomTreeData] = useState(false);
  const [locationsData, setLocationsData] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [parentId, setParentId] = useState(null);

  useEffect(() => {
    setParentId(selectedId);
  }, [selectedId]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => {
    const saved = localStorage.getItem("bomColumnVisibility");
    const defaultModel = {
      trl: false,
      spaceQualified: false,
      referenceNumber: false,
      weight: false,
      partNumber: true,
      name: true,
      quantity: true,
      status: true,
      partType: true,
      partTypeCategory: false,
      makeBuy: true,
      manufacturingPartNumber: true,
      manufacturer: true,
      material: true,
      countryOfOrigin: false,
      partLevelName: false,
      subsystemName: false,
      grade: false,
    };
    return saved ? { ...defaultModel, ...JSON.parse(saved) } : defaultModel;
  });

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 0.5,
      renderCell: ({ row }) => (
        <div
          className="AppHyperLink"
          onClick={(e) => {
            e.stopPropagation();
            if (row.childPart) {
              openPartDetailsDrawer({
                partNumberSuffix: row.childPart?.partNumberSuffix,
                partNumber: row.childPart?.partNumber,
              });
            }
          }}
        >
          {row.childPart?.partNumber}
        </div>
      ),
      valueGetter: (_value, row) => row.childPart?.partNumber,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      valueGetter: (_value, row) => row.childPart?.name,
    },
    {
      field: "shortDescription",
      headerName: "Short Description",
      flex: 1,
      valueGetter: (_value, row) => row.childPart?.shortDescription,
    },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 0.3,
      type: "number",
      renderCell: ({ row }) => (
        <span className={canEdit ? "AppHyperLink" : undefined}>
          {row.quantity}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.3,
      valueGetter: (_value, row) =>
        row.childPart?.status === "Draft" ? "" : row.childPart?.status,
    },
    {
      field: "partType",
      headerName: "Type",
      flex: 0.5,
      valueGetter: (_value, row) => row.childPart?.partType?.name,
    },
    {
      field: "partTypeCategory",
      headerName: "Category",
      flex: 1,
      valueGetter: (_value, row) => row.childPart?.partType?.category,
    },
    {
      field: "makeBuy",
      headerName: "Make/Buy",
      flex: 0.4,
      renderCell: (params) => {
        const makeBuy = params.row.childPart?.makeBuy;
        return (
          <span className={`make-buy-cell ${makeBuy === 1 ? "buy" : "make"}`}>
            {makeBuy === 1 ? "Buy" : "Make"}
          </span>
        );
      },
      valueGetter: (_value, row) =>
        row.childPart?.makeBuy == null
          ? null
          : row.childPart.makeBuy
            ? "Buy"
            : "Make",
    },
    {
      field: "manufacturingPartNumber",
      headerName: "Manufacturing Part Number",
      flex: 0.7,
      valueGetter: (_value, row) => row.childPart?.manufacturingPartNumber,
    },
    {
      field: "manufacturerName",
      headerName: "Manufacturer Name",
      flex: 0.7,
      valueGetter: (_value, row) => row.childPart?.manufacturerName,
    },
    {
      field: "weight",
      headerName: "Weight (g)",
      flex: 0.3,
      valueGetter: (_value, row) => row.childPart?.weight,
    },
    {
      field: "trl",
      headerName: "TRL #",
      flex: 0.2,
      valueGetter: (_value, row) => row.childPart?.trl,
    },
    {
      field: "material",
      headerName: "Material",
      flex: 0.4,
      valueGetter: (_value, row) => row.childPart?.material,
    },
    {
      field: "countryOfOrigin",
      headerName: "Country of Origin",
      flex: 0.5,
      valueGetter: (_value, row) => row.childPart?.countryOfOrigin?.name,
    },
    {
      field: "partLevelName",
      headerName: "Part Level",
      flex: 0.5,
      valueGetter: (_value, row) => row?.childPart?.partType?.partLevel?.name,
    },
    {
      field: "subsystemName",
      headerName: "Subsystem",
      flex: 0.5,
      valueGetter: (_value, row) => row.childPart?.subsystem?.name,
    },
    {
      field: "grade",
      headerName: "Grade",
      flex: 0.3,
      valueGetter: (_value, row) => row.childPart?.grade,
    },
    {
      field: "spaceQualified",
      headerName: "Space Qualified",
      flex: 0.3,
      valueGetter: (_value, row) =>
        row.childPart?.spaceQualified == null
          ? null
          : row.childPart?.spaceQualified
            ? "Yes"
            : "No",
    },
    {
      field: "referenceNumber",
      headerName: "Old Part Number",
      flex: 0.4,
      valueGetter: (_value, row) => row.childPart?.referenceNumber,
    },
    ...(canEdit
      ? [
          {
            field: "action",
            headerName: "",
            width: 30,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            resizable: false,
            align: "center",
            renderCell: ({ row }) => (
              <ion-icon
                name="trash-outline"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!hasPermission(PERMISSIONS.PARTS.BOM.DELETE)) {
                    Alert(
                      "You don't have permission to delete BOMs.",
                      "warning",
                    );
                    return;
                  }
                  const confirmed = await showConfirmation(
                    "Are you sure?",
                    "This part will be deleted from the BOM.",
                  );

                  if (confirmed) {
                    setLoadingData(true);
                    handleDelete(row.id);
                    showAlert(
                      "success",
                      "Deleted",
                      "Part Deleted Successfully",
                    );
                  }
                }}
              />
            ),
          },
        ]
      : []),
  ];

  const fetchChildPartsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchChildParts(selectedId);
      setChildParts(data);
    } catch (error) {
      Alert("Couldn't fetch Child Parts Data ...!", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAvailableParts = async () => {
    try {
      setAvailablePartsLoading(true);

      const allParts = await fetchUniquePartsWithOutobsolete();
      const remainingParts = allParts
        .filter((part) => part.id !== selectedId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAvailableParts(remainingParts);
    } catch (error) {
      Alert("Couldn't fetch Parts Data ...!", "error");
      console.error(error);
    } finally {
      setAvailablePartsLoading(false);
    }
  };

  useEffect(() => {
    fetchBomTreeData();
  }, [handleClose]);

  const fetchBomTreeData = useCallback(async () => {
    if (!selectedId) return;
    setLoadingBomTreeData(true);
    try {
      const hierarchyData = await fetchEntirePartHierarchy(selectedId);
      if (hierarchyData) {
        const formattedData = formatBomTreeData(hierarchyData, selectedId);
        setBomTreeData(formattedData);
      }
    } catch (error) {
      Alert("Error fetching BOM Hierarchy data", "error");
    } finally {
      setLoadingBomTreeData(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (bomTreeData.length === 0) {
      fetchBomTreeData();
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      if (bomViewOption === 1 && childParts.length === 0) {
        fetchChildPartsData();
        fetchAvailableParts();
      }
    }
  }, [selectedId, bomViewOption, bomTreeData.length]);

  const handleAttach = async () => {
    if (!hasPermission(PERMISSIONS.PARTS.BOM.MODIFY)) {
      Alert("You don't have permission to modify BOMs.", "warning");
      return;
    }
    if (!formValues.childPartData || !formValues.childPartData.id) {
      Alert("Please select a Child Part before attaching.", "error");
      return;
    }

    const ChildPart = {
      partId: selectedId,
      childPartId: formValues.childPartData.id,
      quantity: formValues.quantity,
      assemblyLocationId: formValues.assemblyLocationId,
    };
    if (ChildPart.quantity <= 0 || isNaN(ChildPart.quantity)) {
      setQuantityError(true);
      return;
    } else {
      setQuantityError(false);
    }
    setLoadingData(true);
    try {
      const newChildPart = await createNewEBom(ChildPart);
      Alert(
        `Attached ${formValues.childPartData.name} Successfully..!`,
        "success",
      );
      fetchChildPartsData();
      fetchBomTreeData();
      setFormValues({
        childPartData: null,
        quantity: null,
      });
      setIsParentPart(true);
    } catch (error) {
      Alert(`Couldn't Attach ${formValues.childPartData.name}..!`, "error");
      console.log(error);
      setLoadingData(false);
    }
  };

  const handleDelete = async (id) => {
    setLoadingData(true);
    try {
      const removeChild = await deleteEBom(id);
      fetchChildPartsData();
      fetchBomTreeData();
      Alert("Removed Child Part Successfully..!", "success");
    } catch (error) {
      Alert(`Couldn't Remove Part..!`, "error");
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAssemblyLocationsData();
  }, []);

  const fetchAssemblyLocationsData = async () => {
    setLoadingLocations(true);

    try {
      const data = await fetchAssemblyLocations();
      setLocationsData(data);
    } catch (error) {
      console.error("Error fetching Assembly Location data:", error);
      Alert("Couldn't fetch Assembly Location Data ...!", "error");
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleEdit = async () => {
    if (!hasPermission(PERMISSIONS.PARTS.BOM.MODIFY)) {
      Alert("You don't have permission to modify BOMs.", "warning");
      return;
    }
    if (selectedChildPartId && formValues.quantity !== null) {
      setLoadingData(true);
      const updatedChild = {
        id: selectedEBomId,
        partId: parentId,
        childPartId: selectedChildPartId,
        quantity: formValues.quantity,
        assemblyLocationId: formValues.assemblyLocationId,
      };
      try {
        await updateEBom(selectedEBomId, updatedChild);
        setEditMode(false);
        fetchChildPartsData();
        fetchBomTreeData();
        setFormValues({
          childPartData: null,
          quantity: null,
        });
        setIsParentPart(true);
        setSelectedChildPartId("");
        setSelectedEBomId("");
        Alert(`Quantity Updated Successfully..!`, "success");
      } catch (error) {
        Alert(`Couldn't Update Quantity..!`, "error");
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    }
  };

  const handleExportBomHierarchy = async () => {
    setCSVDownloadLoaing(true);
    try {
      const response = await exportAsExcel(selectedId);
      const partNumber = selectedPart?.part?.partNumber || "";
      const now = new Date();
      const formattedDate = `${now.getUTCFullYear()}${String(
        now.getUTCMonth() + 1,
      ).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}_${String(
        now.getUTCHours(),
      ).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(
        2,
        "0",
      )}${String(now.getUTCSeconds()).padStart(2, "0")}`;

      const fileName = `BOM_Hierarchy_${partNumber}_${formattedDate}.xlsx`;

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Alert("BOM Hierarchy downloaded successfully!", "success");
    } catch (error) {
      console.error("Error while exporting BOM hierarchy:", error);
      Alert("Couldn't export BOM Hierarchy!", "error");
    } finally {
      setCSVDownloadLoaing(false);
    }
  };

  return (
    <div className="ChildDetails">
      {canEdit && (
        <div className="ChildDetailsHeader">
          <FormGroup>
            <div className="ChildDetailsModify">
              <Autocomplete
                disabled={editMode || loadingData}
                className="ChildPartTextFeild"
                options={availableParts}
                getOptionLabel={(part) => `${part.partNumber} -- ${part.name}`}
                value={formValues.childPartData}
                loading={availablePartsLoading}
                loadingText="Loading parts..."
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(event, newValue) => {
                  if (!newValue) {
                    setSelectedChildPartId("");
                    setFormValues({
                      childPartData: null,
                      quantity: null,
                    });
                    return;
                  }
                  const existingPart = childParts.find(
                    (item) => item.childPart.id === newValue.id,
                  );
                  if (!existingPart) {
                    setSelectedChildPartId("");
                    setFormValues({
                      childPartData: newValue,
                      quantity: null,
                    });
                  } else {
                    setFormValues({
                      childPartData: newValue,
                      quantity: existingPart.quantity,
                    });
                    setSelectedChildPartId(newValue.id);
                    setSelectedEBomId(existingPart.id);
                    setEditMode(true);
                    Alert(`Part Already Exists..!`, "error");
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Part"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <TextField
                className="ChildPartTextFeild2"
                label="Quantity"
                disabled={loadingData}
                value={
                  formValues.quantity !== null
                    ? formValues.quantity.toString()
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value.trim();
                  const quantity = value === "" ? null : parseInt(value, 10);
                  if (isNaN(quantity) || quantity <= 0) {
                    setQuantityError(true);
                  } else {
                    setQuantityError(false);
                  }
                  setFormValues({
                    ...formValues,
                    quantity: isNaN(quantity) ? null : quantity,
                  });
                }}
                error={quantityError}
                helperText={
                  quantityError ? "Quantity must be greater than 0" : ""
                }
              />
              <Autocomplete
                options={locationsData || []}
                loading={loadingLocations}
                getOptionLabel={(option) => option?.name || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={
                  locationsData?.find(
                    (loc) => loc.id === formValues.assemblyLocationId,
                  ) || null
                }
                onChange={(e, newValue) => {
                  setFormValues((prev) => ({
                    ...prev,
                    assemblyLocationId: newValue ? newValue.id : null,
                  }));
                }}
                fullWidth
                className="BOMLocationField"
                renderInput={(params) => (
                  <TextField {...params} label="Location" />
                )}
              />

              <Button
                className="AttachButton"
                onClick={selectedChildPartId ? handleEdit : handleAttach}
              >
                {selectedChildPartId ? "Update" : "ADD"}
              </Button>
              {selectedChildPartId ? (
                <Button
                  className="CancelButton ChildPartCancelButton"
                  onClick={() => {
                    setEditMode(false);
                    setSelectedChildPartId("");
                    setSelectedEBomId("");
                    setFormValues({
                      childPartData: null,
                      quantity: null,
                    });
                  }}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </FormGroup>
        </div>
      )}

      <div className="ChildDetailsBody">
        {childParts.length === 0 &&
        !loadingData &&
        bomViewOption === 1 &&
        bomTreeData.length === 0 ? (
          <p className="ChildPartNoAvailableTag">No BOM Attached</p>
        ) : (
          <>
            <div className="PartBomHierarchyHeaderDiv">
              {" "}
              {featureBitData?.find(
                (item) => item.featureName === "BomHierarchy",
              )?.isActive ? (
                <button
                  className="AddOrUpdateButton"
                  onClick={() => {
                    const url = `/plm/parts/hierarchy/${selectedId}`;
                    window.open(url, "_blank");
                  }}
                >
                  {" "}
                  <ion-icon name="git-network-outline"></ion-icon> BOM
                  Hierarchal View
                </button>
              ) : (
                <p></p>
              )}
              <div
                className="PartBomHierarchyHeaderDivInner"
                style={{ marginBottom: "10px" }}
              >
                <button
                  className="WhereUsedButtons"
                  disabled={csvDownloadLoading}
                  onClick={handleExportBomHierarchy}
                >
                  {csvDownloadLoading ? (
                    <LoadingOutlined style={{ fontSize: 20 }} spin />
                  ) : (
                    <ion-icon name="download-outline"></ion-icon>
                  )}
                  Export BOM Structure
                </button>

                <Divider orientation="vertical" flexItem />
                <button
                  title="Hierarchical View"
                  className={
                    bomViewOption === 1 ? "AddOrUpdateButton" : "DimButton"
                  }
                  onClick={() => {
                    setBomViewOption(1);
                  }}
                >
                  <AccountTreeIcon sx={{ fontSize: "16px" }} />
                </button>
                <Divider orientation="vertical" flexItem />
                <button
                  title="One Level View"
                  className={
                    bomViewOption === 2 ? "AddOrUpdateButton" : "DimButton"
                  }
                  onClick={() => {
                    setBomViewOption(2);
                  }}
                >
                  <TableChartIcon sx={{ fontSize: "16px" }} />
                </button>
                {featureBitData?.some(
                  (item) =>
                    item.featureName === "Consolidated BOM View" &&
                    item.isActive,
                ) && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <button
                      title="Consolidated View"
                      className={
                        bomViewOption === 3 ? "AddOrUpdateButton" : "DimButton"
                      }
                      onClick={() => setBomViewOption(3)}
                    >
                      <TableViewIcon sx={{ fontSize: "16px" }} />
                    </button>
                  </>
                )}
                {featureBitData?.some(
                  (item) =>
                    item.featureName === "Location BOM View" && item.isActive,
                ) && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <button
                      title="Location View"
                      className={
                        bomViewOption === 4 ? "AddOrUpdateButton" : "DimButton"
                      }
                      onClick={() => {
                        setBomViewOption(4);
                      }}
                    >
                      <MyLocationIcon sx={{ fontSize: "16px" }} />
                    </button>
                  </>
                )}
                {featureBitData?.some(
                  (item) =>
                    item.featureName === "Subsystem BOM View" && item.isActive,
                ) && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <button
                      title="Subsystem View"
                      className={
                        bomViewOption === 5 ? "AddOrUpdateButton" : "DimButton"
                      }
                      onClick={() => {
                        setBomViewOption(5);
                      }}
                    >
                      <DeviceHubIcon sx={{ fontSize: "16px" }} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {bomViewOption === 2 && (
              <div
                className={
                  canEdit ? "ChildPartDataGrid" : "ChildPartDataGridReadonly"
                }
              >
                <StyledDataGrid
                  rows={childParts}
                  columns={columns}
                  getRowClassName={(params) => {
                    if (params.row.makeBuy === 1) return "buy-part-row-bom";
                    if (params.row.makeBuy === 0) return "make-part-row-bom";
                    return "";
                  }}
                  loading={loadingData}
                  columnVisibilityModel={columnVisibilityModel}
                  onColumnVisibilityModelChange={(newModel) => {
                    setColumnVisibilityModel(newModel);
                    localStorage.setItem(
                      "bomColumnVisibility",
                      JSON.stringify(newModel),
                    );
                  }}
                  onRowClick={(params) => {
                    if (!hasPermission(PERMISSIONS.PARTS.BOM.MODIFY)) {
                      Alert(
                        "You don't have permission to modify BOMs.",
                        "warning",
                      );
                      return;
                    }
                    if (canEdit) {
                      setSelectedChildPartId(params.row.childPart.id);
                      setSelectedEBomId(params.row.id);
                      setEditMode(true);
                      setFormValues({
                        childPartData: params.row.childPart,
                        quantity: params.row.quantity,
                        assemblyLocationId: params.row.assemblyLocationId,
                      });
                    }
                  }}
                />
              </div>
            )}

            {bomViewOption === 1 && (
              <>
                <ChildPartAntTableView
                  bomTreeData={bomTreeData}
                  loadingBomTreeData={loadingBomTreeData}
                  canEdit={canEdit}
                  setSelectedChildPartId={setSelectedChildPartId}
                  setEditMode={setEditMode}
                  setSelectedEBomId={setSelectedEBomId}
                  setFormValues={setFormValues}
                  handleDelete={handleDelete}
                  setParentId={setParentId}
                />
              </>
            )}
            {bomViewOption === 5 && (
              <>
                <SubsystemViewAntDTable selectedId={selectedId} />
              </>
            )}

            {bomViewOption === 3 && (
              <ConsolidatedBOMView
                selectedId={selectedId}
                canEdit={canEdit}
                bomView={true}
                setSelectedChildPartId={setSelectedChildPartId}
                setEditMode={setEditMode}
                setSelectedEBomId={setSelectedEBomId}
                setFormValues={setFormValues}
              />
            )}
            {bomViewOption === 4 && (
              <LocationViewAntDTable
                selectedId={selectedId}
                canEdit={canEdit}
              />
            )}
          </>
        )}
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default ChildPart;
