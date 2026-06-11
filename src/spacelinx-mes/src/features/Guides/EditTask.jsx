import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  TextField,
  FormControlLabel,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Autocomplete,
  Divider,
} from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { updateGuideStepTask } from "../../services/guideTaskService";
import { GuideContext } from "./GuideContext";
import { AlertsContext } from "../../features/AlertsContext/Context";
import "./Step.css";

const isHtmlEmpty = (html) =>
  !html || html.replace(/<[^>]+>/g, "").trim() === "";

const TaskAccordion = ({
  handleResetDataTypeOptions,
  taskType,
  onClose,
  stepId,
  fetchTaskData,
  setMainTaskLoadingData,
  guideId,
  taskList,
  genealogyOptions,
  selectedTaskForEdit,
}) => {
  const { setTriggerReCall } = useContext(GuideContext);
  const { Alert } = useContext(AlertsContext);
  const [editTaskBehaviourOption, setEditTaskBehaviourOption] = useState("");
  const [editTaskTypeOption, setEditTaskTypeOption] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editDataTypeOption, setEditDataTypeOption] = useState("Text");
  const [editRadioDataTypeValue, setEditRadioDataTypeValue] = useState([]);
  const [editListDataTypeValue, setEditListDataTypeValue] = useState([]);
  const [editTextDataTypeValue, setEditTextDataTypeValue] = useState([]);
  const [newDataTypeOptions, setNewDataTypeOptions] = useState({
    name: "",
    value: "",
  });
  const [editGenealogyDetails, setEditGenealogyDetails] = useState(null);
  const [editGenealogyQuantity, setEditGenealogyQuantity] = useState(0);
  const [quantityError, setQuantityError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [genealogyCountLimit, setGenealogyCountLimit] = useState(0);

  useEffect(() => {
    if (selectedTaskForEdit?.id) {
      fetchSelectedTaskData();
    }
  }, [selectedTaskForEdit?.id, genealogyOptions]);

  const fetchSelectedTaskData = async () => {
    setMainTaskLoadingData(true);
    try {
      const taskTypeDetails =
        typeof selectedTaskForEdit?.taskdetails === "string"
          ? JSON.parse(selectedTaskForEdit?.taskdetails)
          : selectedTaskForEdit;
      if (selectedTaskForEdit) {
        setEditTaskTypeOption(selectedTaskForEdit.type);
        setEditTaskDescription(selectedTaskForEdit.description);
        setEditTaskBehaviourOption(selectedTaskForEdit.ismandatory);
        if (selectedTaskForEdit.type === "Data") {
          setEditDataTypeOption(
            taskTypeDetails.dataType.text
              ? "Text"
              : taskTypeDetails.dataType.radio
                ? "Radio"
                : "List",
          );
          if (taskTypeDetails.dataType.radio) {
            setEditRadioDataTypeValue(taskTypeDetails.dataType?.radio);
          } else if (taskTypeDetails.dataType.list) {
            setEditListDataTypeValue(taskTypeDetails.dataType?.list);
          } else {
            return;
          }
        } else if (selectedTaskForEdit.type === "Genealogy") {
          const editGenealogy = genealogyOptions?.find(
            (item) => item.part.id === taskTypeDetails.genealogy.genealogy.id,
          );
          setEditGenealogyDetails(editGenealogy);
          setEditGenealogyQuantity(
            taskTypeDetails.genealogy.genealogy?.quantity || 0,
          );
        } else {
          return;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setMainTaskLoadingData(false);
    }
  };

  const updateTaskInfo = async () => {
    setMainTaskLoadingData(true);
    try {
      if (editTaskTypeOption === "Genealogy") {
        if (!editGenealogyDetails) {
          Alert("Please select an equipment", "error");
          setMainTaskLoadingData(false);
          return;
        }

        if (editGenealogyQuantity <= 0) {
          setQuantityError("Quantity must be greater than zero");
          setMainTaskLoadingData(false);
          return;
        } else {
          setQuantityError("");
        }

        if (editGenealogyQuantity > 1 && editTaskDescription.trim() === "") {
          setDescriptionError(
            "Description is required for quantities greater than 1",
          );
          setMainTaskLoadingData(false);
          return;
        } else {
          setDescriptionError("");
        }
        if (editGenealogyQuantity > genealogyCountLimit) {
          Alert(
            `You Cannot add quantity more than ${genealogyCountLimit}..`,
            "error",
          );
          setMainTaskLoadingData(false);
          return;
        }
      }

      const descEmpty =
        editTaskTypeOption === "Genealogy"
          ? editTaskDescription.trim() === ""
          : isHtmlEmpty(editTaskDescription);
      if (descEmpty) {
        Alert("Description cannot be empty", "error");
        setMainTaskLoadingData(false);
        return;
      }

      const editTextContent = editTaskDescription
        .replace(/<[^>]+>/g, "")
        .trim();
      let updatedData = {
        name:
          editTextContent.length > 255
            ? editTextContent.substring(0, 252) + "..."
            : editTextContent,
        type: editTaskTypeOption,
        ismandatory: editTaskBehaviourOption,
        guideStepId: stepId,
        guideId: guideId,
        description:
          editTaskTypeOption === "Genealogy"
            ? editGenealogyQuantity <= 1
              ? `Enter the Serial/Lot Number of @${editGenealogyDetails.number}-${editGenealogyDetails.name}`
              : `Enter ${editGenealogyQuantity} Serial/Lot Numbers of @${editGenealogyDetails.number}-${editGenealogyDetails.name}  ` +
                editTaskDescription
            : editTaskDescription,
        taskdetails:
          editTaskTypeOption === "Data"
            ? {
                dataType: {
                  text: editDataTypeOption === "Text" ? "1" : null,
                  radio:
                    editDataTypeOption === "Radio"
                      ? editRadioDataTypeValue
                      : null,
                  list:
                    editDataTypeOption === "List"
                      ? editListDataTypeValue
                      : null,
                },
                assembly: null,
                test: null,
                picture: null,
                genealogy: null,
              }
            : editTaskTypeOption === "Assembly"
              ? {
                  dataType: null,
                  assembly: { value: 1, response: "" },
                  test: null,
                  picture: null,
                  genealogy: null,
                }
              : editTaskTypeOption === "Test"
                ? {
                    dataType: null,
                    assembly: null,
                    test: { value: 1, response: "" },
                    picture: null,
                    genealogy: null,
                  }
                : editTaskTypeOption === "Picture"
                  ? {
                      dataType: null,
                      assembly: null,
                      test: null,
                      picture: { value: 1, response: "" },
                      genealogy: null,
                    }
                  : {
                      dataType: null,
                      assembly: null,
                      test: null,
                      picture: null,
                      genealogy: {
                        genealogy: {
                          id: editGenealogyDetails.part.id,
                          number: editGenealogyDetails.part.number,
                          name: editGenealogyDetails.part.name,
                          quantity: editGenealogyQuantity,
                        },
                        value: [],
                      },
                    },
      };

      if (editTaskTypeOption === "Genealogy") {
        updatedData = {
          ...updatedData,
          taskdetails: {
            ...updatedData.taskdetails,
            genealogy: {
              genealogy: {
                id: editGenealogyDetails.part.id,
                number: editGenealogyDetails.part.number,
                name: editGenealogyDetails.part.name,
                quantity: editGenealogyQuantity,
              },
              value: [],
            },
          },
          description:
            editGenealogyQuantity <= 1
              ? `Enter the Serial/Lot Number of @${editGenealogyDetails.part.number}-${editGenealogyDetails.part.name}`
              : `Enter ${editGenealogyQuantity} Serial/Lot Numbers of @${editGenealogyDetails.part.number}-${editGenealogyDetails.part.name}  ` +
                editTaskDescription,
        };
      }

      if (typeof updatedData.taskdetails !== "string") {
        updatedData.taskdetails = JSON.stringify(updatedData.taskdetails);
      }

      await updateGuideStepTask(selectedTaskForEdit?.id, updatedData);
      fetchTaskData();
      setTriggerReCall(true);
      Alert("Task Updated Successfully..!", "success");
      onClose();
    } catch (error) {
      console.error(error);
      Alert("Couldn't update task details...!", "error");
    } finally {
      setMainTaskLoadingData(false);
    }
  };

  const fetchGenealogyCount = () => {
    const countOfGenealogyParts = taskList
      .filter((task) => task.type === "Genealogy")
      .reduce((acc, task) => {
        if (task.id === selectedTaskForEdit.id) {
          return acc;
        }

        let taskDetails;
        try {
          taskDetails = JSON.parse(task.taskdetails);
        } catch (e) {
          console.error("Error parsing taskdetails:", e);
          return acc;
        }

        const genealogyId = taskDetails.genealogy?.genealogy?.id;
        const genealogyQuantity =
          parseInt(taskDetails.genealogy?.genealogy?.quantity, 10) || 0;

        if (genealogyId) {
          acc[genealogyId] = (acc[genealogyId] || 0) + genealogyQuantity;
        }

        return acc;
      }, {});

    if (editGenealogyDetails?.part.id) {
      const availableQuantity =
        genealogyOptions.find(
          (option) => option.part.id === editGenealogyDetails.part.id,
        )?.quantity || 0;
      const usedQuantity =
        countOfGenealogyParts[editGenealogyDetails.part.id] || 0;
      const limit = availableQuantity - usedQuantity;
      setGenealogyCountLimit(limit);
    }
  };

  useEffect(() => {
    fetchGenealogyCount();
  }, [editGenealogyDetails]);

  const handleAddDataTypOptionsValue = () => {
    if (editDataTypeOption === "Radio") {
      setEditRadioDataTypeValue([
        ...editRadioDataTypeValue,
        newDataTypeOptions,
      ]);
    } else {
      setEditListDataTypeValue([...editListDataTypeValue, newDataTypeOptions]);
    }
    setNewDataTypeOptions({ name: "", value: "" });
  };

  return (
    <div className="CreateTaskAccordion task-dialog-content">
      <div className="TaskRadiosDiv">
        <div className="TaskRadiosDiv1">
          <div className="TaskRadiosDiv1Inner">
            <p>Is Mandatory :</p>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              name="radio-buttons-group"
              value={editTaskBehaviourOption}
              sx={{
                display: "flex",
                flexDirection: "row",
                marginLeft: "6px",
              }}
              onChange={(e) => {
                setEditTaskBehaviourOption(parseInt(e.target.value, 10));
              }}
            >
              <FormControlLabel value="1" control={<Radio />} label="Yes" />
              <FormControlLabel value="0" control={<Radio />} label="No" />
            </RadioGroup>
          </div>
        </div>
        <div className="TaskRadiosDiv1">
          <TextField
            label="Task Type"
            select
            fullWidth
            getOptionLabel={(item) => item.name}
            value={editTaskTypeOption}
            className="TaskType"
            onChange={(e) => {
              setEditTaskTypeOption(e.target.value);
              handleResetDataTypeOptions();
            }}
          >
            {taskType.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                <p className="TaskType">
                  {item.type}
                  {item.value}
                </p>
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>
      {editTaskTypeOption === "Genealogy" ? (
        <>
          <Autocomplete
            options={genealogyOptions}
            getOptionLabel={(item) =>
              `${item?.part?.number}/${item?.part?.name}`
            }
            fullWidth
            value={editGenealogyDetails}
            onChange={(event, newValue) => {
              setEditGenealogyDetails(newValue);
            }}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} label="Select Equipment" />
            )}
          />
          <TextField
            disabled={!editGenealogyDetails}
            className="ChildPartTextFeild"
            label="Quantity"
            type="number"
            value={editGenealogyQuantity}
            onChange={(e) => {
              const value =
                e.target.value === "" ? "" : parseInt(e.target.value, 10);
              setEditGenealogyQuantity(value);
            }}
            error={Boolean(quantityError)}
            helperText={quantityError}
          />
          {editGenealogyQuantity > 1 ? (
            <TextField
              label="Description"
              multiline
              fullWidth
              rows={4}
              value={editTaskDescription}
              onChange={(e) => {
                setEditTaskDescription(e.target.value);
              }}
              InputProps={{
                style: {
                  fontSize: "13px",
                },
              }}
              error={Boolean(descriptionError)}
              helperText={descriptionError}
            />
          ) : null}
        </>
      ) : (
        <div className="quill-wrapper">
          <label className="quill-label">Description</label>
          <ReactQuill
            theme="snow"
            value={editTaskDescription}
            onChange={(content) => setEditTaskDescription(content)}
          />
          {descriptionError && (
            <p className="quill-error">{descriptionError}</p>
          )}
        </div>
      )}

      {editTaskTypeOption === "Data" ? (
        <ToggleButtonGroup
          size="large"
          value={editDataTypeOption}
          onChange={(e) => {
            setEditDataTypeOption(e.target.value);
            setNewDataTypeOptions([]);
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
      ) : (
        ""
      )}
      <div className="dataTypeInput">
        {editTaskTypeOption === "Data" && editDataTypeOption === "Radio" ? (
          <>
            <TextField
              value={newDataTypeOptions.name}
              onChange={(e) =>
                setNewDataTypeOptions({
                  name: e.target.value,
                  value: "unChecked",
                })
              }
              style={{ marginRight: "10px" }}
              InputProps={{
                startAdornment: (
                  <>
                    <InputAdornment
                      sx={{
                        marginRight: "13px",
                      }}
                    >
                      <ion-icon name="radio-button-off-outline"></ion-icon>
                    </InputAdornment>
                    <Divider orientation="vertical" flexItem />
                  </>
                ),
              }}
            ></TextField>
            <Button onClick={handleAddDataTypOptionsValue}>+</Button>
          </>
        ) : (
          ""
        )}
        {editTaskTypeOption === "Data" && editDataTypeOption === "List" ? (
          <>
            <TextField
              style={{ marginRight: "10px" }}
              value={newDataTypeOptions.name}
              onChange={(e) =>
                setNewDataTypeOptions({
                  name: e.target.value,
                  value: "unChecked",
                })
              }
              InputProps={{
                startAdornment: (
                  <>
                    <InputAdornment
                      sx={{
                        marginRight: "13px",
                      }}
                    >
                      <ion-icon name="square-outline"></ion-icon>
                    </InputAdornment>
                    <Divider orientation="vertical" flexItem />
                  </>
                ),
              }}
            ></TextField>
            <Button onClick={handleAddDataTypOptionsValue}>+</Button>
          </>
        ) : (
          ""
        )}
      </div>
      <div className="ExistingDataTypeItems">
        {editTaskTypeOption === "Data" && editDataTypeOption === "Radio"
          ? editRadioDataTypeValue &&
            editRadioDataTypeValue.map((item, index) => (
              <div className="dataTypeOptionBox" key={index}>
                <TextField
                  fullWidth
                  value={item.name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditRadioDataTypeValue((prevValues) => {
                      const newValues = [...prevValues];
                      newValues[index] = {
                        ...newValues[index],
                        name: newValue,
                      };
                      return newValues;
                    });
                  }}
                  InputProps={{
                    startAdornment: (
                      <>
                        <InputAdornment
                          sx={{
                            marginRight: "13px",
                          }}
                        >
                          <ion-icon name="radio-button-off-outline"></ion-icon>
                        </InputAdornment>
                        <Divider orientation="vertical" flexItem />
                      </>
                    ),
                  }}
                ></TextField>
                <ion-icon
                  name="trash-outline"
                  onClick={() =>
                    setEditRadioDataTypeValue((prevValues) =>
                      prevValues.filter((_, i) => i !== index),
                    )
                  }
                  style={{ cursor: "pointer" }}
                ></ion-icon>
              </div>
            ))
          : editDataTypeOption === "List" &&
            editListDataTypeValue &&
            editListDataTypeValue.map((item, index) => (
              <div className="dataTypeOptionBox" key={index}>
                <TextField
                  fullWidth
                  value={item.name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditListDataTypeValue((prevValues) => {
                      const newValues = [...prevValues];
                      newValues[index] = {
                        ...newValues[index],
                        name: newValue,
                      };
                      return newValues;
                    });
                  }}
                  InputProps={{
                    startAdornment: (
                      <>
                        <InputAdornment
                          sx={{
                            marginRight: "13px",
                          }}
                        >
                          <ion-icon name="square-outline"></ion-icon>
                        </InputAdornment>
                        <Divider orientation="vertical" flexItem />
                      </>
                    ),
                  }}
                ></TextField>
                <ion-icon
                  name="trash-outline"
                  onClick={() =>
                    setEditListDataTypeValue((prevValues) =>
                      prevValues.filter((_, i) => i !== index),
                    )
                  }
                  style={{ cursor: "pointer", color: "red" }}
                ></ion-icon>
              </div>
            ))}
      </div>

      <div className="CreateTaskButton">
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={updateTaskInfo}>Update</Button>
      </div>
    </div>
  );
};

export default TaskAccordion;
