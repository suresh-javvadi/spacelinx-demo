import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Button,
  TextField,
  FormControlLabel,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { Divider } from "@mui/material";
import "./Step.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import {
  createGuideStepTask,
  deleteGuideStepTask,
  fetchGuideStepTaskWithStepId,
  guideStepTaskReorder,
} from "../../services/guideTaskService";
import { fetchGuideEquipmentWithStepId } from "../../services/guideEquipmentService";
import EditTask from "./EditTask";
import { GuideContext } from "./GuideContext";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Cliploader from "../../Components/Loaders/Cliploader";
import {
  showAlert,
  showConfirmation,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";

const isHtmlEmpty = (html) =>
  !html || html.replace(/<[^>]+>/g, "").trim() === "";

const SortableItem = ({
  id,
  task,
  onEditClick,
  handleDeleteTask,
  isDraggable,
  isReadOnly,
  dialogMaxWidth,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    if (descRef.current) {
      setIsOverflowing(
        descRef.current.scrollHeight > descRef.current.clientHeight,
      );
    }
  }, [task.description]);

  const style = {
    transform: isDraggable ? CSS.Transform.toString(transform) : "none",
    transition: isDraggable ? transition : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      draggable={isDraggable}
    >
      <div className="TaskLists">
        <div className="TasksListMain">
          <div className="TasksList">
            <div>
              {task.taskdetails && (
                <p className="TaskTypeInList">
                  {(() => {
                    switch (task.type) {
                      case "Data":
                        return <ion-icon name="document-outline"></ion-icon>;
                      case "Assembly":
                        return <ion-icon name="hammer-outline"></ion-icon>;
                      case "Test":
                        return (
                          <ion-icon name="document-text-outline"></ion-icon>
                        );
                      case "Picture":
                        return <ion-icon name="camera-outline"></ion-icon>;
                      case "Genealogy":
                        return <ion-icon name="briefcase-outline"></ion-icon>;
                      default:
                        return null;
                    }
                  })()}
                </p>
              )}
              <Divider orientation="vertical" flexItem />
              <div className="taskDescriptionWrapper">
                <div
                  ref={descRef}
                  className="taskDescription"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(task.description),
                  }}
                />
                {isOverflowing && (
                  <button
                    className="taskViewAllBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewAllOpen(true);
                    }}
                  >
                    View all
                  </button>
                )}
              </div>
            </div>
            {task.ismandatory === 1 && (
              <p className="TaskBehaviour">
                <ion-icon
                  name="star-outline"
                  className="TaskBehaviour"
                ></ion-icon>
              </p>
            )}
            <Divider orientation="vertical" flexItem />
            {!isReadOnly && (
              <p className="TaskEditPencil" onClick={() => onEditClick(task)}>
                <ion-icon name="pencil-outline"></ion-icon>
              </p>
            )}
          </div>
          {!isReadOnly && (
            <p
              className="DeleteTaskIcon"
              onClick={() => handleDeleteTask(task.id)}
            >
              <ion-icon name="trash-outline"></ion-icon>
            </p>
          )}
        </div>
      </div>
      <Dialog
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        maxWidth={dialogMaxWidth}
        fullWidth
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogTitle>Task Description</DialogTitle>
        <DialogContent>
          <div
            className="taskDescriptionFull"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(task.description),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewAllOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const AddTask = ({ stepId, guideId, setAllDataIsFetched, isReadOnly }) => {
  const taskType = [
    {
      type: <ion-icon name="document-outline"></ion-icon>,
      value: "Data",
    },
    {
      type: <ion-icon name="hammer-outline"></ion-icon>,
      value: "Assembly",
    },
    {
      type: <ion-icon name="document-text-outline"></ion-icon>,
      value: "Test",
    },
    {
      type: <ion-icon name="camera-outline"></ion-icon>,
      value: "Picture",
    },
    {
      type: <ion-icon name="briefcase-outline"></ion-icon>,
      value: "Genealogy",
    },
  ];
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("xl"));
  const dialogMaxWidth = isDesktop ? "xl" : "lg";

  const { Alert } = useContext(AlertsContext);
  const {
    setTriggerReCall,
    triggerRecall,
    setTriggerGenealogyData,
    triggerGenealogyData,
    setTaskListData,
    taskListData,
  } = useContext(GuideContext);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [taskBehaviourOption, setTaskBehaviourOption] = useState("1");
  const [taskTypeOption, setTaskTypeOption] = useState("Assembly");
  const [taskList, setTaskList] = useState([]);
  const [taskDescription, setTaskDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");
  const [typeOptionError, setTypeOptionError] = useState("");
  const [dataTypeOption, setDataTypeOption] = useState("Text");
  const [radioDataTypeValue, setRadioDataTypeValue] = useState([]);
  const [listDataTypeValue, setListDataTypeValue] = useState([]);
  const [dataTypeOptionsData, setDataTypeOptionsData] = useState([]);
  const [genealogyOptions, setGenealogyOptions] = useState(null);
  const [selectedGenealogyEquipment, setSelectedGenealogyEquipment] =
    useState(null);
  const [genealogyQuantity, setGenealogyQuantity] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [quantityError, setQuantityError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (isReadOnly) {
      showAlert("error", "Not Allowed", "Reordering is not allowed.");
      return;
    }

    if (active?.id !== over?.id) {
      const confirmed = await showConfirmation(
        "Reorder Task?",
        "Are you sure you want to reorder this task?",
        "Yes, reorder",
      );
      if (!confirmed) return;

      const oldIndex = taskList.findIndex((task) => task?.id === active?.id);
      const newIndex = taskList.findIndex((task) => task?.id === over?.id);

      const newItems = arrayMove(taskList, oldIndex, newIndex);
      setTaskList(newItems);
      setLoadingData(true);
      try {
        await guideStepTaskReorder(active.id, newIndex + 1);
        await fetchTaskData();
        showAlert("success", "Reordered!", "Task reordered successfully!");
      } catch (error) {
        console.error("Failed to update task sequence", error);
        showAlert("error", "Failed", "Couldn't update the task order.");
      } finally {
        setLoadingData(false);
      }
    }
  };

  useEffect(() => {
    if (stepId) {
      fetchTaskData();
      setTaskDescription("");
      setRadioDataTypeValue({ name: "", value: "" });
      setListDataTypeValue({ name: "", value: "" });
      setDataTypeOptionsData([]);
    }
  }, [stepId]);

  const fetchTaskData = async () => {
    setLoadingData(true);
    setAllDataIsFetched(true);
    try {
      const data = await fetchGuideStepTaskWithStepId(stepId);
      data.sort((a, b) => new Date(a.sequence) - new Date(b.sequence));
      if (data) {
        setTaskList(data);
        setTaskListData(data);
      }
      setLoadingData(false);
    } catch (error) {
      Alert("Couldn't fetch task data...!", "error");
      setLoadingData(false);
      console.error(error);
    } finally {
      setLoadingData(false);
      setAllDataIsFetched(false);
    }
  };

  const handleDeleteTask = async (id) => {
    const confirmed = await showConfirmation(
      "Delete Task?",
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) return;

    setLoadingData(true);

    try {
      await deleteGuideStepTask(id);
      await fetchTaskData();
      showAlert("success", "Deleted!", "Task deleted successfully.");
    } catch (error) {
      showAlert("error", "Error", "Couldn't delete task at this moment...!");
      console.error("Delete task error:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddDataTypOptionsValue = () => {
    if (
      taskTypeOption === "Data" &&
      (dataTypeOption === "Radio" || dataTypeOption === "List")
    ) {
      if (dataTypeOption === "Radio" && radioDataTypeValue.name.trim() === "") {
        setTypeOptionError("Field cannot be empty");
        return;
      }
      if (dataTypeOption === "List" && listDataTypeValue.name.trim() === "") {
        setTypeOptionError("Field cannot be empty");
        return;
      }

      const newDataTypeOption =
        dataTypeOption === "Radio" ? radioDataTypeValue : listDataTypeValue;
      setDataTypeOptionsData((prevData) => [...prevData, newDataTypeOption]);
      setRadioDataTypeValue({ name: "", value: "" });
      setListDataTypeValue({ name: "", value: "" });
      setTypeOptionError("");
    }
  };

  const handleResetDataTypeOptions = (e) => {
    setDataTypeOption("Text");
    setDataTypeOptionsData([]);
  };

  const handleResetOptionsValue = (e) => {
    if (e.target.value === "Radio" || e.target.value === "List") {
      setDataTypeOptionsData([]);
    }
  };

  const resetTaskForm = () => {
    setTaskDescription("");
    setTaskTypeOption("Assembly");
    setGenealogyQuantity(1);
    setDataTypeOption("Text");
    setDataTypeOptionsData([]);
    setSelectedGenealogyEquipment(null);
    setDescriptionError("");
    setQuantityError("");
  };

  useEffect(() => {
    if (stepId || triggerGenealogyData) {
      fetchGenealogyData();
    }
    setTaskTypeOption("Assembly");
  }, [stepId, triggerGenealogyData]);

  const fetchGenealogyData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchGuideEquipmentWithStepId(stepId);
      const stepEquipment = data.filter(
        (step) => step.equipmentType === "part",
      );
      setGenealogyOptions(stepEquipment);
      setTriggerGenealogyData(false);
    } catch (error) {
      Alert("This Step Doesn't have any Equipment", "error");
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateTask = async () => {
    setLoadingData(true);
    try {
      if (taskTypeOption !== "Genealogy" && isHtmlEmpty(taskDescription)) {
        Alert("Task description cannot be empty", "error");
        setLoadingData(false);
        return;
      }

      if (taskTypeOption === "Genealogy") {
        if (!selectedGenealogyEquipment) {
          Alert("Please select an equipment", "error");
          setLoadingData(false);
          return;
        }
        if (genealogyQuantity <= 0) {
          Alert("Quantity must be greater than zero", "error");
          setQuantityError(
            "Quantity is required and must be greater than zero",
          );
          setLoadingData(false);
          return;
        } else {
          setQuantityError("");
        }
        if (genealogyQuantity > 1 && taskDescription.trim() === "") {
          Alert(
            "Description is required for quantities greater than 1",
            "error",
          );
          setDescriptionError(
            "Description is required for quantities greater than 1",
          );
          setLoadingData(false);
          return;
        } else {
          setDescriptionError("");
        }
      }

      if (
        taskTypeOption === "Data" &&
        (dataTypeOption === "Radio" || dataTypeOption === "List")
      ) {
        if (dataTypeOptionsData.length === 0) {
          Alert("Please add at least one option", "error");
          setLoadingData(false);
          return;
        }
      }

      if (taskTypeOption === "Genealogy") {
        const existingTaskQuantities = taskList
          .filter((task) => {
            const taskDetails = JSON.parse(task.taskdetails);
            return (
              taskDetails?.genealogy?.genealogy?.id ===
              selectedGenealogyEquipment.partId
            );
          })
          .reduce((acc, task) => {
            const taskDetails = JSON.parse(task.taskdetails);
            const quantity =
              parseInt(taskDetails.genealogy?.genealogy?.quantity, 10) || 0;
            return acc + quantity;
          }, 0);
        const genealogyLimit = parseInt(
          selectedGenealogyEquipment?.quantity,
          10,
        );
        const totalQuantity =
          existingTaskQuantities + parseInt(genealogyQuantity, 10);
        const limit = genealogyLimit - existingTaskQuantities;
        if (totalQuantity > genealogyLimit) {
          Alert(
            `Couldn't Create Task. Remaining available quantity of this part is ${limit}.`,
            "error",
          );
          setGenealogyQuantity(1);
          setLoadingData(false);
          return;
        }
      }

      const textContent = taskDescription.replace(/<[^>]+>/g, "").trim();
      const taskName =
        textContent.length > 255
          ? textContent.substring(0, 252) + "..."
          : textContent;

      const taskData = {
        name: taskName,
        type: taskTypeOption,
        taskdetails: JSON.stringify(
          taskTypeOption === "Data"
            ? {
                dataType: {
                  text: dataTypeOption === "Text" ? "1" : null,
                  radio:
                    dataTypeOption === "Radio" ? dataTypeOptionsData : null,
                  list: dataTypeOption === "List" ? dataTypeOptionsData : null,
                },
                assembly: null,
                test: null,
                picture: null,
                genealogy: null,
              }
            : taskTypeOption === "Assembly"
              ? {
                  dataType: null,
                  assembly: { value: 1, response: "" },
                  test: null,
                  picture: null,
                  genealogy: null,
                }
              : taskTypeOption === "Test"
                ? {
                    dataType: null,
                    assembly: null,
                    test: { value: 1, response: "" },
                    picture: null,
                    genealogy: null,
                  }
                : taskTypeOption === "Picture"
                  ? {
                      dataType: null,
                      assembly: null,
                      test: null,
                      picture: { value: 1, response: null },
                      genealogy: null,
                    }
                  : {
                      dataType: null,
                      assembly: null,
                      test: null,
                      picture: null,
                      genealogy: {
                        genealogy: {
                          id: selectedGenealogyEquipment.part.id,
                          number: selectedGenealogyEquipment.part.name,
                          name: selectedGenealogyEquipment.part.number,
                          quantity: genealogyQuantity,
                        },
                        value: [],
                      },
                    },
        ),
        description:
          taskTypeOption === "Genealogy"
            ? genealogyQuantity <= 1
              ? `Enter the Serial/Lot Number of @${selectedGenealogyEquipment.part.number}-${selectedGenealogyEquipment.part.name}`
              : `Enter ${genealogyQuantity} Serial/Lot Numbers of @${selectedGenealogyEquipment.part.number}-${selectedGenealogyEquipment.part.name}  ` +
                taskDescription
            : taskDescription,
        ismandatory: taskBehaviourOption === "1" ? 1 : 0,
        guideStepId: stepId,
        guideId: guideId,
      };

      await createGuideStepTask(taskData);
      resetTaskForm();
      setIsCreateDialogOpen(false);
      fetchTaskData();
      setTriggerReCall(true);
      Alert("Task created Successfully..!", "success");
    } catch (error) {
      console.error(error);
      Alert("Couldn't create task ...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="GuideEditFlyoutBody">
      <Divider orientation="vertical" />
      <div className="GuideTaskBody">
        <div className="GuideTaskBodyCreateAccordion">
          <div className="GuideTaskBodyHeader">
            <h2>Tasks</h2>
            {!isReadOnly && (
              <ion-icon
                name="add-circle-outline"
                onClick={() => {
                  resetTaskForm();
                  setIsCreateDialogOpen(true);
                }}
              ></ion-icon>
            )}
          </div>
        </div>

        {/* Create Task Dialog */}
        <Dialog
          open={isCreateDialogOpen}
          onClose={() => {
            resetTaskForm();
            setIsCreateDialogOpen(false);
          }}
          maxWidth={dialogMaxWidth}
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pr: 1,
            }}
          >
            Create Task
            <IconButton
              size="medium"
              onClick={() => {
                resetTaskForm();
                setIsCreateDialogOpen(false);
              }}
            >
              <ion-icon name="close-outline" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <div className="CreateTaskAccordion task-dialog-content">
              <div className="TaskRadiosDiv">
                <div className="TaskRadiosDiv1Inner">
                  <p className="mandatory">Mandatory :</p>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    name="radio-buttons-group"
                    value={taskBehaviourOption}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      marginLeft: "6px",
                    }}
                    onChange={(e) => {
                      setTaskBehaviourOption(e.target.value);
                    }}
                  >
                    <FormControlLabel
                      value="1"
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 18,
                            },
                          }}
                        />
                      }
                      label="Yes"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: 14,
                        },
                      }}
                    />
                    <FormControlLabel
                      value="0"
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 18,
                            },
                          }}
                        />
                      }
                      label="No"
                      sx={{
                        "& .MuiFormControlLabel-label": {
                          fontSize: 14,
                        },
                      }}
                    />
                  </RadioGroup>
                </div>

                <div className="TaskRadiosDiv1">
                  <TextField
                    label="Task Type"
                    select
                    fullWidth
                    value={taskTypeOption}
                    className="TaskType"
                    onChange={(e) => {
                      setTaskTypeOption(e.target.value);
                      handleResetDataTypeOptions();
                    }}
                  >
                    {taskType.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        <p className="TaskType">
                          {item.type} {item.value}
                        </p>
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
              </div>

              {taskTypeOption === "Genealogy" ? (
                genealogyOptions?.length >= 1 ? (
                  <>
                    <Autocomplete
                      options={genealogyOptions}
                      getOptionLabel={(item) =>
                        `${item.part.number}/${item.part.name}`
                      }
                      fullWidth
                      value={selectedGenealogyEquipment}
                      onChange={(event, newValue) => {
                        const totalTaskQuantity = taskList
                          .filter(
                            (task) =>
                              task.type === "Genealogy" &&
                              JSON.parse(task.taskdetails).genealogy?.genealogy
                                ?.id === newValue.part.id,
                          )
                          .reduce((acc, task) => {
                            const taskDetails = JSON.parse(task.taskdetails);
                            const quantity =
                              parseInt(
                                taskDetails.genealogy?.genealogy?.quantity,
                                10,
                              ) || 0;
                            return acc + quantity;
                          }, 0);
                        const isQuantityEqual =
                          totalTaskQuantity === newValue?.quantity;

                        if (isQuantityEqual) {
                          Alert(
                            `Equipment Limit Reached:${totalTaskQuantity}`,
                            "error",
                          );
                          setSelectedGenealogyEquipment(null);
                        } else {
                          setSelectedGenealogyEquipment(newValue);
                        }
                      }}
                      freeSolo
                      renderOption={(props, option) => {
                        const totalTaskQuantity = taskList
                          .filter(
                            (task) =>
                              task.type === "Genealogy" &&
                              JSON.parse(task.taskdetails).genealogy?.genealogy
                                ?.id === option.part.id,
                          )
                          .reduce((acc, task) => {
                            const taskDetails = JSON.parse(task.taskdetails);
                            const quantity =
                              parseInt(
                                taskDetails.genealogy?.genealogy?.quantity,
                                10,
                              ) || 0;
                            return acc + quantity;
                          }, 0);
                        const isQuantityEqual =
                          totalTaskQuantity === option.quantity;

                        return (
                          <MenuItem
                            {...props}
                            sx={{ color: isQuantityEqual ? "grey" : "black" }}
                          >
                            {option.part.number}/{option.part.name}
                          </MenuItem>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="Select Equipment" />
                      )}
                    />

                    <TextField
                      disabled={!selectedGenealogyEquipment || loadingData}
                      className="ChildPartTextFeild"
                      label="Quantity"
                      value={genealogyQuantity}
                      onChange={(e) => setGenealogyQuantity(e.target.value)}
                      error={Boolean(quantityError)}
                      helperText={quantityError}
                    />
                    {genealogyQuantity > 1 && (
                      <TextField
                        label="Description"
                        multiline
                        fullWidth
                        rows={4}
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        InputProps={{ style: { fontSize: "13px" } }}
                        error={Boolean(descriptionError)}
                        helperText={descriptionError}
                      />
                    )}
                  </>
                ) : (
                  <div className="GenealogyEquipUnavailable">
                    Add a Part First in the Equipment section
                  </div>
                )
              ) : (
                <div className="quill-wrapper">
                  <label className="quill-label">Description</label>
                  <ReactQuill
                    theme="snow"
                    value={taskDescription}
                    onChange={(content) => setTaskDescription(content)}
                  />
                  {descriptionError && (
                    <p className="quill-error">{descriptionError}</p>
                  )}
                </div>
              )}

              {taskTypeOption === "Data" && (
                <>
                  <ToggleButtonGroup
                    size="large"
                    value={dataTypeOption}
                    exclusive
                    onChange={(e, newValue) => {
                      if (newValue !== null) {
                        setDataTypeOption(newValue);
                        handleResetOptionsValue();
                      }
                    }}
                  >
                    <ToggleButton value="Text" color="primary">
                      <ion-icon name="text-outline"></ion-icon>
                    </ToggleButton>
                    <ToggleButton value="Radio" color="primary">
                      <ion-icon name="radio-button-on-outline"></ion-icon>
                    </ToggleButton>
                    <ToggleButton value="List" color="primary">
                      <ion-icon name="list-outline"></ion-icon>
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <div
                    className="dataTypeInput"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    {dataTypeOption === "Radio" && (
                      <>
                        <TextField
                          style={{ marginRight: "10px" }}
                          value={radioDataTypeValue.name}
                          onChange={(e) =>
                            setRadioDataTypeValue({
                              name: e.target.value,
                              value: "unChecked",
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <>
                                <InputAdornment sx={{ marginRight: "13px" }}>
                                  <ion-icon name="radio-button-off-outline"></ion-icon>
                                </InputAdornment>
                                <Divider orientation="vertical" flexItem />
                              </>
                            ),
                          }}
                          error={Boolean(typeOptionError)}
                          helperText={typeOptionError || " "}
                        />
                        <Button
                          onClick={handleAddDataTypOptionsValue}
                          style={{
                            height: "fit-content",
                            marginLeft: "10px",
                            marginTop: "-18px",
                          }}
                        >
                          +
                        </Button>
                      </>
                    )}

                    {dataTypeOption === "List" && (
                      <>
                        <TextField
                          style={{ marginRight: "10px" }}
                          value={listDataTypeValue.name}
                          onChange={(e) =>
                            setListDataTypeValue({
                              name: e.target.value,
                              value: "unChecked",
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <>
                                <InputAdornment sx={{ marginRight: "13px" }}>
                                  <ion-icon name="square-outline"></ion-icon>
                                </InputAdornment>
                                <Divider orientation="vertical" flexItem />
                              </>
                            ),
                          }}
                          error={Boolean(typeOptionError)}
                          helperText={typeOptionError || " "}
                        />
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={handleAddDataTypOptionsValue}
                          style={{
                            height: "fit-content",
                            marginLeft: "10px",
                            marginTop: "-18px",
                          }}
                        >
                          +
                        </Button>
                      </>
                    )}
                  </div>

                  {["Radio", "List"].includes(dataTypeOption) &&
                    dataTypeOptionsData.length > 0 &&
                    dataTypeOptionsData.map((option, index) => (
                      <div className="dataTypeOptionBox" key={index}>
                        <div className="dataTypeOptionBoxInner">
                          {dataTypeOption === "Radio" ? (
                            <ion-icon name="radio-button-off-outline"></ion-icon>
                          ) : (
                            <ion-icon name="square-outline"></ion-icon>
                          )}
                          <Divider orientation="vertical" />
                          <p className="dataTypeOptionBoxInnerP">
                            {option.name}
                          </p>
                        </div>
                        <ion-icon
                          name="trash-outline"
                          style={{ color: "red", cursor: "pointer" }}
                          onClick={() => {
                            const newData = [...dataTypeOptionsData];
                            newData.splice(index, 1);
                            setDataTypeOptionsData(newData);
                          }}
                        />
                      </div>
                    ))}
                </>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                resetTaskForm();
                setIsCreateDialogOpen(false);
              }}
              className="CancelButton"
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={loadingData}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth={dialogMaxWidth}
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pr: 1,
            }}
          >
            Edit Task
            <IconButton size="medium" onClick={() => setEditDialogOpen(false)}>
              <ion-icon name="close-outline" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <EditTask
              setMainTaskLoadingData={setLoadingData}
              handleResetDataTypeOptions={handleResetDataTypeOptions}
              taskType={taskType}
              selectedTaskForEdit={selectedTaskForEdit}
              onClose={() => setEditDialogOpen(false)}
              stepId={stepId}
              guideId={guideId}
              fetchTaskData={fetchTaskData}
              taskList={taskList}
              genealogyOptions={genealogyOptions}
            />
          </DialogContent>
        </Dialog>

        <div>
          {loadingData ? (
            <div className="GuideStepTasksLoader">
              <Cliploader loading={loadingData} />
            </div>
          ) : taskList.length === 0 ? (
            <p className="TaskNotAvailableMsg">No Tasks Available</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
              disabled={isReadOnly}
            >
              <SortableContext
                items={taskList.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                {taskList.map((task) => (
                  <SortableItem
                    key={task.id}
                    id={task.id}
                    task={task}
                    onEditClick={(t) => {
                      setSelectedTaskForEdit(t);
                      setEditDialogOpen(true);
                    }}
                    handleDeleteTask={handleDeleteTask}
                    isDraggable={!isReadOnly}
                    isReadOnly={isReadOnly}
                    dialogMaxWidth={dialogMaxWidth}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};
export default AddTask;
