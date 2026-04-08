import {
  Autocomplete,
  Drawer,
  TextField,
  Divider,
  Button,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import React, { useEffect, useState, useContext } from "react";
import {
  completeWorkOrder,
  fetchWorkOrderStepTasks,
  fetchWorkOrderStepWithWOIdAndGuideStepId,
  workOrderStepCapturedTime,
  workOrderStepComplete,
  updatePictureTaskImage,
  deletePictureTaskImage,
} from "../../services/WOrderService";
import MaskLoader from "../MaskLoader/MaskLoader";
import {
  fetchSerialNumberWithkitId,
  updateSerialNumbersStatusToComsumed,
} from "../../services/childKitService";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { AlertsContext } from "../AlertsContext/Context";
import CameraComponent from "../materialKits/CameraComponent";
import GenealogyResponseDrawer from "./genealogyResponseDrawer";
import ConfirmationBox from "../Confirmation Box/Confirmation";
import { fetchGuideStepTaskWithStepId } from "../../services/guideTaskService";
import {
  completeWorkOrderTask,
  resetWorkorderStep,
  fetchWorkOrderTaskByStepId,
} from "../../services/WorkOrderStepService";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useUserContext } from "../userContext/UserContext";
import "./workOrder.css";
import { PERMISSIONS } from "../../constants/PagePermissions";

const SubWorkOrderStepDetails = ({
  kitId,
  stepId,
  timerRunning,
  timeElapsed,
  fetchWorkOrderData,
  stepsData,
  selectedStepData,
  fetchWorkOrderGuideStepsData,
  workOrderId,
  workOrderData,
  openKitDataDrawer,
  pauserTimer,
  setIsWorkOrderReset,
  isWorkOrderReset,
}) => {
  const { hasPermission } = useUserContext();
  const [completeWorkOrderStep, setCompleteWorkOrderStep] = useState(false);
  const [stepComments, setStepComments] = useState("");
  const [addCommentsSectionOpen, setAddCommentsSectionOpen] = useState(false);
  const { Alert } = useContext(AlertsContext);
  const [taskData, setTaskData] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const workOrderStepId = selectedStepData?.workOrderStepId;
  const highestStep = stepsData ? stepsData[stepsData.length - 1] : null;
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);
  const [loadingStepData, setLoadingStepData] = useState(true);
  const [childKitGenealogyData, setChildKitGenealogyData] = useState(null);
  const [genealogyCount, setGenealogyCount] = useState(0);
  const [genealogyDrawerOpen, setGenealogyDrawerOpen] = useState(false);
  const [workOrderStepData, setWorkOrderStepData] = useState(null);
  const [previousStepStatus, setPreviousStepStatus] = useState();
  const [pictureTaskModal, setPictureTaskModal] = useState(false);

  const toggleModal = () => setPictureTaskModal(!pictureTaskModal);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      updateCapturedTimeOnTaskComplete();
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [timeElapsed, workOrderStepId]);

  useEffect(() => {
    if (stepComments) {
      setWorkOrderStepData((prevData) => ({
        ...prevData,
        comment: stepComments,
      }));
    }
  }, [stepComments]);

  useEffect(() => {
    const fetchWorkOrderStepData = async () => {
      if (workOrderId && selectedStepData?.id) {
        try {
          const data = await fetchWorkOrderStepWithWOIdAndGuideStepId(
            workOrderId,
            selectedStepData.id
          );
          setWorkOrderStepData(data);
        } catch (error) {
          console.error("Error fetching work order step data:", error);
        }
      }
    };
    fetchWorkOrderStepData();
  }, [workOrderId, selectedStepData]);

  useEffect(() => {
    if (stepId) {
      fetchWorkOrderStepTaskDetails();
    }
  }, [stepId]);

  useEffect(() => {
    if (kitId) {
      fetchChildKitGenealogy();
    }
  }, [kitId, openKitDataDrawer]);

  const handleResetStep = async () => {
    if (workOrderData.status === "Completed") {
      Alert(
        "You cannot reset this work order as it has already been completed.",
        "warning"
      );
      return;
    }
    setLoadingStepData(true);

    try {
      await resetWorkorderStep(workOrderStepId);
      pauserTimer();
      await fetchWorkOrderStepTaskDetails();
      await fetchWorkOrderData();
      await fetchWorkOrderGuideStepsData();
      Alert("Step reset successfully..!", "success");
    } catch (error) {
      console.error("Error resetting step: ", error);
      Alert("Failed to reset step. Please try again..!", "error");
    } finally {
      setLoadingStepData(false);
    }
  };

  const fetchChildKitGenealogy = async () => {
    setLoadingStepData(true);
    try {
      const data = await fetchSerialNumberWithkitId(kitId);
      if (data) {
        setChildKitGenealogyData(data);
      }
    } catch (error) {
      Alert("Error Fetching Child Kit Genealogy", "error");
      console.error("Error Fetching Child Kit Genealogy", error);
    } finally {
      setLoadingStepData(false);
    }
  };

  useEffect(() => {
    if (isWorkOrderReset) {
      fetchWorkOrderStepTaskDetails();
      setIsWorkOrderReset(false);
    }
  }, [isWorkOrderReset]);

  const fetchWorkOrderStepTaskDetails = async () => {
    setLoadingStepData(true);
    try {
      const guideTaskData = await fetchGuideStepTaskWithStepId(stepId);
      const workOrderTaskData = await fetchWorkOrderTaskByStepId(
        workOrderStepId
      );

      if (guideTaskData && workOrderTaskData) {
        guideTaskData.sort((a, b) => a.sequence - b.sequence);

        const updatedData = guideTaskData.map((gTask) => {
          let taskDetails = gTask.taskdetails
            ? JSON.parse(gTask.taskdetails)
            : {};

          const correspondingWorkOrderTask = workOrderTaskData.find(
            (workOrderTask) =>
              workOrderTask.guideStepTaskId === gTask.id &&
              workOrderTask.workOrderId === workOrderId
          );

          if (correspondingWorkOrderTask) {
            const taskResponse = correspondingWorkOrderTask.taskResponse
              ? JSON.parse(correspondingWorkOrderTask.taskResponse)
              : null;

            if (taskResponse?.picture?.response) {
              taskDetails.picture = {
                ...taskDetails.picture,
                response: taskResponse.picture.response,
              };
            }

            if (taskResponse?.dataType) {
              if (taskResponse.dataType.radio) {
                taskDetails.dataType = {
                  ...taskDetails.dataType,
                  radio: taskResponse.dataType.radio,
                };
              }
              if (taskResponse.dataType.list) {
                taskDetails.dataType = {
                  ...taskDetails.dataType,
                  list: taskResponse.dataType.list,
                };
              }
            }

            return {
              ...gTask,
              WOtaskDetails: taskDetails,
              workOrderTaskId: correspondingWorkOrderTask.id,
              status: correspondingWorkOrderTask.status,
            };
          } else {
            if (gTask.type === "Genealogy") {
              const genealogyQuantity =
                parseInt(taskDetails.genealogy?.genealogy?.quantity, 10) || 0;

              const value = Array(genealogyQuantity)
                .fill(null)
                .map(() => ({ id: "", serialno: "" }));

              taskDetails = {
                ...taskDetails,
                genealogy: { ...taskDetails.genealogy, value },
              };
            }

            return {
              ...gTask,
              WOtaskDetails: taskDetails,
              status: "UnCompleted",
            };
          }
        });

        setTaskData(updatedData);
        setTaskProgress(
          updatedData.filter((item) => item.status === "Completed").length
        );
      }
    } catch (error) {
      Alert("Error Fetching Work Order Task Details", "error");
      console.error("Error Fetching Work Order Task Details", error);
    } finally {
      setLoadingStepData(false);
    }
  };

  const handleRadioChange = (taskId, selectedIndex) => {
    setTaskData((prevTaskData) =>
      prevTaskData.map((task) =>
        task.workOrderTaskId === taskId
          ? {
              ...task,
              WOtaskDetails: {
                ...task.WOtaskDetails,
                dataType: {
                  ...task.WOtaskDetails.dataType,
                  radio: task.WOtaskDetails.dataType.radio.map(
                    (option, index) => ({
                      ...option,
                      value: index === selectedIndex ? "checked" : "unChecked",
                    })
                  ),
                },
              },
            }
          : task
      )
    );
  };

  const handleCheckboxChange = (event, taskId, optionIndex) => {
    setTaskData((prevTaskData) =>
      prevTaskData.map((task) =>
        task.workOrderTaskId === taskId
          ? {
              ...task,
              WOtaskDetails: {
                ...task.WOtaskDetails,
                dataType: {
                  ...task.WOtaskDetails.dataType,
                  list: task.WOtaskDetails.dataType.list.map((option, index) =>
                    index === optionIndex
                      ? {
                          ...option,
                          value: event.target.checked ? "checked" : "unChecked",
                        }
                      : option
                  ),
                },
              },
            }
          : task
      )
    );
  };

  const handleDeleteImage = async (item) => {
    setLoadingStepData(true);
    try {
      await deletePictureTaskImage(item.workOrderTaskId);
      Alert("Image deleted successfully", "success");
      fetchWorkOrderStepTaskDetails();
    } catch (error) {
      Alert("Couldn't delete image", "error");
      console.error("Error deleting image:", error);
    } finally {
      setLoadingStepData(false);
    }
  };

  const handleUpdateCompletedPictureTask = async (item, formData) => {
    setLoadingStepData(true);

    try {
      const data = await updatePictureTaskImage(item.workOrderTaskId, formData);

      Alert("Task Image Updated Successfully...", "success");
      fetchWorkOrderStepTaskDetails();
      return data;
    } catch (error) {
      Alert("Couldn't Update Task Image", "error");
      console.error("Error updating image:", error);
    } finally {
      setLoadingStepData(false);
    }
  };

  useEffect(() => {
    const validatePreviousStep = async () => {
      if (!stepsData || !stepId) return;

      const presentStepSequence = stepsData.find(
        (step) => step.id === stepId
      )?.sequence;

      if (presentStepSequence > 1) {
        setLoadingStepData(true);

        const previousStepId = stepsData.find(
          (step) => step.sequence === presentStepSequence - 1
        )?.id;

        try {
          const previousStepStatusResponse =
            await fetchWorkOrderStepWithWOIdAndGuideStepId(
              workOrderId,
              previousStepId
            );

          setPreviousStepStatus(previousStepStatusResponse?.status);
        } catch (error) {
          console.error("Error fetching previous step status:", error);
          Alert("Failed to validate the previous step.", "error");
        } finally {
          setLoadingStepData(false);
        }
      }
    };

    validatePreviousStep();
  }, [stepsData, stepId, workOrderId]);

  const handleCompleteTask = async (item, formData) => {
    if (!workOrderData.kit) {
      Alert("Kit is not assigned to this WorkOrder...Please assign", "error");
      return;
    } else if (!workOrderData.manager) {
      Alert("Manager is not assigned...Please assign", "error");
      return;
    } else if (!workOrderData.technician) {
      Alert("Technician is not assigned...Please assign", "error");
      return;
    }
    if (!timerRunning) {
      Alert("Enable the Timer..!", "error");
      return;
    }

    if (previousStepStatus !== "Completed" && selectedStepData.sequence !== 1) {
      setLoadingStepData(false);
      Alert("The Previous Step is not Completed Yet..", "error");
      return;
    }

    const taskDetails = item.WOtaskDetails;
    if (taskDetails?.genealogy) {
      const hasEmptyFields = taskDetails.genealogy.value.some(
        (obj) => !obj.id || !obj.serialno
      );
      if (hasEmptyFields) {
        Alert("Select all the Serial Numbers to Complete this Task.", "error");
        return;
      }
    }
    if (taskDetails?.dataType?.radio) {
      const radioCompleted = taskDetails?.dataType.radio.some(
        (option) => option.value === "checked"
      );
      if (!radioCompleted) {
        Alert("Please select an option for the task to complete it.", "error");
        return;
      }
    }

    if (taskDetails?.dataType?.list) {
      const listCompleted = taskDetails.dataType.list.some(
        (option) => option.value === "checked"
      );
      if (!listCompleted) {
        Alert(
          "Please select at least one option to complete the task.",
          "error"
        );
        return;
      }
    }

    try {
      setLoadingStepData(true);
      if (taskDetails?.genealogy) {
        const serialNumberIds = taskDetails.genealogy.value.map(
          (obj) => obj.id
        );
        try {
          await updateSerialNumbersStatusToComsumed(serialNumberIds);
          fetchChildKitGenealogy();
        } catch (error) {
          Alert("Couldn't Update the status of Kit Serial", "error");
          console.error(error);
        }
      }

      await completeWorkOrderTask(
        item.workOrderTaskId,
        JSON.stringify(taskDetails)
      );

      Alert("Task Completed Successfully...", "success");
      await updateCapturedTimeOnTaskComplete();
      fetchWorkOrderStepTaskDetails();
    } catch (error) {
      Alert("Couldn't Complete Task...", "error");
      console.error(error);
    } finally {
      setLoadingStepData(false);
    }
  };

  const updateCapturedTimeOnTaskComplete = async () => {
    setLoadingStepData(true);
    try {
      const response = await workOrderStepCapturedTime(
        workOrderStepId,
        timeElapsed
      );
    } catch (error) {
      Alert("Couldn't Update the Time", "error");
      console.error("Error capturing time for step:", error);
    } finally {
      setLoadingStepData(false);
    }
  };

  const handleCaptureImage = async (input) => {
    try {
      setCameraOpen(false);
      setLoadingStepData(true);
      let file;
      if (typeof input === "string") {
        const blob = await (await fetch(input)).blob();
        file = new File([blob], "captured-image.jpg", {
          type: "image/jpeg",
        });
      } else {
        file = input;
      }
      const formData = new FormData();
      formData.append("ImageFile", file);
      formData.append("ImageType", "WorkOrderTask");
      const selectedTask = taskData.find(
        (item) => item.workOrderTaskId === selectedTaskId
      );
      if (!selectedTask) {
        Alert("Selected task not found", "error");
        return;
      }
      await handleUpdateCompletedPictureTask(selectedTask, formData);
    } catch (error) {
      Alert("Error processing the task", "error");
      console.error("Error capturing image:", error);
    } finally {
      setLoadingStepData(false);
    }
  };

  const [stepCompleteLoading, setStepCompleteLoading] = useState(false);

  const handleCompleteStepBtn = async () => {
    if (!timerRunning) {
      Alert("Enable the Timer..!", "error");
      return;
    }

    const mandatoryTasks = taskData.filter((item) => item.ismandatory === 1);
    const tasksCompleted = taskData.filter(
      (item) => item.status === "Completed"
    );

    const mandatoryTasksCompleted = mandatoryTasks.every(
      (item) => item.status === "Completed"
    );

    if (mandatoryTasksCompleted && tasksCompleted.length > 0) {
      setAddCommentsSectionOpen(true);
      setCompleteWorkOrderStep(true);

      try {
        await workOrderStepComplete(workOrderStepId, stepComments);
        const presentStep = stepsData.find(
          (item) => item.id === workOrderStepId
        );

        if (presentStep) {
          fetchWorkOrderGuideStepsData(presentStep.id);
        }
      } catch (error) {
        console.error("Error completing work order step:", error);
      }
    } else {
      Alert("Complete all the Mandatory Tasks !!", "error");
    }
  };

  const handleCompleteStepFinal = async () => {
    setAddCommentsSectionOpen(false);
    setStepCompleteLoading(true);

    try {
      await workOrderStepComplete(workOrderStepId, stepComments);

      const lastStep = stepsData.find(
        (item) => item.workOrderStepId === workOrderStepId
      );

      if (lastStep.sequence === highestStep.sequence) {
        await completeWorkOrder(workOrderId);
        fetchWorkOrderData();
      }

      await updateCapturedTimeOnTaskComplete();

      const presentStep = stepsData.find((item) => item.id === stepId);
      fetchWorkOrderGuideStepsData(presentStep.id);
      Alert("Step Completed Successfully..!", "success");
    } catch (error) {
      console.error("Error completing step:", error);
    } finally {
      setStepCompleteLoading(false);
    }
  };

  const maxValue = taskData.length;
  const tasksCompletedPercentage = (taskProgress / maxValue) * 100;
  const handleSelectionChange = (taskId, index, newValue) => {
    setTaskData((prevTaskData) =>
      prevTaskData.map((task) =>
        task.id === taskId
          ? {
              ...task,
              WOtaskDetails: {
                ...task.WOtaskDetails,
                genealogy: {
                  ...task.WOtaskDetails.genealogy,
                  value: [
                    ...task.WOtaskDetails.genealogy.value.slice(0, index),
                    newValue
                      ? { id: newValue.id, serialno: newValue.serialno }
                      : { id: "", serialno: "" },
                    ...task.WOtaskDetails.genealogy.value.slice(index + 1),
                  ],
                },
              },
            }
          : task
      )
    );
  };
  const getFilteredOptions = (options, taskId) => {
    const selectedValues = (
      taskData.find((task) => task.id === taskId)?.WOtaskDetails?.genealogy
        ?.value || []
    ).map((value) => value.serialno);
    return options.filter(
      (option) => !selectedValues.includes(option.serialno)
    );
  };

  return (
    <div className="WorkOrderStepDetails">
      <div className="WoStepsHeader">
        <h2>Tasks :</h2>
        <div className="WOLinearProgressBar">
          <div className="WOStepResetButton">
            <ion-icon
              name="refresh-circle"
              title="Reset Step"
              onClick={() => {
                if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
                handleResetStep();
              }}
              class={
                !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                  ? "IonIconDisabled"
                  : undefined
              }
            />
          </div>
          <LinearProgress
            variant="determinate"
            className="WOLinearProgress"
            value={tasksCompletedPercentage}
            title={`${tasksCompletedPercentage}% Completed`}
          />
        </div>
      </div>
      <Divider orientation="horizontal" className="HorizontalDivider" />
      {loadingStepData ? (
        <div className="WorkOrderStepDetailsLoader">
          <Cliploader loading={loadingStepData} />
        </div>
      ) : (
        <div
          className={
            workOrderStepData?.comment ? "WoTasksBodycomments" : "WoTasksBody"
          }
        >
          {taskData.length >= 1 ? (
            taskData.map((item, index) => (
              <div className="WOTasksListMain" key={item.id}>
                <p className="WOTaskType">
                  {item?.WOtaskDetails && (
                    <p className="WoTaskTypeInList">
                      {item.WOtaskDetails.dataType && (
                        <>
                          <ion-icon name="document-outline"></ion-icon>
                        </>
                      )}
                      {item.WOtaskDetails.assembly && (
                        <>
                          <ion-icon name="hammer-outline"></ion-icon>
                        </>
                      )}
                      {item.WOtaskDetails.test && (
                        <>
                          <ion-icon name="document-text-outline"></ion-icon>
                        </>
                      )}
                      {item.WOtaskDetails.picture && (
                        <>
                          <ion-icon name="camera-outline"></ion-icon>
                        </>
                      )}
                      {item.WOtaskDetails.genealogy && (
                        <>
                          <ion-icon name="briefcase-outline"></ion-icon>
                        </>
                      )}
                    </p>
                  )}
                </p>
                <div className="WotaskDescription">
                  <p
                    className={
                      item.status === "Completed"
                        ? "DescriptionCompleted"
                        : "Description"
                    }
                  >
                    {item.description}
                  </p>
                  <p className="DataTypeOptions">
                    {item?.WOtaskDetails?.dataType?.radio ? (
                      item?.WOtaskDetails?.dataType?.radio.map(
                        (option, index) => (
                          <label
                            className="WoTaskOptions"
                            htmlFor={index}
                            key={index}
                          >
                            <input
                              type="radio"
                              disabled={item.status === "Completed"}
                              checked={option.value === "checked"}
                              onChange={() =>
                                handleRadioChange(item.workOrderTaskId, index)
                              }
                            />
                            <p>{option.name}</p>
                          </label>
                        )
                      )
                    ) : item?.WOtaskDetails?.dataType?.list ? (
                      item?.WOtaskDetails?.dataType?.list.map(
                        (option, index) => (
                          <label key={index} className="WoTaskOptions">
                            <input
                              type="checkbox"
                              value={index}
                              disabled={item.status === "Completed"}
                              checked={option.value === "checked"}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  e,
                                  item.workOrderTaskId,
                                  index
                                )
                              }
                            />
                            {option.name}
                          </label>
                        )
                      )
                    ) : item?.WOtaskDetails?.picture?.response ? (
                      <div>
                        <img
                          className="TaskTypePicture"
                          src={item?.WOtaskDetails?.picture?.response?.filePath}
                          alt="Uploaded Image"
                          onClick={toggleModal}
                        />
                        {pictureTaskModal && (
                          <div
                            className="pictureTaskModalOverlay"
                            onClick={toggleModal}
                          >
                            <img
                              src={
                                item?.WOtaskDetails?.picture?.response?.filePath
                              }
                              alt="Fullscreen Image"
                              className="pictureTaskModalImage"
                            />
                          </div>
                        )}
                      </div>
                    ) : item?.WOtaskDetails?.genealogy?.genealogy &&
                      item?.WOtaskDetails?.genealogy?.value.length > 0 ? (
                      <div className="GenealogyResponse">
                        <Autocomplete
                          options={getFilteredOptions(
                            childKitGenealogyData?.filter(
                              (option) =>
                                option.partId ===
                                  item.WOtaskDetails?.genealogy?.genealogy
                                    ?.id && option.status === "Unconsumed"
                            ) || [],
                            item.id
                          )}
                          disabled={item.status === "Completed"}
                          fullWidth
                          getOptionLabel={(option) =>
                            option.serialno ? option.serialno : ""
                          }
                          value={
                            item?.WOtaskDetails?.genealogy?.value[0] || null
                          }
                          onChange={(event, newValue) =>
                            handleSelectionChange(item.id, 0, newValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={`Genealogy ${index + 1}`}
                            />
                          )}
                        />
                        {item?.WOtaskDetails?.genealogy?.genealogy?.quantity >
                        1 ? (
                          <p
                            onClick={() => {
                              setGenealogyDrawerOpen(true);
                              setSelectedTaskId(item.workOrderTaskId);
                              setSelectedTask(item);
                              setGenealogyCount(
                                item?.WOtaskDetails?.genealogy?.genealogy
                                  ?.quantity - 1
                              );
                            }}
                          >
                            +
                            {item?.WOtaskDetails?.genealogy?.genealogy
                              ?.quantity - 1}{" "}
                            More
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </p>
                </div>
                <div className="taskControls">
                  {workOrderStepData?.status !== "Completed" &&
                    item?.WOtaskDetails?.picture && (
                      <div className="PictureTaskControls">
                        <input
                          type="file"
                          style={{ display: "none" }}
                          id={`upload-input-${item.id}`}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleCaptureImage(file);
                            }
                          }}
                          accept="image/*"
                        />
                        <ion-icon
                          class={
                            !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                              ? "IonIconDisabled"
                              : undefined
                          }
                          name="share-outline"
                          title="Upload Image"
                          onClick={() => {
                            if (!timerRunning) {
                              Alert("Enable the Timer..!", "error");
                              return;
                            }
                            if (
                              previousStepStatus !== "Completed" &&
                              selectedStepData.sequence !== 1
                            ) {
                              setLoadingStepData(false);
                              Alert(
                                "The Previous Step is not Completed Yet..",
                                "error"
                              );
                              return;
                            }
                            setSelectedTaskId(item.workOrderTaskId);
                            document
                              .getElementById(`upload-input-${item.id}`)
                              .click();
                          }}
                        ></ion-icon>

                        <ion-icon
                          class={
                            !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                              ? "IonIconDisabled"
                              : undefined
                          }
                          name={
                            item?.WOtaskDetails?.picture?.response
                              ? "refresh-outline"
                              : "camera-outline"
                          }
                          title={
                            item?.WOtaskDetails?.picture?.response
                              ? "Retake Image"
                              : "Capture Image"
                          }
                          onClick={() => {
                            if (!timerRunning) {
                              Alert("Enable the Timer..!", "error");
                              return;
                            }
                            if (
                              previousStepStatus !== "Completed" &&
                              selectedStepData.sequence !== 1
                            ) {
                              setLoadingStepData(false);
                              Alert(
                                "The Previous Step is not Completed Yet..",
                                "error"
                              );
                              return;
                            }
                            setSelectedTaskId(item.workOrderTaskId);
                            setCameraOpen(true);
                          }}
                        ></ion-icon>
                        {item?.WOtaskDetails?.picture?.response && (
                          <ion-icon
                            class={
                              !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                                ? "IonIconDisabled"
                                : undefined
                            }
                            name="trash-outline"
                            title="Delete Image"
                            onClick={() => {
                              if (!timerRunning) {
                                Alert("Enable the Timer..!", "error");
                                return;
                              }
                              handleDeleteImage(item);
                            }}
                          ></ion-icon>
                        )}
                      </div>
                    )}
                  {cameraOpen && (
                    <CameraComponent
                      onSave={handleCaptureImage}
                      onClose={() => setCameraOpen(false)}
                    />
                  )}
                  {item?.ismandatory === 1 && (
                    <p className="TaskBehaviour">
                      <ion-icon
                        name="star-outline"
                        title="Mandatory Task"
                        className="TaskBehaviour"
                      ></ion-icon>
                    </p>
                  )}
                  <p
                    className={
                      item.status === "Completed"
                        ? "WOTaskApproved"
                        : "WOTaskApprove"
                    }
                    onClick={() => {
                      if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
                      if (item.status === "Completed") {
                        Alert(
                          "The Task is Already Completed.. Thanks",
                          "success"
                        );
                      } else if (item.type === "Picture") {
                        Alert("Attach an Image to complete this task", "error");
                      } else {
                        handleCompleteTask(item);
                      }
                    }}
                  >
                    <ion-icon
                      class={
                        !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                          ? "IonIconDisabled"
                          : undefined
                      }
                      title={
                        item.status === "Completed"
                          ? "Task Completed"
                          : "Complete Task"
                      }
                      disabled={loadingStepData}
                      name={
                        item.status === "Completed"
                          ? "checkmark-circle-outline"
                          : "ellipse-outline"
                      }
                    ></ion-icon>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="TaskNotAvailableMsg">No Tasks Available</p>
          )}
        </div>
      )}
      {workOrderStepData?.comment && (
        <div className="CommentSection">
          <p className="CommentSectionheader">Comments:</p>
          <p className="CommentsDescription">{workOrderStepData.comment}</p>
        </div>
      )}

      <div className="WOStepDetailsFooter">
        {selectedStepData?.status === "Completed" ? (
          <p className="STepCompletedNote">
            Step Completed
            <ion-icon name="checkmark-done-outline"></ion-icon>
          </p>
        ) : (
          <div className="button-container">
            {hasPermission(PERMISSIONS.WORKORDERS.MODIFY) && (
              <Button
                className="completeStepBtn"
                onClick={() => {
                  handleCompleteStepBtn();
                }}
                disabled={!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)}
              >
                Complete Step
              </Button>
            )}
          </div>
        )}{" "}
      </div>
      <div className="AlertMessages">
        <HomeAlerts />
      </div>
      <Drawer
        anchor="right"
        open={genealogyDrawerOpen}
        onClose={() => setGenealogyDrawerOpen(false)}
        PaperProps={{
          className: "DrawerStyles",
        }}
      >
        <GenealogyResponseDrawer
          genealogyCount={genealogyCount}
          childKitGenealogyData={childKitGenealogyData}
          setGenealogyDrawerOpen={setGenealogyDrawerOpen}
          taskData={taskData}
          selectedTaskData={selectedTask}
          handleSelectionChange={handleSelectionChange}
          getFilteredOptions={getFilteredOptions}
        />
      </Drawer>
      <ConfirmationBox
        isOpen={addCommentsSectionOpen}
        onClose={() => setAddCommentsSectionOpen(false)}
        onConfirm={handleCompleteStepFinal}
        setStepComments={setStepComments}
        stepComments={stepComments}
        completeWorkOrderStep={completeWorkOrderStep}
      />
      {stepCompleteLoading && <MaskLoader message="Completing Step" />}
    </div>
  );
};

export default SubWorkOrderStepDetails;
