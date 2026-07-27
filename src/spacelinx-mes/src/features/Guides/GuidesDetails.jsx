import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Divider, Drawer, MenuItem, TextField } from "@mui/material";
import { deleteGuideSteps } from "../../services/guideStepService";
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
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../../features/AlertsContext/Alerts";
import "./Step.css";
import {
  copyGuideStep,
  createGuideStepBetweenSteps,
  guideStepReOrder,
  updateGuideStep,
  updateGuideStepImage,
  fetchGuideStepWithGuideId,
  updateGuideStepVideo,
} from "../../services/guideStepService";
import NoImagePNG from "../../Assest/Images/NoImage.jpg";
import noImageLargeDark from "../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noImageLargeLight from "../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/system";
import {
  createDraftGuide,
  fetchGuideDetailswithId,
  fetchGuidesWithNumber,
  fetchGuideWithId,
  guidePublish,
  guidePublishWithValidations,
} from "../../services/guideService";
import ConfirmationBox from "../Confirmation Box/Confirmation";
import AddTask from "./AddTask";
import AddItems from "./AddItems";
import CameraComponent from "../materialKits/CameraComponent";
import ImageEditor from "./ImageEditor";
import VideoCameraComponent from "./VideoCameraComponent";
import CopyPaste from "./CopyPaste";
import NewGuide from "./NewGuide";
import CloneGuideBox from "../Clone Guide Box/CloneGuideBox";
import {
  guideCheckOut,
  guideCheckIn,
  guideForceCheckOut,
} from "../../services/guideService";
import { fetchUsers } from "../../services/userService";
import { useMsal } from "@azure/msal-react";
import PrintGuide from "./PrintGuide";
import { useReactToPrint } from "react-to-print";
import { guideWeight } from "../../services/guideService";
import AddBom from "./AddBom";
import noImageSmallDark from "../../Assest/Images/noimagesmall/noimagedark.png";
import noImageSmallLight from "../../Assest/Images/noimagesmall/noimagelightmode.png";
import { useDrawer } from "../../useDrawerHook";
import { ClipLoader } from "react-spinners";
import {
  showAlert,
  showConfirmation,
} from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { useUserContext } from "../userContext/UserContext";
import ResizableDrawer from "../../Components/ResizableDrawer/ResizableDrawer";
import { usePartDetailsDrawer } from "../admin/parts/PartDetailsContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
const SortableItem = ({
  id,
  step,
  selectedStepId,
  stepDetails,
  isDraggable,
  isSelectMode,
  isSelected,
  onToggleSelect,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: isDraggable ? CSS.Transform.toString(transform) : "none",
    transition: isDraggable ? transition : "none",
    display: "inline-block",
    width: "200px",
    position: "relative",
  };
  const theme = useTheme();

  const handleClick = () => {
    if (isSelectMode) {
      onToggleSelect(step.id);
    } else {
      stepDetails(step.id);
    }
  };

  return (
    <div
      id={step.id}
      key={step.id}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDraggable && !isSelectMode ? listeners : {})}
      draggable={isDraggable && !isSelectMode}
      className={
        isSelectMode
          ? isSelected
            ? "StepsScrollingBoxHighlight"
            : "StepsScrollingBox"
          : selectedStepId === step.id
            ? "StepsScrollingBoxHighlight"
            : "StepsScrollingBox"
      }
      onClick={handleClick}
    >
      {isSelectMode && (
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="StepSelectCheckbox"
        />
      )}
      <div className="StepsScrollingBoxInner">
        {step.video?.filePath ? (
          <video
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => e.target.pause()}
            muted
            loop
            playsInline
          >
            <source src={step.video?.filePath} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={
              step.image?.filePath
                ? step.image?.filePath.startsWith("http")
                  ? step.image?.filePath
                  : step.image?.filePath
                : theme.palette.mode === "dark"
                  ? noImageSmallDark
                  : noImageSmallLight
            }
            className="guide-image"
            alt={step.title}
          />
        )}
        <span className="stepTitle">{step?.title}</span>
      </div>
      <p className="CardStepNumber">{step?.sequence}</p>
    </div>
  );
};

const HiddenInputImage = styled("input")({
  display: "none",
});

const HiddenInputVideo = styled("input")({
  display: "none",
});

const GuideDetails = () => {
  const { openPartDetailsDrawer } = usePartDetailsDrawer();
  const { hasPermission } = useUserContext();
  const printRef = useRef();
  const { Alert } = useContext(AlertsContext);
  const { guideId } = useParams();
  const savedStepId = localStorage.getItem("selectedStepId");
  const [presentGuideId, setPresentGuideId] = useState(guideId || "");
  const [stepData, setStepData] = useState([]);
  const HiddenInputImageRef = useRef(null);
  const [allDataIsFetched, setAllDataIsFetched] = useState(true);
  const HiddenInputVideoRef = useRef(null);
  const [selectedStepId, setSelectedStepId] = useState(savedStepId);
  const [loadingData, setLoadingData] = useState(true);
  const [isCloneGuidePartBox, setIsCloneGuidePartBox] = useState(false);
  const [guideData, setGuideData] = useState(null);
  const [loadGuideData, setLoadGuideData] = useState(true);
  const [selectedStepData, setSelectedStepData] = useState("");
  const [editStepTitle, setEditStepTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [videoCamOpen, setvideoCamOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [partDetails, setPartDetails] = useState(null);
  const [platformData, setPlatformData] = useState(null);
  const [guideVersions, setGuideVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState("");
  const [editGuideDetailsAccordion, setEditGuideDetailsAccordion] =
    useState(false);
  const [equipmentDrawerOpen, setEquipmentDrawerOpen] = useState(false);
  const [mBOMDrawerOpen, setMBOMDrawerOpen] = useState(false);
  const { accounts } = useMsal();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [checkOutStatus, setCheckOutStatus] = useState(null);
  const theme = useTheme();
  const isReadOnly =
    guideData?.status === "Published" ||
    checkOutStatus === "forceCheckOut" ||
    checkOutStatus === "checkedOutByOther" ||
    hasPermission(PERMISSIONS.GUIDES.MODIFY) === false;
  const [weight, setWeight] = useState();
  const [weightUnit, setWeightUnit] = useState("Grams");
  const [printData, setPrintData] = useState(null);
  const [isStepsCollapsed, setIsStepsCollapsed] = useState(false);

  useEffect(() => {
    setIsStepsCollapsed(sessionStorage.getItem("stepsCollapsed") === "true");
  }, []);

  const handleToggleSteps = () => {
    const newValue = !isStepsCollapsed;

    setIsStepsCollapsed(newValue);
    sessionStorage.setItem("stepsCollapsed", newValue);
  };
  const { isDrawerOpen } = useDrawer();
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedStepIds, setSelectedStepIds] = useState([]);

  useEffect(() => {
    if (weight > 1000) {
      setWeightUnit("Kg");
    } else {
      setWeightUnit("Grams");
    }
  }, [weight]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const fetchPrintData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchGuideDetailswithId(presentGuideId);
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
      handlePrint();
    }
  }, [printData]);

  const fetchAndPrintData = async () => {
    if (!hasPermission(PERMISSIONS.GUIDES.PRINT)) {
      Alert("User does not have print permission.", "warning");
      return;
    }
    try {
      await fetchPrintData();
    } catch (error) {
      console.error("Error fetching guide data:", error);
    }
  };

  useEffect(() => {
    if (guideData?.checkOutBy) {
      if (guideData.checkOutBy === currentUser?.email) {
        setCheckOutStatus("checkIn");
      } else if (
        currentUser?.roles?.some((role) => role.roleName === "Admin")
      ) {
        setCheckOutStatus("forceCheckOut");
      } else {
        setCheckOutStatus("checkedOutByOther");
      }
    } else {
      setCheckOutStatus("checkOut");
    }
  }, [guideData, currentUser]);

  useEffect(() => {
    const fetchUsersData = async () => {
      setLoadingData(true);
      try {
        const response = await fetchUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUsersData();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && users.length > 0) {
      const msalCurrentUser = accounts[0];
      const matchedUser = users.find(
        (user) => user.email === msalCurrentUser.username,
      );
      setCurrentUser(matchedUser);
    }
  }, [accounts, users]);

  const handleImagePaste = (imageBlob) => {
    setSelectedImage(imageBlob);
  };

  const openImgEditor = () => {
    setIsFullScreen(true);
  };

  const handleCaptureImage = async (imageSrc) => {
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const file = new File([blob], "captured-image.jpg", {
        type: "image/jpeg",
      });

      setSelectedImage(file);
      setCameraOpen(false);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };
  const handleCaptureVideo = (videoBlob) => {
    try {
      const file = new File([videoBlob], "captured-video.webm", {
        type: "video/webm",
      });
      setSelectedVideo(file);
      setvideoCamOpen(false);
    } catch (error) {
      console.error("Error creating video URL:", error);
      Alert("Error creating video URL", "error");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  useEffect(() => {
    if (presentGuideId) {
      fetchGuides();
      fetchStepsData();
    }
  }, [presentGuideId]);
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFullScreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const fetchGuides = async () => {
    setLoadingData(true);
    setLoadGuideData(true);
    try {
      const data = await fetchGuideWithId(presentGuideId);
      if (data) {
        setGuideData(data);
        setSelectedVersion(data.id);
        setPartDetails(data?.part);
        setPlatformData(data?.platform);
        const guideVersionsAvailable = await fetchGuidesWithNumber(data.number);
        guideVersionsAvailable.sort((a, b) => a.version - b.version);
        if (guideVersionsAvailable) {
          setGuideVersions(guideVersionsAvailable);
        }
      }
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoadingData(false);
      setLoadGuideData(false);
    }
  };

  const fetchStepsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchGuideStepWithGuideId(presentGuideId);
      if (data) {
        const filteredSteps = data.sort((a, b) => a.sequence - b.sequence);
        setStepData(filteredSteps);
        if (!selectedStepId) {
          const firstStepId = filteredSteps.find(
            (item) => item.sequence === 1,
          )?.id;
          setSelectedStepId(firstStepId);
          setSelectedStepData(
            filteredSteps.find((item) => item.id === firstStepId),
          );
          setEditStepTitle(
            filteredSteps.find((item) => item.id === firstStepId)?.title,
          );
        } else {
          const currentSelectedStep = filteredSteps.find(
            (step) => step.id === selectedStepId,
          );
          if (!currentSelectedStep) {
            setSelectedStepId(
              filteredSteps.find((item) => item.sequence === 1)?.id,
            );
          } else {
            setSelectedStepData(currentSelectedStep);
            setEditStepTitle(currentSelectedStep?.title);
          }
        }
        setLoadingData(false);
      }
    } catch (error) {
      setLoadingData(false);
      handleFetchError(error, "Couldn't fetch steps data...!");
    } finally {
      setLoadingData(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };
  useEffect(() => {
    if (selectedImage) {
      handleUpdateImage();
    }
  }, [selectedImage]);

  const handleUpdateImage = async () => {
    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append("imageFile", selectedImage);
        setLoadingData(true);
        await updateGuideStepImage(selectedStepId, formData);
        Alert("Step Image Uploaded Successfully..!", "success");
        setSelectedImage(null);
        fetchStepsData();
      } else {
        Alert("Step Image Uploaded Successfully..!", "success");
      }
    } catch (error) {
      Alert("Error while step image uploading...!", "error");
      console.error("Error updating image:", error);
    } finally {
      setLoadingData(false);
    }
  };
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
    }
  };

  useEffect(() => {
    if (selectedVideo) {
      handleUpdateVideo();
    }
  }, [selectedVideo]);
  const handleUpdateVideo = async () => {
    try {
      setLoadingData(true);
      const formData = new FormData();
      formData.append("videoFile", selectedVideo);

      await updateGuideStepVideo(selectedStepId, formData);
      Alert("Step Video Uploaded Successfully!", "success");
      setStepData([]);
      fetchStepsData();
    } catch (error) {
      setLoadingData(false);
      Alert("Error while uploading step video...!", "error");
      console.error("Error updating video:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCloneGuide = async () => {
    if (!hasPermission(PERMISSIONS.GUIDES.CLONE)) {
      Alert("User does not have permission to clone guides.", "warning");
      return;
    }

    setIsCloneGuidePartBox(true);
  };

  const toggleStepSelection = (stepId) => {
    setSelectedStepIds((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId],
    );
  };

  const handleExitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedStepIds([]);
  };

  const selectableSteps = stepData.slice(1).map((s) => s.id);
  const allSelectableSelected =
    selectableSteps.length > 0 &&
    selectableSteps.every((id) => selectedStepIds.includes(id));

  const handleToggleSelectAll = () => {
    if (allSelectableSelected) {
      setSelectedStepIds([]);
    } else {
      setSelectedStepIds(selectableSteps);
    }
  };

  const handleDeleteStep = async () => {
    const idsToDelete = isSelectMode ? selectedStepIds : [selectedStepId];

    if (idsToDelete.length === 0) {
      showAlert(
        "error",
        "No Steps Selected",
        "Please select at least one step to delete.",
      );
      return;
    }

    if (stepData.length - idsToDelete.length < 1) {
      showAlert(
        "error",
        "Cannot Delete",
        "Cannot delete all steps. At least one step must remain.",
      );
      return;
    }

    const stepLabel =
      idsToDelete.length > 1
        ? `these ${idsToDelete.length} steps`
        : "this step";
    const confirmed = await showConfirmation(
      idsToDelete.length > 1
        ? `Delete ${idsToDelete.length} Steps?`
        : "Delete Step?",
      `Are you sure you want to delete ${stepLabel}?`,
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      await deleteGuideSteps(idsToDelete);
      await fetchStepsData();
      showAlert(
        "success",
        "Deleted!",
        `${idsToDelete.length > 1 ? `${idsToDelete.length} Steps` : "Step"} Deleted Successfully!`,
      );

      if (isSelectMode) {
        handleExitSelectMode();
      } else {
        const assignNextStep = stepData.find(
          (item) => item?.id === selectedStepId,
        );
        const nextStep = stepData.find(
          (item) => item?.sequence === assignNextStep?.sequence + 1,
        );
        if (!nextStep) {
          const previousStep = stepData.find(
            (item) => item?.sequence === assignNextStep?.sequence - 1,
          );
          setSelectedStepId(previousStep ? previousStep?.id : null);
        } else {
          setSelectedStepId(nextStep?.id);
        }
      }
    } catch (error) {
      handleFetchError(error, "Couldn't Delete Guide Step(s)");
      showAlert("error", "Failed", "Couldn't Delete Guide Step(s)");
    } finally {
      setLoadingData(false);
    }
  };
  useEffect(() => {
    setSelectedStepData(stepData.find((step) => step?.id === selectedStepId));
    setEditStepTitle(
      stepData.find((step) => step?.id === selectedStepId)?.title,
    );
  }, [selectedStepId]);
  const stepDetails = (id) => {
    if (allDataIsFetched) {
      Alert("The data is fetching.. Please wait", "error");
    } else {
      setAllDataIsFetched(true);
      setSelectedStepId(id);
      setSelectedStepData(stepData.find((step) => step?.id === id));
      setEditStepTitle(stepData.find((step) => step?.id === id)?.title);
      setAllDataIsFetched(false);
    }
  };
  const handleEditPublishedGuide = async () => {
    setLoadingData(true);
    try {
      const data = await createDraftGuide(presentGuideId);
      setPresentGuideId(data);
      Alert("Draft Created Successfully, You can edit Here..!", "success");
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handlePublish = async () => {
    const confirmed = await showConfirmation(
      "Publish Guide?",
      "Are you sure you want to publish this guide?",
      "Yes, publish it!",
      true,
    );

    if (!confirmed) return;

    setLoadingData(true);
    try {
      if (stepData.length === 0) {
        await showConfirmation(
          "Step Required",
          "Add at least one step before publishing.",
          "OK",
          false,
        );
        return;
      }

      if (guideData?.platformId === null) {
        await showConfirmation(
          "Platform Not Assigned",
          "Assign the guide to a platform before publishing.",
          "OK",
          false,
        );
        return;
      }

      await guidePublishWithValidations(presentGuideId);
      showAlert("success", "Success", "Guide Published Successfully!");
      fetchGuides();
    } catch (error) {
      if (
        error.response?.status === 400 &&
        error.response?.data?.nonReleasedParts?.length > 0
      ) {
        await showConfirmation(
          "Publish Error",
          "Cannot publish guide with non-released parts.",
          "OK",
          false,
        );
      } else {
        handleFetchError(error, "Couldn't Publish this Guide...!");
      }
    } finally {
      setLoadingData(false);
    }
  };

  const handleCopyStep = async () => {
    setLoadingData(true);
    try {
      const data = await copyGuideStep(selectedStepId);
      if (data) {
        Alert("Step copy Successfully..!", "success");
        await fetchStepsData();
        setSelectedStepId(data);
      }
    } catch (error) {
      handleFetchError(error, "Couldn't copy this guide step...!");
      setLoadingData(false);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateStepTitle = async () => {
    setLoadingData(true);
    try {
      const step = {
        id: selectedStepId,
        title: editStepTitle,
        guideId: presentGuideId,
      };
      await updateGuideStep(selectedStepId, step);
      fetchStepsData();
    } catch (error) {
      console.error("Update Error:", error);
    } finally {
      setLoadingData(false);
    }
  };
  const handleCreateGuideStepBetweenSteps = async () => {
    setLoadingData(true);
    const selectedStepSequence = selectedStepData?.sequence;
    const newStepSequence = selectedStepSequence ? selectedStepSequence + 1 : 1;
    try {
      const data = await createGuideStepBetweenSteps(
        presentGuideId,
        newStepSequence,
      );
      await fetchStepsData();
      setSelectedStepId(data.id);
      Alert("Guide step Created Successfully..!", "success");
    } catch (error) {
      handleFetchError(error, "Couldn't create step...!", "error");
      setLoadingData(false);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFetchError = (error, message) => {
    console.error(error);
    Alert(message, "error");
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (isReadOnly) {
      showAlert("error", "Not Allowed", "Reordering is not allowed.");
      return;
    }

    if (active?.id !== over?.id) {
      const confirmed = await showConfirmation(
        "Reorder Step?",
        "Are you sure you want to reorder this step?",
        "Yes, reorder it!",
      );
      if (!confirmed) return;

      const originalIndex = stepData.findIndex(
        (step) => step?.id === active?.id,
      );
      const newIndex = stepData.findIndex((step) => step?.id === over?.id);

      const reorderedSteps = arrayMove(stepData, originalIndex, newIndex);
      setStepData(reorderedSteps);
      setLoadingData(true);

      try {
        await guideStepReOrder(active.id, newIndex + 1);
        await fetchStepsData();
        showAlert("success", "Reordered!", "Step reordered successfully!");
      } catch (error) {
        console.error("Error updating step order:", error);
        showAlert("error", "Failed", "Couldn't update the step order.");
      } finally {
        setLoadingData(false);
      }
    }
  };

  const handleImageSave = async (editedImageBase64) => {
    setLoadingData(true);
    try {
      const byteString = atob(editedImageBase64.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/png" });
      const file = new File([blob], "edited-image.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("imageFile", file);

      await updateGuideStepImage(selectedStepId, formData);
      Alert("Step Image Edited Successfully..!", "success");

      await fetchStepsData();
      setLoadingData(false);
      setIsFullScreen(false);
    } catch (error) {
      Alert("Error while step image uploading...!", "error");
      console.error("Error updating image:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const placeholderImageUrl = NoImagePNG;
  const imageUrl = selectedStepData?.image?.filePath || placeholderImageUrl;
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (selectedStepId) {
      positionTheStep();
    }
  }, [
    selectedStepId,
    handleImageChange,
    handleCaptureImage,
    handleImageSave,
    handleVideoChange,
    handleCaptureVideo,
  ]);

  const positionTheStep = () => {
    const container = document.querySelector(".StepsScrollContainer");
    const selectedStep = document.getElementById(selectedStepId);

    if (container && selectedStep) {
      const containerWidth = container.clientWidth;
      const stepWidth = selectedStep.clientWidth;
      const scrollLeft =
        selectedStep.offsetLeft - containerWidth / 2 + stepWidth / 2;
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    positionTheStep();
  }, [selectedStepId]);

  useEffect(() => {
    const container = document.querySelector(".StepsScrollContainer");
    setTimeout(() => {
      if (container) {
        setScrollPosition(container.scrollLeft);
      }
    }, 1000);
  }, [scrollPosition]);

  useEffect(() => {
    localStorage.setItem("selectedStepId", selectedStepId);
  }, [selectedStepId]);
  useEffect(() => {
    const handleArrowKeys = (event) => {
      const target = event.target;

      // Ignore arrow keys while typing
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      const currentIndex = stepData.findIndex(
        (step) => step.id === selectedStepId,
      );

      if (event.key === "ArrowLeft" && currentIndex > 0) {
        stepDetails(stepData[currentIndex - 1].id);
      }

      if (event.key === "ArrowRight" && currentIndex < stepData.length - 1) {
        stepDetails(stepData[currentIndex + 1].id);
      }
    };

    window.addEventListener("keydown", handleArrowKeys);

    return () => {
      window.removeEventListener("keydown", handleArrowKeys);
    };
  }, [selectedStepId, stepData]);
  const handleGuideCheckOut = async (guideId) => {
    try {
      const result = await guideCheckOut(guideId);
      fetchGuides();
      Alert("User Checked Out Successfully..!", "success");
    } catch (error) {
      Alert("Unable To Check Out. Please Try Again..!", "error");
      console.error("Check out failed", error);
    }
  };
  const handleGuideForceCheckOut = async (guideId) => {
    try {
      const result = await guideForceCheckOut(guideId);
      fetchGuides();
      Alert("Admin forced check out successfully!", "success");
    } catch (error) {
      Alert("Unable To Check Out. Please Try Again..!", "error");
      console.error("Check out failed", error);
    }
  };

  const handleGuideCheckIn = async (guideId) => {
    try {
      const result = await guideCheckIn(guideId);
      fetchGuides();
      Alert("User Checked In Successfully..!", "success");
    } catch (error) {
      Alert("Unable To Check In. Please Try Again..!", "error");
      console.error("Check in failed", error);
    }
  };

  const handleUnitChange = (event) => {
    setWeightUnit(event.target.value);
  };

  const displayedWeight =
    weight !== undefined && weight !== null
      ? weightUnit === "Kg"
        ? (weight / 1000).toFixed(3)
        : weight.toFixed(3)
      : "N/A";

  useEffect(() => {
    const fetchGuideWeight = async () => {
      try {
        const data = await guideWeight(presentGuideId);
        setWeight(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchGuideWeight();
  }, [presentGuideId, equipmentDrawerOpen, stepData]);

  return (
    <div className="GuidesListMain">
      <div className="GuideDetailsBreadCrumb">
        <div className="GuideDetailsBreadCrumb1">
          <Link className="GuideDetailsBreadCrumbLink" to="/guides">
            Guides
          </Link>
          <ion-icon name="chevron-forward-outline"></ion-icon>
          <p className="guide-number">
            {loadGuideData ? (
              <ClipLoader color={"#009cbb"} loading={loadGuideData} />
            ) : (
              guideData?.number
            )}
          </p>
        </div>
        <div className="GuideControlButtonContainer">
          {guideData?.status === "Published" ? (
            <>
              {hasPermission(PERMISSIONS.GUIDES.PUBLISH) && (
                <>
                  {checkOutStatus === "checkIn" && (
                    <button
                      onClick={() => handleGuideCheckIn(presentGuideId)}
                      className="GuideControlButton guides-button"
                    >
                      Check In
                      <ion-icon name="checkmark-outline"></ion-icon>
                    </button>
                  )}
                  {checkOutStatus === "forceCheckOut" && (
                    <button
                      onClick={() => handleGuideForceCheckOut(presentGuideId)}
                      className="GuideControlButton guides-button"
                    >
                      Force Check Out
                      <ion-icon name="warning-outline"></ion-icon>
                    </button>
                  )}
                  {checkOutStatus === "checkedOutByOther" && (
                    <button
                      disabled
                      className="GuideControlButton guides-button"
                    >
                      Checked Out by {guideData.checkOutBy}
                    </button>
                  )}
                  {checkOutStatus === "checkOut" && (
                    <button
                      onClick={() => handleGuideCheckOut(presentGuideId)}
                      className="GuideControlButton guides-button"
                    >
                      Check Out
                      <ion-icon name="shield-checkmark-outline"></ion-icon>
                    </button>
                  )}
                  {checkOutStatus !== "forceCheckOut" &&
                    checkOutStatus !== "checkedOutByOther" && (
                      <>
                        <button
                          className="GuideControlButton guides-button"
                          onClick={handleCloneGuide}
                          disabled={!hasPermission(PERMISSIONS.GUIDES.CLONE)}
                        >
                          Clone Guide
                          <ion-icon name="copy-outline"></ion-icon>
                        </button>
                        <button
                          className="GuideControlButton guides-button"
                          onClick={() => {
                            if (!hasPermission(PERMISSIONS.GUIDES.MODIFY)) {
                              Alert(
                                "You do not have permission to edit guides.",
                                "error",
                              );
                              return;
                            }

                            const latestVersion = guideVersions.find(
                              (item) => item?.status === "Draft",
                            );
                            if (latestVersion) {
                              Alert(
                                `Draft Already Available in Version ${latestVersion?.version}...!`,
                                "error",
                              );
                              setPresentGuideId(latestVersion?.id);
                            } else {
                              handleEditPublishedGuide();
                            }
                          }}
                          disabled={!hasPermission(PERMISSIONS.GUIDES.MODIFY)}
                        >
                          Edit Guide
                          <ion-icon name="create-outline"></ion-icon>
                        </button>
                      </>
                    )}
                </>
              )}
              <button
                className="GuideControlButton guides-button"
                onClick={fetchAndPrintData}
                disabled={!hasPermission(PERMISSIONS.GUIDES.PRINT)}
              >
                Print
                <ion-icon name="print-outline" title="Print"></ion-icon>
              </button>
            </>
          ) : (
            <div className="GuideDraftButtonsContainer">
              {hasPermission(PERMISSIONS.GUIDES.MODIFY) && (
                <>
                  {checkOutStatus === "checkIn" && (
                    <button
                      onClick={() => handleGuideCheckIn(presentGuideId)}
                      className="GuideDraftButtons guides-button"
                    >
                      Check In
                      <ion-icon name="checkmark-outline"></ion-icon>
                    </button>
                  )}
                  {checkOutStatus === "forceCheckOut" && (
                    <button
                      onClick={() => handleGuideForceCheckOut(presentGuideId)}
                      className="GuideDraftButtons guides-button"
                    >
                      Force Check Out
                      <ion-icon name="warning-outline"></ion-icon>
                    </button>
                  )}
                  {checkOutStatus === "checkedOutByOther" && (
                    <button
                      className="GuideDraftButtons guides-button disabled"
                      disabled
                      data-tooltip={`Checked Out By: ${guideData?.checkOutBy}`}
                    >
                      Check Out
                    </button>
                  )}
                  {checkOutStatus === "checkOut" && (
                    <button
                      onClick={() => handleGuideCheckOut(presentGuideId)}
                      className="GuideDraftButtons guides-button"
                    >
                      Check Out
                      <ion-icon name="shield-checkmark-outline"></ion-icon>
                    </button>
                  )}
                </>
              )}

              <button
                className="GuideDraftButtons guides-button"
                onClick={fetchAndPrintData}
                disabled={!hasPermission(PERMISSIONS.GUIDES.PRINT)}
              >
                Print
                <ion-icon name="print-outline" title="Print"></ion-icon>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="CreateStepButton">
        <div className="GuideDetailsHeader">
          {loadGuideData ? (
            <ClipLoader
              color={"#009cbb"}
              loading={loadGuideData}
              className="GuideDetailsHeaderLoader"
            />
          ) : (
            <>
              <div className="GuideNameNumber">
                <h2
                  className="guide-content"
                  title={guideData?.number + " / " + guideData?.name}
                >
                  {guideData?.number}
                </h2>
                /
                <p
                  className="guide-content"
                  title={guideData?.number + " / " + guideData?.name}
                >
                  {guideData?.name}
                </p>
                {!isReadOnly && (
                  <ion-icon
                    name="create-outline"
                    title="Edit Guide"
                    onClick={() => {
                      setEditGuideDetailsAccordion(true);
                    }}
                  ></ion-icon>
                )}
              </div>
              <Divider orientation="vertical" flexItem />
              <div className="GuidePartName">
                <h2 className="guide-content">Part:</h2>
                <p
                  className="AppHyperLink"
                  title={`${partDetails?.partNumber || ""} / ${
                    partDetails?.name || ""
                  }`}
                  onClick={(e) => {
                    if (!hasPermission(PERMISSIONS.PARTS.VIEW)) {
                      e.preventDefault();
                      e.stopPropagation();
                      Alert(
                        "You don’t have permission to view Part details.",
                        "error",
                      );
                      return;
                    }
                    if (partDetails?.partNumberSuffix) {
                      openPartDetailsDrawer({
                        partNumberSuffix: partDetails?.partNumberSuffix,
                      });
                    }
                  }}
                >
                  {partDetails?.partNumber} / {partDetails?.name}
                </p>
              </div>

              <Divider orientation="vertical" flexItem />

              <div className="GuidePartNumber">
                <h2 className="guide-content">Platform:</h2>
                <p
                  className="guide-content"
                  title={platformData?.name || "Assign platform"}
                >
                  {isReadOnly ? (
                    platformData?.name
                  ) : platformData ? (
                    platformData.name
                  ) : (
                    <button
                      onClick={() => setEditGuideDetailsAccordion(true)}
                      className="GuideControlButton"
                    >
                      Assign
                    </button>
                  )}
                </p>
              </div>
              <Divider orientation="vertical" flexItem />
              <div className="GuideVersion">
                <h2 className="VersionName guide-content">Version:</h2>
                <TextField
                  select
                  variant="standard"
                  value={selectedVersion}
                  onChange={(event) => {
                    setLoadingData(true);
                    setSelectedVersion(event.target.value);
                    setPresentGuideId(event.target.value);
                    setSelectedStepId("");
                  }}
                >
                  {guideVersions?.map((guide) => (
                    <MenuItem key={guide?.id} value={guide.id}>
                      {guide?.version}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <Divider orientation="vertical" flexItem />
              <div className="GuideWeight">
                <h2 className="guide-content">Weight: </h2>
                <p className="guide-content">{displayedWeight}</p>
                <TextField
                  select
                  variant="standard"
                  value={weightUnit}
                  onChange={handleUnitChange}
                >
                  <MenuItem value="Kg">Kg</MenuItem>
                  <MenuItem value="Grams">g</MenuItem>
                </TextField>
              </div>
            </>
          )}
        </div>

        <div className="GuidePublish">
          {guideData?.status === "Published" ? (
            <div className="PublishedTag">
              <p>Published</p>
              <ion-icon name="checkmark-done-outline"></ion-icon>
            </div>
          ) : (
            !isReadOnly && (
              <button
                variant="contained"
                disabled={loadingData}
                onClick={handlePublish}
                className="GuidePublishButton guides-button"
              >
                <ion-icon name="share-outline" title="Publish"></ion-icon>
              </button>
            )
          )}
        </div>
      </div>
      <Accordion
        expanded={!isStepsCollapsed}
        onChange={handleToggleSteps}
        className="StepsAccordion"
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            minHeight: "36px",
            "& .MuiAccordionSummary-content": { margin: "6px 0" },
          }}
        >
          <h3>Steps</h3>
        </AccordionSummary>

        <AccordionDetails sx={{ padding: "12px" }}>
          <div className="StepsSection">
            <div className={isReadOnly ? "PublishedStepsInfo" : "StepsInfo"}>
              <button
                className="StepsInfoSideButtons"
                onClick={() => {
                  const currentIndex = stepData.findIndex(
                    (step) => step.id === selectedStepId,
                  );

                  if (currentIndex > 0) {
                    stepDetails(stepData[currentIndex - 1].id);
                  }
                }}
              >
                <ion-icon name="chevron-back-outline"></ion-icon>
              </button>
              <div className="StepsScrollContainer">
                {loadingData ? (
                  <div className="productLoader">
                    <ClipLoader color={"#009cbb"} loading={loadingData} />
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={stepData.map((step) => step.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {stepData.map((step) => (
                        <SortableItem
                          key={step.id}
                          id={step.id}
                          step={step}
                          selectedStepId={selectedStepId}
                          stepDetails={stepDetails}
                          isDraggable={!isReadOnly}
                          isSelectMode={isSelectMode}
                          isSelected={selectedStepIds.includes(step.id)}
                          onToggleSelect={toggleStepSelection}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
              <button
                className="StepsInfoSideButtons"
                onClick={() => {
                  const currentIndex = stepData.findIndex(
                    (step) => step.id === selectedStepId,
                  );

                  if (currentIndex < stepData.length - 1) {
                    stepDetails(stepData[currentIndex + 1].id);
                  }
                }}
              >
                <ion-icon name="chevron-forward-outline"></ion-icon>
              </button>
            </div>
            {!isReadOnly && (
              <div className="StepControls">
                <button
                  className="AddStep guides-button"
                  disabled={loadingData || allDataIsFetched || isSelectMode}
                  onClick={handleCreateGuideStepBetweenSteps}
                >
                  <ion-icon name="add-outline" title="Add Step"></ion-icon>
                </button>
                <button
                  onClick={handleCopyStep}
                  disabled={loadingData || allDataIsFetched || isSelectMode}
                  className="guides-button"
                >
                  <ion-icon name="copy-outline" title="Copy Step"></ion-icon>
                </button>
                <button
                  className="guides-button"
                  disabled={loadingData}
                  title={
                    isSelectMode
                      ? "Exit Selection Mode"
                      : "Select Multiple Steps"
                  }
                  onClick={() =>
                    isSelectMode
                      ? handleExitSelectMode()
                      : setIsSelectMode(true)
                  }
                  style={isSelectMode ? { outline: "2px solid #009cbb" } : {}}
                >
                  <ion-icon name="checkbox-outline"></ion-icon>
                </button>
                {isSelectMode && (
                  <button
                    className="guides-button"
                    disabled={loadingData}
                    title={
                      allSelectableSelected ? "Deselect All" : "Select All"
                    }
                    onClick={handleToggleSelectAll}
                  >
                    <ion-icon
                      name={
                        allSelectableSelected
                          ? "square-outline"
                          : "checkmark-done-outline"
                      }
                    ></ion-icon>
                  </button>
                )}
                <button
                  className="DeleteStep guides-button"
                  disabled={
                    loadingData ||
                    (isSelectMode
                      ? selectedStepIds.length === 0
                      : allDataIsFetched)
                  }
                  onClick={handleDeleteStep}
                  title={
                    isSelectMode && selectedStepIds.length > 0
                      ? `Delete ${selectedStepIds.length} step(s)`
                      : "Delete Step"
                  }
                >
                  <ion-icon name="trash-outline"></ion-icon>
                  {isSelectMode && selectedStepIds.length > 0 && (
                    <span style={{ fontSize: "12px", marginLeft: "2px" }}>
                      ({selectedStepIds.length})
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </AccordionDetails>
      </Accordion>

      <div className="StepDetails">
        <div className="StepDetailsInfo">
          {loadingData ? (
            <ClipLoader color={"#009cbb"} loading={loadingData} />
          ) : (
            <>
              <div className="StepTitleField">
                {isReadOnly ? (
                  <h2 className="guide-content">
                    Step Title: <p className="guide-content">{editStepTitle}</p>
                  </h2>
                ) : (
                  <input
                    placeholder="Enter Step Title"
                    value={editStepTitle}
                    onChange={(e) => setEditStepTitle(e.target.value)}
                    className="steptitle-field-input"
                  />
                )}
                {selectedStepData?.title !== editStepTitle && !isReadOnly && (
                  <button className="guides-button">
                    <ion-icon
                      name="save-outline"
                      title="Save"
                      onClick={handleUpdateStepTitle}
                    />
                  </button>
                )}
              </div>
              <HiddenInputImage
                type="file"
                accept="image/*,video/*"
                id="HiddenInputImage"
                onChange={handleImageChange}
                ref={HiddenInputImageRef}
              />
              <HiddenInputVideo
                type="file"
                id="HiddenInputVideo"
                onChange={handleVideoChange}
                ref={HiddenInputVideoRef}
              />
              {!isReadOnly && (
                <div className="StepImageControls">
                  <button
                    onClick={() => HiddenInputImageRef.current.click()}
                    className="guides-button"
                  >
                    <ion-icon name="share-outline" title="Upload"></ion-icon>
                  </button>
                  <button className="guides-button">
                    <ion-icon
                      name="camera-outline"
                      title="Camera"
                      onClick={() => setCameraOpen(true)}
                    ></ion-icon>
                  </button>
                  <button className="guides-button">
                    <ion-icon
                      name="videocam-outline"
                      title="Video Camera"
                      onClick={() => setvideoCamOpen(true)}
                    ></ion-icon>
                  </button>
                  <button onClick={openImgEditor} className="guides-button">
                    <ion-icon name="create-outline" title="Edit"></ion-icon>
                  </button>
                  <button className="guides-button">
                    <CopyPaste
                      onImagePaste={handleImagePaste}
                      selectedStepId={selectedStepId}
                    />
                  </button>

                  {cameraOpen && (
                    <CameraComponent
                      onSave={handleCaptureImage}
                      onClose={() => setCameraOpen(false)}
                    />
                  )}
                  {videoCamOpen && (
                    <VideoCameraComponent
                      onSave={handleCaptureVideo}
                      onClose={() => setvideoCamOpen(false)}
                    />
                  )}
                </div>
              )}
              <div className="PreviewDiv">
                {selectedStepData?.video?.filePath ? (
                  <video controls src={selectedStepData.video?.filePath}>
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={
                      selectedStepData?.image?.filePath
                        ? selectedStepData?.image?.filePath
                        : theme.palette.mode === "dark"
                          ? noImageLargeDark
                          : noImageLargeLight
                    }
                    alt={selectedStepData?.title || "Step Image Preview"}
                    onClick={
                      !isReadOnly
                        ? selectedStepData?.image?.filePath
                          ? null
                          : () => HiddenInputImageRef.current.click()
                        : null
                    }
                  />
                )}
              </div>
            </>
          )}
        </div>
        <div className="StepTaskInfo">
          <AddTask
            stepId={selectedStepId}
            guideId={presentGuideId}
            setAllDataIsFetched={setAllDataIsFetched}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>
      <div
        className="GuideDetailsControls"
        style={{
          marginLeft: isDrawerOpen ? "150px" : "",
        }}
      >
        <button
          onClick={() => {
            setEquipmentDrawerOpen(true);
            setMBOMDrawerOpen(false);
          }}
        >
          Step BOM
        </button>
        <button
          onClick={() => {
            setMBOMDrawerOpen(true);
            setEquipmentDrawerOpen(false);
          }}
        >
          BOM
        </button>
      </div>
      <ResizableDrawer
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
            <h2> Step BOM</h2>
            <button onClick={() => setEquipmentDrawerOpen(false)}>
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>
          <div className="AddItemsBody">
            <AddItems
              mBOMDrawerOpen={mBOMDrawerOpen}
              equipmentDrawerOpen={equipmentDrawerOpen}
              stepId={selectedStepId}
              guidePartId={partDetails?.id}
              guideId={presentGuideId}
              guideStatus={guideData?.status}
              setAllDataIsFetched={setAllDataIsFetched}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      </ResizableDrawer>
      <ResizableDrawer
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
            <AddBom
              guidePartId={partDetails?.id}
              guideId={presentGuideId}
              setAllDataIsFetched={setAllDataIsFetched}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      </ResizableDrawer>
      <ResizableDrawer
        anchor="right"
        open={editGuideDetailsAccordion}
        onClose={() => setEditGuideDetailsAccordion(false)}
      >
        <NewGuide
          editGuideData={guideData}
          guideVersions={guideVersions}
          editGuideDetailsAccordion={editGuideDetailsAccordion}
          setEditGuideDetailsAccordion={setEditGuideDetailsAccordion}
          fetchGuides={fetchGuides}
        />
      </ResizableDrawer>
      <div style={{ display: "none" }}>
        <PrintGuide ref={printRef} guideData={printData} />
      </div>
      <ImageEditor
        source={imageUrl}
        onSaveImage={handleImageSave}
        isFullScreen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        loadingData={setLoadingData}
      />
      <CloneGuideBox
        isOpen={isCloneGuidePartBox}
        onClose={() => setIsCloneGuidePartBox(false)}
        onConfirm={() => {
          confirmCloneGuide(id);
        }}
        setLoadingData={setLoadingData}
        presentGuideId={presentGuideId}
        setIsCloneGuidePartBox={setIsCloneGuidePartBox}
      />
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};
export default GuideDetails;
