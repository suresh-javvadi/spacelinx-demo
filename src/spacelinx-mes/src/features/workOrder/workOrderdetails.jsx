import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  resetWorkorder,
  fetchWorkOrderDetailsById,
} from "../../services/WOrderService";
import SubWorkOrderStepDetails from "./WorkOrderStepDetails";
import { Divider, Drawer } from "@mui/material";
import WorkOrderStepMBom from "./workOrderStepMBom";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import { fetchGuideStepWithGuideId } from "../../services/guideStepService";
import ChildKitData from "../materialKits/ChildKitData";
import { fetchKitWithId } from "../../services/materialKitService";
import { startWorkOrder } from "../../services/WOrderService";
import { fetchWorkOrderStepsWithId } from "../../services/WorkOrderStepService";
import { useTheme } from "@mui/material/styles";
import noImageSmallDark from "../../Assest/Images/noimagesmall/noimagedark.png";
import noImageSmallLight from "../../Assest/Images/noimagesmall/noimagelightmode.png";
import noImageLargeDark from "../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noImageLargeLight from "../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import { useDrawer } from "../../useDrawerHook";
import { useReactToPrint } from "react-to-print";
import PrintWorkOrder from "./PrintWorkOrder";
import Cliploader from "../../Components/Loaders/Cliploader";
import { useUserContext } from "../userContext/UserContext";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import { PERMISSIONS } from "../../constants/PagePermissions";

const WorkOrderDetails = () => {
  const { hasPermission } = useUserContext();
  const printRef = useRef();
  const { workOrderId } = useParams();
  const [stepsData, setStepsData] = useState();
  const [selectedStepData, setSelectedStepData] = useState(null);
  const [loadingStepData, setLoadingStepData] = useState(true);
  const [subWorkOrderData, setSubWorkOrderData] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [workOrderTime, setWorkOrderTime] = useState(0);
  const [guideId, setGuideId] = useState();
  const { Alert } = useContext(AlertsContext);
  const [equipmentDrawerOpen, setEquipmentDrawerOpen] = useState(false);
  const [mBOMDrawerOpen, setMBOMDrawerOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [openKitDataDrawer, setOpenKitDataDrawer] = useState(false);
  const [selectedKitData, setSelectedKitData] = useState(null);
  const [printData, setPrintData] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDrawerOpen } = useDrawer();
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const [isWorkOrderReset, setIsWorkOrderReset] = useState(false);

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderData();
    }
  }, [workOrderId]);

  const handleprint = useReactToPrint({
    content: () => printRef.current,
  });

  const fetchPrintData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchWorkOrderDetailsById(workOrderId);
      if (data) {
        setPrintData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (printData) {
      handleprint();
    }
  }, [printData]);

  const fetchAndPrintData = async () => {
    try {
      await fetchPrintData();
    } catch (error) {
      console.error("Error fetching Workorder data", error);
    }
  };

  const fetchWorkOrderData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchWorkOrderDetailsById(workOrderId);
      setGuideId(data.guideId);
      setSubWorkOrderData(data);

      if (!data.technician) {
        Alert("No technician assigned to this work order", "error");
        navigate(`/WorkOrders/${data.workPackageId}/WorkOrders`);
      }
    } catch (error) {
      Alert("Error Fetching Sub Work Order Data", "error");
      console.error("Error fetching sub work order data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const fetchKitData = async () => {
      if (subWorkOrderData?.kitId) {
        setLoadingData(true);
        try {
          const data = await fetchKitWithId(subWorkOrderData.kitId);
          setSelectedKitData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingData(false);
        }
      }
    };
    fetchKitData();
  }, [subWorkOrderData?.kitId]);

  useEffect(() => {
    if (guideId) {
      fetchWorkOrderGuideStepsData();
    }
  }, [guideId]);
  const fetchWorkOrderGuideStepsData = async (stepId) => {
    setLoadingData(true);
    const presentStepId = stepId;
    try {
      const guideStepsData = await fetchGuideStepWithGuideId(guideId);
      const workOrderStepData = await fetchWorkOrderStepsWithId(workOrderId);
      if (guideStepsData && workOrderStepData) {
        const updatedData = guideStepsData.map((gTask) => {
          const matchedData = workOrderStepData.find(
            (item) =>
              item.guideStepId === gTask.id && item.workOrderId === workOrderId
          );
          return {
            ...gTask,
            workOrderStepId: matchedData ? matchedData.id : null,
            capturedTime: matchedData ? matchedData.capturedTime : null,
            executionTime: matchedData ? matchedData.executionTime : null,
            status: matchedData ? matchedData.status : "Pending",
          };
        });
        setLoadingStepData(false);
        const sortedData = updatedData.sort((a, b) => a.sequence - b.sequence);
        setStepsData(sortedData);
        setSelectedStepData(
          sortedData
            .filter((item) => item.status === "Completed")
            .slice(-1)[0] || sortedData[0]
        );

        const totalCapturedTime = sortedData.reduce(
          (sum, item) =>
            sum + convertTimeToSeconds(item.capturedTime || "00:00:00"),
          0
        );
        setWorkOrderTime(totalCapturedTime);
      }
    } catch (error) {
      Alert("Error Fetching Work Order Guide Steps Data", "error");
      console.error("Error fetching work order guide steps data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const stopTimer = () => {
    setTimerRunning(false);
    setTimeElapsed(0);
  };

  const startTimer = () => {
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const convertTimeToSeconds = (time) => {
    if (!time) return 0;
    const [hours, minutes, seconds] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    let timerInterval;
    if (timerRunning) {
      timerInterval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
        setWorkOrderTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [timerRunning]);

  const selectedStepId = selectedStepData?.id;
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (selectedStepId) {
      positionTheStep();
    }
  }, [selectedStepId]);

  const positionTheStep = () => {
    const container = document.querySelector(".WOStepsScrollContainer");
    const selectedStep = document.getElementById(selectedStepId);

    if (container && selectedStep) {
      const containerRect = container.getBoundingClientRect();
      const selectedStepRect = selectedStep.getBoundingClientRect();
      const scrollOffset = selectedStepRect.left - containerRect.left;
      const scrollLeft = container.scrollLeft + scrollOffset;
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
      setScrollPosition(scrollLeft);
    }
  };

  useEffect(() => {
    const container = document.querySelector(".WOStepsScrollContainer");
  }, [scrollPosition]);
  const handleStepSelection = (step) => {
    setSelectedStepData(step);
    setTimeElapsed(convertTimeToSeconds(step?.capturedTime || "00:00:00"));
  };

  const handleResetWorkorder = async () => {
    if (subWorkOrderData.status === "Completed") {
      Alert(
        "You cannot reset this work order as it has already been completed.",
        "warning"
      );
      return;
    }
    setLoadingStepData(true);

    try {
      await resetWorkorder(workOrderId);
      pauseTimer();
      await fetchWorkOrderGuideStepsData();
      setIsWorkOrderReset(true);
      Alert("Work Order Reset Successfully..!", "success");
    } catch (error) {
      console.error("Error resetting step: ", error);
      Alert("Failed to Reset Work Order. Please try again..!", "error");
    } finally {
      setLoadingStepData(false);
    }
  };

  return (
    <div className="WorkOrderStepInfo">
      <div className="WODetailsBreadCrumb">
        <Link
          className="WorkOrderBreadCrumb"
          to={`/WorkOrders`}
          style={{ marginRight: "5px" }}
        >
          Work Orders
        </Link>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <Link
          className="WorkOrderBreadCrumb"
          to={`/WorkOrders/${subWorkOrderData?.workPackageId}/WorkOrders`}
          style={{ marginRight: "5px" }}
        >
          Work Orders
        </Link>
        <ion-icon name="chevron-forward-outline"></ion-icon>
        <p className="stepDetailBreadCrumb"> {subWorkOrderData?.number}</p>
        <button
          className="GuideControlButton guides-button"
          onClick={() => {
            if (!hasPermission(PERMISSIONS.WORKORDERS.PRINT)) {
              Alert(
                "You do not have permission to print Work Orders.",
                "warning"
              );
              return;
            }

            if (subWorkOrderData?.status !== "Completed") {
              Alert(
                "Cannot print, The Work Order is not yet completed",
                "error"
              );
              return;
            }

            fetchAndPrintData();
          }}
        >
          Print
          <ion-icon name="print-outline" title="Print"></ion-icon>
        </button>
      </div>
      <div className="WODetailsHeader">
        <div className="WoTimerDiv">
          <>
            {timerRunning ? (
              <button className="guides-button">
                <ion-icon
                  name="pause-circle"
                  title="Pause"
                  onClick={() => {
                    if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
                    pauseTimer();
                  }}
                  class={
                    !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                      ? "IonIconDisabled"
                      : undefined
                  }
                ></ion-icon>
              </button>
            ) : (
              <ion-icon
                name="play-circle"
                title="Start"
                onClick={() => {
                  if (selectedStepData?.status === "Completed") {
                    Alert("The Step Is Already Completed", "success");
                  } else {
                    if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
                    startTimer();
                    if (workOrderTime === 0) {
                      startWorkOrder(workOrderId);
                    }
                  }
                }}
                class={
                  !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                    ? "IonIconDisabled"
                    : undefined
                }
              ></ion-icon>
            )}

            {timerRunning && (
              <ion-icon
                name="stop-circle"
                title="Stop"
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
                  stopTimer();
                }}
              ></ion-icon>
            )}

            {workOrderTime !== 0 && (
              <ion-icon
                name="refresh-circle"
                title="Reset Work Order"
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.WORKORDERS.MODIFY)) return;
                  handleResetWorkorder();
                }}
                class={
                  !hasPermission(PERMISSIONS.WORKORDERS.MODIFY)
                    ? "IonIconDisabled"
                    : undefined
                }
              ></ion-icon>
            )}
          </>

          <p className="workorder-content">{formatTime(workOrderTime)}</p>
        </div>

        <Divider orientation="vertical" flexItem />
        <div className="WOName">
          <h2>WO Name :</h2>
          <p>{subWorkOrderData?.name}</p>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="WOName">
          <h2>Part :</h2>
          <p
            title={`${subWorkOrderData?.part?.partNumber} / ${subWorkOrderData?.part?.name}`}
            className="AppHyperLink"
            onClick={(e) => {
              e.stopPropagation();
              if (!hasPermission(PERMISSIONS.PARTS.VIEW)) {
                Alert("You do not have permission to view Parts.", "warning");
                return;
              }
              if (subWorkOrderData?.part) {
                openPartDetailsDrawer(subWorkOrderData.part);
              }
            }}
          >
            {subWorkOrderData?.part?.partNumber}/{subWorkOrderData?.part?.name}
          </p>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="WOStepsCompleted">
          <h2>Status :</h2>
          <p>{subWorkOrderData?.status}</p>
        </div>
        <Divider orientation="vertical" flexItem />
        <div>
          <h2>Product: </h2>
          {"  "} <p>{subWorkOrderData?.product?.name || "NA"}</p>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="AppHyperLink">
          <p
            onClick={() => {
              if (!hasPermission(PERMISSIONS.MATERIALKITS.VIEW)) {
                Alert("You do not have permission to view Kits.", "warning");
                return;
              }
              setOpenKitDataDrawer(true);
            }}
          >
            {subWorkOrderData?.kit?.number}
          </p>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="WOStepsCompleted">
          <h2>Steps Completed :</h2>
          <p>
            {stepsData?.filter((item) => item.status === "Completed")?.length}/
            {stepsData?.length}
          </p>
        </div>
      </div>
      <div className="WOStepsSection">
        <div className="WOStepsInfo">
          <button
            className="WOStepsInfoSideButtons"
            onClick={() => {
              const container = document.querySelector(
                ".WOStepsScrollContainer"
              );
              container.scrollLeft -= 100;
            }}
          >
            <ion-icon name="chevron-back-outline"></ion-icon>
          </button>
          <div className="WOStepsScrollContainer">
            {loadingStepData ? (
              <div className="productLoader">
                <Cliploader loading={loadingStepData} />
              </div>
            ) : (
              <div className="WOStepsInfo">
                {stepsData &&
                  stepsData
                    .slice()
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((step, index) => (
                      <div
                        key={step.id}
                        className={
                          selectedStepData?.id === step?.id
                            ? "WOStepsScrollingBoxHighlight"
                            : "WOStepsScrollingBox"
                        }
                        onClick={() => handleStepSelection(step)}
                      >
                        <div className="WOStepsScrollingBoxInner">
                          <img
                            src={
                              step?.image
                                ? step?.image.filePath
                                : theme.palette.mode === "dark"
                                ? noImageSmallDark
                                : noImageSmallLight
                            }
                          ></img>
                          <p>{step?.title}</p>
                        </div>
                        <p
                          className={
                            step?.status === "Completed"
                              ? "WOCardStepNumberCompleted"
                              : "WOCardStepNumber"
                          }
                        >
                          {step?.sequence}
                        </p>
                      </div>
                    ))}
              </div>
            )}
          </div>
          <button
            className="WOStepsInfoSideButtons"
            onClick={() => {
              const container = document.querySelector(
                ".WOStepsScrollContainer"
              );
              container.scrollLeft += 100;
            }}
          >
            <ion-icon name="chevron-forward-outline"></ion-icon>
          </button>
        </div>
      </div>
      <div className="WOStepDetails">
        <div className="WOStepDetailsInfo">
          {loadingStepData ? (
            <Cliploader loading={loadingStepData} />
          ) : (
            <>
              <div className="WOStepTitleField">
                <p>
                  <h2>Title:</h2>
                  {selectedStepData?.title}
                </p>
              </div>

              <Divider orientation="horizontal" className="HorizontalDivider" />
              <img
                src={
                  selectedStepData?.image
                    ? selectedStepData?.image.filePath
                    : theme.palette.mode === "dark"
                    ? noImageLargeDark
                    : noImageLargeLight
                }
                className="WorkOrderStepImage"
              ></img>
            </>
          )}
        </div>
        <Divider orientation="vertical" className="VerticalDivider" />
        <div className="WOStepTaskInfo">
          <SubWorkOrderStepDetails
            kitId={subWorkOrderData?.kitId}
            stepId={selectedStepData?.id}
            timerRunning={timerRunning}
            timeElapsed={timeElapsed}
            fetchWorkOrderData={fetchWorkOrderData}
            selectedStepData={selectedStepData}
            stepsData={stepsData}
            workOrderId={workOrderId}
            workOrderData={subWorkOrderData}
            mOrderPartId={subWorkOrderData?.part?.id}
            fetchWorkOrderGuideStepsData={fetchWorkOrderGuideStepsData}
            openKitDataDrawer={openKitDataDrawer}
            pauserTimer={pauseTimer}
            setIsWorkOrderReset={setIsWorkOrderReset}
            isWorkOrderReset={isWorkOrderReset}
          />
        </div>
      </div>
      <div
        style={{
          marginLeft: isDrawerOpen ? "150px" : "",
        }}
        className="GuideDetailsControls"
      >
        <button onClick={() => setEquipmentDrawerOpen(true)}>
          Step BOM<ion-icon name="chevron-up-outline"></ion-icon>
        </button>
        <button onClick={() => setMBOMDrawerOpen(true)}>
          BOM<ion-icon name="chevron-up-outline"></ion-icon>
        </button>
      </div>{" "}
      <Drawer
        anchor="left"
        open={equipmentDrawerOpen}
        onClose={() => setEquipmentDrawerOpen(false)}
        PaperProps={{
          className: "DrawerStyles",
        }}
        ModalProps={{
          disableScrollLock: true,
          disableBackdropClick: true,
          BackdropProps: {
            invisible: true,
          },
        }}
      >
        <div className="CreateFlyout">
          <div className="CreateFlyoutHeader">
            <h2>Step BOM</h2>
            <button onClick={() => setEquipmentDrawerOpen(false)}>
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>
          <div className="AddItemsBody">
            <WorkOrderStepMBom
              mBOMDrawerOpen={mBOMDrawerOpen}
              equipmentDrawerOpen={equipmentDrawerOpen}
              stepId={selectedStepData?.id}
            />
          </div>
        </div>
      </Drawer>
      <Drawer
        anchor="left"
        open={mBOMDrawerOpen}
        onClose={() => setMBOMDrawerOpen(false)}
        PaperProps={{
          className: "DrawerStyles",
        }}
        ModalProps={{
          disableScrollLock: true,
          disableBackdropClick: true,
          BackdropProps: {
            invisible: true,
          },
        }}
      >
        <div className="CreateFlyout">
          <div className="CreateFlyoutHeader">
            <h2>BOM</h2>
            <button onClick={() => setMBOMDrawerOpen(false)}>
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>
          <div className="AddItemsBody">
            <WorkOrderStepMBom
              mBOMDrawerOpen={mBOMDrawerOpen}
              equipmentDrawerOpen={equipmentDrawerOpen}
              guideId={selectedStepData?.guideId}
            />
          </div>
        </div>
      </Drawer>
      <Drawer
        anchor="right"
        open={openKitDataDrawer}
        onClose={() => {
          setOpenKitDataDrawer(false);
        }}
        PaperProps={{ className: "GuideStepDrawerStyles" }}
      >
        <ChildKitData
          childKitData={selectedKitData}
          setChildKitDataDrawer={setOpenKitDataDrawer}
        />
      </Drawer>
      <div className="AlertMessages">
        <HomeAlerts />
        <div style={{ display: "none" }}>
          <PrintWorkOrder ref={printRef} workOrderData={printData} />
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetails;
