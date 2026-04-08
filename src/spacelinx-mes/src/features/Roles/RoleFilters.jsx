import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { AlertsContext } from "../AlertsContext/Context";
import Cliploader from "../../Components/Loaders/Cliploader";
import {
  createRoleFilter,
  updateRoleFilter,
  deleteRoleFilter,
  fetchRoleFilterByRoleId,
} from "../../services/roleFilterService";
import { fetchPermissionsLookUp } from "../../services/permissionService";
import { fetchProductsLookup } from "../../services/productService";
import { fetchGuidesLookup } from "../../services/guideService";
import { fetchWorkordersLookup } from "../../services/WOrderService";
import { fetchOptionSetByAppName } from "../../services/optionSetService";
import { fetchMaterialKitLookup } from "../../services/materialKitService";
import { fetchPartsLookUp } from "../../services/partService";
import { fetchEcoLookUp } from "../../services/ecoService";
import { fetchToolsLookUp } from "../../services/toolService";
import { fetchMachinesLookUp } from "../../services/machineService";
import { fetchCompanyLookup } from "../../services/companyService";
import { fetchLocationsLookUp } from "../../services/locationService";
import { fetchPartTypesLookUp } from "../../services/partTypeService";
import { fetchIssuesLookup } from "../../services/issuesService";
import { fetchNewsLookUp } from "../../services/newsService";
import { fetchBulkUploadLookup } from "../../services/bulkUploadService";
import {
  showConfirmation,
  showAlert,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const RoleFilters = ({ selectedRoleId }) => {
  const { Alert } = useContext(AlertsContext);

  const [entityOptions, setEntityOptions] = useState([]);
  const [keyOptions, setKeyOptions] = useState([]);
  const [valueOptions, setValueOptions] = useState([]);

  const [guides, setGuides] = useState([]);
  const [products, setProducts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [materialKits, setMaterialKits] = useState([]);
  const [parts, setParts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tools, setTools] = useState([]);
  const [eco, setEco] = useState([]);
  const [machines, setMachines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [partTypes, setPartTypes] = useState([]);
  const [issues, setIssues] = useState([]);
  const [news, setNews] = useState([]);
  const [bulkUploads, setBulkUploads] = useState([]);

  const [filters, setFilters] = useState([]);
  const [entity, setEntity] = useState("");
  const [key, setKey] = useState("");
  const [operator, setOperator] = useState("==");
  const [value, setValue] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const resetForm = () => {
    setEntity("");
    setKey("");
    setOperator("==");
    setValue([]);
    setSelectedRow(null);
    setValueOptions([]);
  };

  const normalizeEntity = (entity) =>
    entity?.toLowerCase().endsWith("s")
      ? entity.toLowerCase().slice(0, -1)
      : entity.toLowerCase();

  const getSourceByEntity = (entityName) => {
    const normalizedEntity = normalizeEntity(entityName);
    const sourceMap = {
      guide: guides,
      product: products,
      workorder: workOrders,
      materialkit: materialKits,
      part: parts,
      vendor: vendors,
      tool: tools,
      eco: eco,
      machine: machines,
      location: locations,
      parttype: partTypes,
      issue: issues,
      news: news,
      bulkupload: bulkUploads,
    };
    return sourceMap[normalizedEntity] || [];
  };

  const extractEntitiesFromPermissions = (permissions) => {
    const entityMap = new Map();
    permissions.forEach((perm) => {
      const originalEntity = perm.name.split(".")[0];
      const normalized = normalizeEntity(originalEntity);
      if (!entityMap.has(normalized)) {
        entityMap.set(normalized, originalEntity);
      }
    });
    return Array.from(entityMap.values());
  };

  const loadInitialData = async () => {
    if (!selectedRoleId) {
      resetForm();
      setFilters([]);
      setEntityOptions([]);
      setKeyOptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const permissions = await fetchPermissionsLookUp();
      const entities = extractEntitiesFromPermissions(permissions);
      setEntityOptions(entities);

      const [
        optionSets,
        guidesData,
        productsData,
        workOrdersData,
        materialKitData,
        partData,
        vendorData,
        toolData,
        ecoData,
        machineData,
        locationData,
        partTypeData,
        issueData,
        newsData,
        bulkUploadData,
        roleFilters,
      ] = await Promise.all([
        fetchOptionSetByAppName(),
        fetchGuidesLookup(),
        fetchProductsLookup(),
        fetchWorkordersLookup(),
        fetchMaterialKitLookup(),
        fetchPartsLookUp(),
        fetchCompanyLookup(),
        fetchToolsLookUp(),
        fetchEcoLookUp(),
        fetchMachinesLookUp(),
        fetchLocationsLookUp(),
        fetchPartTypesLookUp(),
        fetchIssuesLookup(),
        fetchNewsLookUp(),
        fetchBulkUploadLookup(),
        fetchRoleFilterByRoleId(selectedRoleId),
      ]);

      const getValues = (name) =>
        JSON.parse(
          optionSets.find((opt) => opt.name === name)?.values || "[]"
        ).map((item) => item.name);

      setKeyOptions(getValues("key"));
      setGuides(guidesData);
      setProducts(productsData);
      setWorkOrders(workOrdersData);
      setMaterialKits(materialKitData);
      setParts(partData);
      setVendors(vendorData);
      setTools(toolData);
      setEco(ecoData);
      setMachines(machineData);
      setLocations(locationData);
      setPartTypes(partTypeData);
      setIssues(issueData);
      setNews(newsData);
      setBulkUploads(bulkUploadData);
      setFilters(roleFilters);
    } catch (err) {
      console.error("Error loading data", err);
      Alert("Failed to load role filter data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [selectedRoleId]);

  const buildValueOptions = (data) =>
    data.map((item) => ({
      label: `${item.number || item.name} (${item.name || item.label})`,
      value: item.id || item.value,
    }));

  const getUsedValuesForEntity = (currentEntity) => {
    const normalized = normalizeEntity(currentEntity);
    const used = filters
      .filter(
        (f) =>
          normalizeEntity(f.entity) === normalized &&
          (!selectedRow || f.id !== selectedRow.id)
      )
      .flatMap((f) => {
        try {
          const parsed = JSON.parse(f.value);
          return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
        } catch {
          return [String(f.value)];
        }
      });
    return used;
  };

  const handleKeyChange = (event, newKey) => {
    const updatedKey = newKey || "";
    setKey(updatedKey);
    setValue([]);

    if (!entity || !updatedKey) {
      setValueOptions([]);
      return;
    }

    const source = getSourceByEntity(entity);
    setValueOptions(buildValueOptions(source));
  };

  const handleAddOrUpdate = async () => {
    if (!entity || !key || !operator || value.length === 0) {
      Alert("All fields are required, and Value must not be empty.", "error");
      return;
    }

    const payload = {
      roleId: selectedRoleId,
      entity,
      key,
      operator,
      value: JSON.stringify(value),
    };

    try {
      setLoading(true);
      if (selectedRow) {
        await updateRoleFilter(selectedRow.id, payload);
        Alert("Role Filter updated successfully", "success");
      } else {
        await createRoleFilter(payload);
        Alert("Role Filter created successfully", "success");
      }

      const updatedFilters = await fetchRoleFilterByRoleId(selectedRoleId);
      setFilters(updatedFilters);
      resetForm();
      setExpanded(false);
    } catch (err) {
      console.error("Error saving filter", err);
      Alert(`Failed to save filter: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirmation(
      "Delete Role Filter?",
      "Are you sure you want to delete this Role Filter?"
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteRoleFilter(id);
      const updated = await fetchRoleFilterByRoleId(selectedRoleId);
      setFilters(updated);
      showAlert("success", "Deleted!", "Role Filter deleted successfully.");

      if (selectedRow?.id === id) {
        resetForm();
        setExpanded(false);
      }
    } catch (err) {
      console.error("Delete error", err);
      showAlert("error", "Error", "Failed to delete Role Filter.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "entity", headerName: "Entity", flex: 1 },
    { field: "key", headerName: "Key", flex: 0.5 },
    { field: "operator", headerName: "Operator", width: 80 },
    {
      field: "value",
      headerName: "Value",
      flex: 1,
      valueGetter: (_value, row) => {
        try {
          const ids = JSON.parse(row.value);
          const source = getSourceByEntity(row.entity);
          return (Array.isArray(ids) ? ids : [ids])
            .map((id) => {
              const item = source.find((d) => String(d.id) === String(id));
              return item ? `${item.number} ( ${item.name} )` : id;
            })
            .join(", ");
        } catch {
          return row.value;
        }
      },
    },
    {
      field: " ",
      headerName: "",
      width: 50,
      renderCell: ({ row }) => (
        <ion-icon
          name="trash-outline"
          style={{ color: "red", cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <>
      <Box className="role-permission-container" sx={{ p: 2 }}>
        {loading ? (
          <Cliploader />
        ) : (
          <>
            <Accordion
              expanded={expanded}
              onChange={(e, isExpanded) => {
                setExpanded(isExpanded);
                if (!isExpanded) resetForm();
              }}
            >
              <AccordionSummary
                expandIcon={expanded ? <CloseIcon /> : <AddCircleOutlineIcon />}
              >
                <Typography variant="subtitle1">
                  {selectedRow ? "Edit Filter" : "Add Role Filter"}
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Box
                  className="permission-controls-row"
                  sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                >
                  <Autocomplete
                    options={entityOptions}
                    value={entity || null}
                    onChange={(e, val) => {
                      setEntity(val || "");
                      setKey("");
                      setValue([]);
                      setValueOptions([]);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Entity" size="small" />
                    )}
                    sx={{ minWidth: 200 }}
                  />

                  <Autocomplete
                    options={keyOptions}
                    value={key || null}
                    onChange={handleKeyChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Key" size="small" />
                    )}
                    sx={{ minWidth: 200 }}
                    disabled={!entity}
                  />

                  <TextField
                    label="Operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    size="small"
                    sx={{ minWidth: 180 }}
                    select
                    SelectProps={{ native: true }}
                  >
                    <option value="==">==</option>
                    <option value="!=">!=</option>
                    <option value="CONTAINS">CONTAINS</option>
                  </TextField>

                  <Autocomplete
                    multiple
                    options={valueOptions.map((opt) => ({
                      ...opt,
                      disabled:
                        getUsedValuesForEntity(entity).includes(
                          String(opt.value)
                        ) && !value.includes(String(opt.value)),
                    }))}
                    value={valueOptions.filter((opt) =>
                      value.includes(String(opt.value))
                    )}
                    onChange={(e, newVals) =>
                      setValue(
                        newVals.map((opt) => opt.value || opt).map(String)
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Value" size="small" />
                    )}
                    sx={{ minWidth: 300 }}
                    getOptionLabel={(opt) =>
                      typeof opt === "string" ? opt : opt.label || opt.value
                    }
                    filterSelectedOptions
                    isOptionEqualToValue={(opt, val) => opt.value === val.value}
                    getOptionDisabled={(opt) => opt.disabled}
                    noOptionsText={
                      entity && getSourceByEntity(entity).length === 0
                        ? "There is No Data for this Entity"
                        : "No options"
                    }
                  />

                  <Button
                    variant="contained"
                    onClick={handleAddOrUpdate}
                    disabled={
                      !entity || !key || !operator || value.length === 0
                    }
                  >
                    {selectedRow ? "Update" : "Add"}
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Box height={350} sx={{ mt: 2 }}>
              <StyledDataGrid
                rows={filters}
                columns={columns}
                getRowId={(row) => row.id}
                onRowClick={(params, event) => {
                  if (
                    event.target.closest("button") ||
                    event.target.closest("ion-icon")
                  )
                    return;
                  const row = params.row;
                  const source = getSourceByEntity(row.entity);
                  setEntity(row.entity);
                  setKey(row.key);
                  setOperator(row.operator);
                  setSelectedRow(row);
                  setValueOptions(buildValueOptions(source));
                  try {
                    const valArray = JSON.parse(row.value);
                    setValue(
                      Array.isArray(valArray) ? valArray.map(String) : []
                    );
                  } catch {
                    setValue([row.value]);
                  }
                  setExpanded(true);
                }}
                localeText={{
                  noRowsLabel: "No Filters assigned to this role",
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default RoleFilters;
