import React, { useEffect, useState, useContext } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "../features.css";
import "./Step.css";
import {
  createGuideEquipment,
  deleteGuideEquipment,
  fetchGuideEquipmentWithStepId,
  updateGuideEquipment,
} from "../../services/guideEquipmentService";
import { fetchToolsLookUp } from "../../services/toolService";
import { fetchMachinesLookUp } from "../../services/machineService";
import { Link } from "react-router-dom";
import { GuideContext } from "./GuideContext";
import { fetchChildParts } from "../../services/childPartService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";
import {
  showConfirmation,
  showAlert,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";

import "./Step.css";

const AddItems = ({
  stepId,
  guidePartId,
  setAllDataIsFetched,
  guideId,
  equipmentDrawerOpen,
  mBOMDrawerOpen,
  isReadOnly,
}) => {
  const {
    triggerRecall,
    setTriggerReCall,
    setTriggerGenealogyData,
    taskListData,
  } = useContext(GuideContext);
  const { hasPermission } = useUserContext();
  const [itemsOption, setItemsOption] = useState("part");
  const { Alert } = useContext(AlertsContext);
  const [equipmentDetails, setEquipmentDetails] = useState([]);
  const [partEquipmentDetails, setPartEquipmentDetails] = useState([]);
  const [remainingEquipmentDetails, setRemainingEquipmentDetails] = useState(
    [],
  );
  const [partsData, setPartsData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toolsData, setToolsData] = useState([]);
  const [machinesData, setMachinesData] = useState([]);
  const [quantity, setQuantity] = useState("");
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [accordionStatus, setAccordionStatus] = useState(false);
  const [loadMbomData, setLoadMbomData] = useState(true);
  const [selectedEquipId, setSelectedEquipId] = useState("");
  const [selectedEquipmentPartId, setSelectedEquipmentPartId] = useState("");
  const [selectedEquipmentType, setSelectedEquipmentType] = useState("");
  const [editSelectedItem, setEditSelectedItem] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [genealogyData, setGenealogyData] = useState();
  const [isEmptyFieldError, setIsEmptyFieldError] = useState(false);
  const [loadingAddItemData, setLoadingAddItemData] = useState(true);
  const [
    remainingEquipmentAccordionStatus,
    setRemainingEquipmentAccordionStatus,
  ] = useState(false);
  const [partEquipmentAccordionStatus, setPartEquipmentAccordionStatus] =
    useState(true);
  const fetchData = async () => {
    setLoadingAddItemData(true);
    setAllDataIsFetched(true);
    try {
      const data = await fetchGuideEquipmentWithStepId(stepId);
      if (data) {
        const sortedData = data.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate),
        );
        setEquipmentDetails(sortedData);
        setPartEquipmentDetails(
          sortedData.filter((item) => item.equipmentType === "part"),
        );
        setRemainingEquipmentDetails(
          sortedData.filter((item) => item.equipmentType !== "part"),
        );
      }
    } catch (error) {
      Alert("Error while fetching data...!", "error");
      console.error("Error fetching data:", error);
    } finally {
      setLoadingAddItemData(false);
      setAllDataIsFetched(false);
    }
  };

  const columns = [
    {
      field: "rowType",
      headerName: "",
      flex: 1,
      maxWidth: 60,
      renderCell: ({ row }) => {
        if (row.equipmentType === "part") {
          return <ion-icon name="construct-outline"></ion-icon>;
        } else if (row.equipmentType === "tool") {
          return <ion-icon name="build-outline"></ion-icon>;
        } else {
          return <ion-icon name="cog-outline"></ion-icon>;
        }
      },
    },

    {
      field: "number",
      headerName: "Number",
      flex: 1,
      minWidth: 50,
      valueGetter: (_value, row) => {
        if (row.equipmentType === "part") {
          return row.part?.partNumber;
        } else if (row.equipmentType === "tool") {
          return row.tool?.number;
        } else {
          return row.machine?.number;
        }
      },

      renderCell: ({ row }) => {
        if (row.equipmentType === "part") {
          const partNumber = row.part?.partNumber;
          const partNumberSuffix = row.part?.partNumberSuffix;

          return (
            <div className="GuideBOMCellWrapper">
              <span
                className="AppHyperLink"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasPermission(PERMISSIONS.PARTS.VIEW)) {
                    Alert(
                      "You don't have permission to view part details.",
                      "error",
                    );
                    return;
                  }
                  openPartDetailsDrawer({ partNumberSuffix });
                }}
              >
                {partNumber || "-"}
              </span>
            </div>
          );
        }

        return (
          <div className="GuideBOMCellWrapper">
            {row.equipmentType === "tool" ? (
              hasPermission(PERMISSIONS.TOOLS.VIEW) ? (
                <span className="AppHyperLink">{row.tool?.number || "-"}</span>
              ) : (
                <span>{row.tool?.number || "-"}</span>
              )
            ) : row.equipmentType === "machine" ? (
              hasPermission(PERMISSIONS.MACHINES.VIEW) ? (
                <span className="AppHyperLink">
                  {row.machine?.number || "-"}
                </span>
              ) : (
                <span>{row.machine?.number || "-"}</span>
              )
            ) : (
              "-"
            )}
          </div>
        );
      },
    },

    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 50,
      valueGetter: (_value, row) => {
        if (row.equipmentType === "part") {
          return row.part?.name;
        } else if (row.equipmentType === "tool") {
          return row.tool?.name;
        } else {
          return row.machine?.name;
        }
      },
    },

    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 50,
      valueGetter: (_value, row) => {
        if (row.equipmentType === "part") {
          return row.part?.partType?.name;
        } else if (row.equipmentType === "tool") {
          return row.tool?.toolType?.name;
        } else {
          return row.machine?.machineType?.name;
        }
      },
    },

    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      minWidth: 50,
      renderCell: ({ row }) => (
        <Link className="AppHyperLink">{row.quantity}</Link>
      ),
    },

    {
      field: "weight",
      headerName: "Weight (g)",
      flex: 1,
      minWidth: 50,
      renderCell: ({ row }) =>
        row.part?.weight != null ? row.part.weight * row.quantity : "-",
    },

    {
      field: "delete",
      headerName: "",
      flex: 1,
      maxWidth: 60,
      renderCell: ({ row }) =>
        !isReadOnly && (
          <ion-icon
            className="DeleteIcon"
            name="trash-outline"
            style={{
              cursor: "pointer",
              marginLeft: "5px",
              fontSize: "16px",
              color: "red",
            }}
            onClick={() => {
              if (!row || !row.id) {
                console.error("Row or row.id is undefined:", row);
                return;
              }
              handleDeleteRow(row.id, row.part?.id, row?.equipmentType);
            }}
          />
        ),
    },
  ];

  const columnsForRemaining = columns.filter((col) => col.field !== "weight");

  useEffect(() => {
    if (equipmentDrawerOpen) {
      fetchData();
      setTriggerReCall(false);
    }
  }, [triggerRecall, stepId]);

  useEffect(() => {
    if (guidePartId && equipmentDrawerOpen) {
      fetchPartsData();
    }
  }, [guidePartId]);
  const fetchPartsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchChildParts(guidePartId);
      setPartsData(data);
    } catch (error) {
      Alert("Error fetching part data...!", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (equipmentDrawerOpen) {
      fetchToolsData();
    }
  }, []);
  const fetchToolsData = async () => {
    setLoadingData(true);
    try {
      const toolsData = await fetchToolsLookUp();
      setToolsData(toolsData);
    } catch (error) {
      Alert("Error fetching tool data...!", "error");
      console.error("Error fetching tool data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (equipmentDrawerOpen) {
      fetchMachinesData();
    }
  }, []);
  const fetchMachinesData = async () => {
    setLoadingData(true);
    try {
      const machinesData = await fetchMachinesLookUp();
      setMachinesData(machinesData);
    } catch (error) {
      Alert("Error fetching machine data...!", "error");
      console.error("Error fetching machine data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreate = async () => {
    setLoadingData(true);
    setAllDataIsFetched(true);

    try {
      if (!selectedItem || !quantity || !quantity.trim()) {
        setIsEmptyFieldError(true);
        return;
      }

      const equipment = {
        equipmentType:
          itemsOption === "part"
            ? "part"
            : itemsOption === "tool"
              ? "tool"
              : "machine",
        partId: itemsOption === "part" ? selectedItem.childPartId : null,
        toolId: itemsOption === "tool" ? selectedItem.id : null,
        machineId: itemsOption === "machine" ? selectedItem.id : null,
        quantity: quantity,
        guideStepId: stepId,
        guideId: guideId,
      };

      await createGuideEquipment(equipment);
      setSelectedItem(null);
      setQuantity("");
      setAccordionStatus(false);
      setItemsOption("part");
      if (itemsOption === "part") {
        setPartEquipmentAccordionStatus(true);
        setRemainingEquipmentAccordionStatus(false);
      } else {
        setPartEquipmentAccordionStatus(false);
        setRemainingEquipmentAccordionStatus(true);
      }

      fetchData();
      setLoadMbomData(true);
      setTriggerGenealogyData(true);
      Alert("Equipment Created Successfully..!", "success");
    } catch (error) {
      Alert("Failed to create equipment ...!", "error");
      console.error("Error creating equipment:", error);
    } finally {
      setLoadingData(false);
      setAllDataIsFetched(false);
    }
  };

  const handleReset = () => {
    setLoadMbomData(!loadMbomData);
  };
  useEffect(() => {
    if (equipmentDrawerOpen) {
      fetchTaskData();
    }
  }, [taskListData, triggerRecall]);
  const fetchTaskData = async () => {
    setLoadingData(true);
    try {
      const filteredData = taskListData.filter(
        (item) => item.type === "Genealogy",
      );
      setGenealogyData(filteredData);
    } catch (error) {
      Alert("Error fetching task data...!", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };
  const handleDeleteRow = async (id, equipPartId, equipmentType) => {
    // ✅ CONFIRMATION POPUP
    const confirmed = await showConfirmation(
      "Delete Equipment?",
      "Are you sure you want to delete this equipment?",
      "Yes, Delete it!",
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      const filteredData = genealogyData?.filter((item) => {
        const taskDetails = JSON.parse(item.taskdetails);
        return taskDetails.genealogy?.genealogy?.id === equipPartId;
      });

      const genealogyQuantity = filteredData.reduce((acc, item) => {
        const taskDetails = JSON.parse(item.taskdetails);
        const quantity = taskDetails?.genealogy?.genealogy?.quantity || 0;
        return acc + parseInt(quantity, 10);
      }, 0);

      if (genealogyQuantity > 0) {
        Alert(
          `Couldn't Delete Task..! ${genealogyQuantity} Genealogy Tasks Existing for this Part`,
          "error",
        );
      } else {
        await deleteGuideEquipment(id);
        setTriggerGenealogyData(true);
        fetchData();
        setLoadMbomData(false);
        handleReset();

        if (equipmentType === "part") {
          setPartEquipmentAccordionStatus(true);
          setRemainingEquipmentAccordionStatus(false);
        } else {
          setPartEquipmentAccordionStatus(false);
          setRemainingEquipmentAccordionStatus(true);
        }

        showAlert("success", "Deleted!", "Equipment deleted successfully.");
        // OR
        // Alert("Deleted Guide equipment Successfully..!", "success");
      }
    } catch (error) {
      Alert("Error deleting guide equipment...!", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateEquipment = async () => {
    setLoadingData(true);
    try {
      const updatedEquip = {
        id: selectedEquipId,
        equipmentType: selectedEquipmentType,
        partId:
          selectedEquipmentType === "part" ? selectedEquipmentPartId : null,
        toolId:
          selectedEquipmentType === "tool" ? selectedEquipmentPartId : null,
        machineId:
          selectedEquipmentType === "machine" ? selectedEquipmentPartId : null,
        quantity: quantity,
      };
      const filteredData = genealogyData?.filter((item) => {
        const taskDetails = JSON.parse(item.taskdetails);
        return taskDetails.genealogy?.genealogy?.id === selectedEquipmentPartId;
      });
      const genealogyQuantity = filteredData.reduce((acc, item) => {
        const taskDetails = JSON.parse(item.taskdetails);
        const quantity = taskDetails?.genealogy?.genealogy?.quantity || 0;
        return acc + parseInt(quantity, 10);
      }, 0);

      if (selectedEquipmentType === "part" && quantity < genealogyQuantity) {
        Alert(
          `Couldn't Update. ${genealogyQuantity} Genealogy Tasks Available with this part...`,
          "error",
        );
        setLoadMbomData(false);
      } else {
        await updateGuideEquipment(selectedEquipId, updatedEquip);
        setLoadMbomData(false);
        setTriggerGenealogyData(true);
        setSelectedEquipId("");
        setSelectedEquipmentPartId("");
        setSelectedEquipmentType("");
        setQuantity("");
        if (selectedEquipmentType === "part") {
          setPartEquipmentAccordionStatus(true);
          setRemainingEquipmentAccordionStatus(false);
        } else {
          setPartEquipmentAccordionStatus(false);
          setRemainingEquipmentAccordionStatus(true);
        }

        fetchData();
        setAccordionStatus(false);
        handleReset();
        Alert("Updated guide equipment Successfully..!", "success");
      }
    } catch (error) {
      Alert("Error while updating guide equipment...!", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (selectedEquipId) {
      fetchEquipmentData();
    }
  }, [selectedEquipId]);

  const fetchEquipmentData = () => {
    const selectedEquipData = equipmentDetails.find(
      (item) => item.id === selectedEquipId,
    );
    setItemsOption(selectedEquipData.equipmentType);
    if (selectedEquipData.equipmentType === "part") {
      setEditSelectedItem(selectedEquipData.part.name);
    } else if (selectedEquipData.equipmentType === "tool") {
      setEditSelectedItem(selectedEquipData.tool.name);
    } else {
      setEditSelectedItem(selectedEquipData.machine.name);
    }
    setQuantity(selectedEquipData.quantity);
  };

  const clearSelectedItem = () => {
    setSelectedItem(null);
  };

  const handleCloseAccordion = () => {
    setAccordionStatus(false);
    setItemsOption("part");
    setQuantity("");
    setSelectedEquipId("");
    setSelectedEquipmentPartId("");
    setSelectedEquipmentType("");
    clearSelectedItem();
    setIsEmptyFieldError(false);
  };

  return (
    <div className="EquipmentTabDiv">
      {mBOMDrawerOpen ? null : loadingData ? (
        <div className="GuideStepsLoader">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="GuideItemsDiv">
          {!isReadOnly && (
            <Accordion
              expanded={accordionStatus}
              sx={{ margin: "0px", boxShadow: "none" }}
              className="GuideTaskBodyAccordion"
            >
              <div className="GuideTaskBodyHeader">
                <h2></h2>
                <ion-icon
                  name={
                    accordionStatus
                      ? "close-circle-outline"
                      : "add-circle-outline"
                  }
                  onClick={() => {
                    if (accordionStatus) {
                      handleCloseAccordion();
                    } else {
                      setAccordionStatus(true);
                    }
                  }}
                ></ion-icon>
              </div>
              <AccordionDetails className="EquipAccordion">
                <div className="EquipAccordionInner">
                  <TextField
                    select
                    fullWidth
                    value={itemsOption}
                    className="SelectPartSelectField"
                    disabled={selectedEquipId ? true : false}
                    onChange={(e) => {
                      setItemsOption(e.target.value);
                      clearSelectedItem();
                    }}
                  >
                    <MenuItem value="part">
                      <div className="ItemsOptions">
                        <ion-icon name="construct-outline"></ion-icon>
                        Part
                      </div>
                    </MenuItem>
                    <MenuItem value="tool">
                      <div className="ItemsOptions">
                        <ion-icon name="build-outline"></ion-icon>
                        Tool
                      </div>
                    </MenuItem>
                    <MenuItem value="machine">
                      <div className="ItemsOptions">
                        <ion-icon name="cog-outline"></ion-icon>Machine
                      </div>
                    </MenuItem>
                  </TextField>
                  {selectedEquipId ? (
                    <TextField
                      value={editSelectedItem}
                      disabled={true}
                    ></TextField>
                  ) : (
                    <>
                      {itemsOption === "part" ? (
                        <Autocomplete
                          options={partsData}
                          getOptionLabel={(item) =>
                            `${item?.childPart?.partNumber} - ${item?.childPart?.name}`
                          }
                          className="SelectPartTextField"
                          fullWidth
                          value={selectedItem}
                          onChange={(event, newValue) => {
                            const findExistence = equipmentDetails.find(
                              (item) =>
                                item.guideStepId === stepId &&
                                item.partId === newValue?.childPartId,
                            );
                            if (!findExistence && newValue) {
                              setSelectedItem(newValue);
                            } else if (findExistence) {
                              setSelectedEquipId(findExistence.id || "");
                              setSelectedEquipmentType("part");
                              setSelectedEquipmentPartId(
                                findExistence.part.id || "",
                              );
                              Alert("Equipment already available..!", "error");
                            } else {
                              setSelectedItem(null);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Select Part" />
                          )}
                          freeSolo
                          clearOnEscape
                          clearOnBlur
                          clearOnSelect
                        />
                      ) : itemsOption === "tool" ? (
                        <Autocomplete
                          options={toolsData}
                          getOptionLabel={(item) =>
                            `${item.number} - ${item.name}`
                          }
                          fullWidth
                          value={selectedItem}
                          className="SelectPartTextField"
                          onChange={(event, newValue) => {
                            const findExistence = equipmentDetails.find(
                              (item) =>
                                item.guideStepId === stepId &&
                                item.toolId === newValue?.id,
                            );
                            if (!findExistence && newValue) {
                              setSelectedItem(newValue);
                              setSelectedEquipId("");
                            } else if (findExistence) {
                              setSelectedEquipId(findExistence.id || "");
                              setSelectedEquipmentType("tool");
                              setSelectedEquipmentPartId(
                                findExistence.part.id || "",
                              );
                              Alert("Equipment already available..!", "error");
                            } else {
                              setSelectedItem(null);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Select Tool" />
                          )}
                          freeSolo
                          clearOnEscape
                          clearOnBlur
                          clearOnSelect
                        />
                      ) : itemsOption === "machine" ? (
                        <Autocomplete
                          options={machinesData}
                          className="SelectPartTextField"
                          getOptionLabel={(item) =>
                            `${item.number} - ${item.name}`
                          }
                          fullWidth
                          value={selectedItem}
                          onChange={(event, newValue) => {
                            const findExistence = equipmentDetails.find(
                              (item) =>
                                item.guideStepId === stepId &&
                                item.machineId === newValue?.id,
                            );
                            if (!findExistence && newValue) {
                              setSelectedItem(newValue);
                              setSelectedEquipId("");
                            } else if (findExistence) {
                              setSelectedEquipId(findExistence.id || "");
                              setSelectedEquipmentType("machine");
                              setSelectedEquipmentPartId(
                                findExistence.part.id || "",
                              );
                              Alert("Equipment already available..!", "error");
                            } else {
                              setSelectedItem(null);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Select Machine" />
                          )}
                          freeSolo
                          clearOnEscape
                          clearOnBlur
                          clearOnSelect
                        />
                      ) : (
                        ""
                      )}
                    </>
                  )}
                  <TextField
                    label="Quantity"
                    type="number"
                    className="AdminTextFeilds QuantityTextField"
                    value={quantity}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (
                        (/^\d+$/.test(inputValue) && inputValue !== "0") ||
                        inputValue === ""
                      ) {
                        setQuantity(inputValue);
                      }
                    }}
                  ></TextField>
                </div>
                <div className="AddButtonInEquipTab">
                  {isEmptyFieldError && (
                    <p className="ErrorMessage">All fields are required</p>
                  )}
                  {selectedEquipId ? (
                    <Button
                      className="CancelButton"
                      onClick={handleCloseAccordion}
                    >
                      Cancel
                    </Button>
                  ) : (
                    ""
                  )}
                  <Button
                    disabled={loadingData}
                    onClick={() => {
                      setIsEmptyFieldError(false);
                      selectedEquipId ? updateEquipment() : handleCreate();
                    }}
                  >
                    {selectedEquipId ? "Update" : "Add"}
                  </Button>
                </div>
              </AccordionDetails>
            </Accordion>
          )}

          <div className="AddItemsDataGrid">
            <Accordion expanded={partEquipmentAccordionStatus}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                onClick={() => {
                  setPartEquipmentAccordionStatus(
                    !partEquipmentAccordionStatus,
                  );
                }}
              >
                <p className="ProductsAccordionHeader">Parts</p>
              </AccordionSummary>
              <AccordionDetails>
                {partEquipmentDetails?.length > 0 ? (
                  <StyledDataGrid
                    rows={partEquipmentDetails}
                    columns={columns}
                    loading={loadingAddItemData}
                    className="GuideDataGrid"
                    onCellClick={(params) => {
                      if (params.field === "quantity") {
                        setSelectedEquipId(params.row.id);
                        setSelectedEquipmentPartId(params.row.part.id);
                        setSelectedEquipmentType(params.row.equipmentType);
                        setAccordionStatus(true);
                      } else {
                        setPartEquipmentAccordionStatus(true);
                      }
                    }}
                  />
                ) : (
                  <p className="NoDataMessage">
                    No Part Added.
                    {!isReadOnly && (
                      <p
                        onClick={() => {
                          setAccordionStatus(true);
                          setItemsOption("part");
                        }}
                      >
                        Create One?
                      </p>
                    )}
                  </p>
                )}
              </AccordionDetails>
            </Accordion>
            <Accordion expanded={remainingEquipmentAccordionStatus}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                onClick={() => {
                  setRemainingEquipmentAccordionStatus(
                    !remainingEquipmentAccordionStatus,
                  );
                }}
              >
                <p className="ProductsAccordionHeader">Tools and Machines</p>
              </AccordionSummary>
              <AccordionDetails>
                {remainingEquipmentDetails?.length > 0 ? (
                  <StyledDataGrid
                    rows={remainingEquipmentDetails}
                    columns={columnsForRemaining}
                    className="GuideDataGrid"
                    onCellClick={(params) => {
                      if (params.field === "quantity") {
                        setSelectedEquipId(params.row.id);
                        setSelectedEquipmentPartId(
                          params.row.equipmentType === "tool"
                            ? params.row.tool.id
                            : params.row.machine.id,
                        );
                        setSelectedEquipmentType(params.row.equipmentType);
                        setAccordionStatus(true);
                      }
                    }}
                  />
                ) : (
                  <p className="NoDataMessage">
                    No Tool or Machine Added.
                    {!isReadOnly && (
                      <p
                        onClick={() => {
                          setAccordionStatus(true);
                          setItemsOption("tool");
                        }}
                      >
                        Create One?
                      </p>
                    )}
                  </p>
                )}
              </AccordionDetails>
            </Accordion>
          </div>
        </div>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default AddItems;
