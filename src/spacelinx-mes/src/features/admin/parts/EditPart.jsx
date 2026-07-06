import React, { useState, useEffect, useContext, useRef } from "react";
import ChildPart from "./ChildPart";
import {
  MenuItem,
  Tab,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import {
  updatePart,
  updatePartwithImage,
  fetchPartVersions,
  fetchManufacturers,
  revisePartById,
  fetchAllBuyParts,
} from "../../../services/partService";
import Autocomplete from "@mui/material/Autocomplete";
import ".././admin.css";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { fetchGuideVersionsWithPartId } from "../../../services/guideService";
import Documents from "../../../Components/Documents/Documents";
import noImageDark from "../../../Assest/Images/noimagelarge/noimagedarkmode.png";
import noimagelightmode from "../../../Assest/Images/noimagelarge/noimagelightmode.jpg";
import { useTheme } from "@mui/material/styles";
import CameraComponent from "../../materialKits/CameraComponent";
import { Link, useNavigate } from "react-router-dom";
import PartUsedIn from "./PartUsedIn";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CloneBOM from "./CloneBOM";
import { useUserContext } from "../../userContext/UserContext";
import ImagePreviewDrawer from "../../../Components/ImagePreviewDrawer/ImagePreviewDrawer";
import PartInventory from "./PartInventory";
import InventoryTransaction from "../../Inventory/PartsInventory/InventoryTransaction";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { fetchUnitOfMeasureLookUp } from "../../../services/unitOfMeasureService";
import { fetchCountryLookUp } from "../../../services/countryService";
import { fetchSubsystemsLookup } from "../../../services/subsystemService";
import { fetchPartLevelLookup } from "../../../services/partLevelService";
import "../../features.css";
import { Tooltip } from "@mui/material";

const EditPart = ({
  handleCloseClick,
  handleRefresh,
  selectedPartNumberSuffix,
  defaultTab = "1",
  selectedPartNumber,
  handleClose = () => {},
}) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const normalizePartNumber = (num) =>
    num.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const [loadingData, setLoadingData] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [editPartName, setEditPartName] = useState("");
  const [canPartDelete, setCanPartDelete] = useState(true);
  const [editPartNumber, setEditPartNumber] = useState("");
  const [editType, setEditType] = useState("");
  const [editMakeOrBuy, setEditMakeOrBuy] = useState("");
  const [editUom, setEditUom] = useState("");
  const [editPartNameError, setEditPartNameError] = useState("");
  const [editPartNumberError, setEditPartNumberError] = useState("");
  const [editTypeError, setEditTypeError] = useState("");
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState(defaultTab);
  const [isParentPart, setIsParentPart] = useState(false);
  const [serialNumberRequiredValue, setSerialNumberRequiredValue] =
    useState(null);
  const [editWeight, setEditWeight] = useState("");
  const [editWeightError, setEditWeightError] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const theme = useTheme();
  const [cameraOpen, setCameraOpen] = useState(false);
  const NoImagePNG =
    theme.palette.mode === "dark" ? noImageDark : noimagelightmode;
  const [partVersionsData, setPartVersionsData] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const selectedId = selectedPart?.part?.id;
  const navigate = useNavigate();
  const [editManufacturingPartNumber, setEditManufacturingPartNumber] =
    useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");
  const [
    editManufacturingPartNumberError,
    setEditManufacturingPartNumberError,
  ] = useState("");
  const [description, setDescription] = useState("");
  const [cloneBOMBoxStatus, setCloneBOMBoxStatus] = useState(false);
  const [editUomError, setEditUomError] = useState(null);
  const fileInputRef = useRef(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [editManufacturerName, setEditManufacturerName] = useState("");
  const [editManufacturerNameError, setEditManufacturerNameError] =
    useState("");
  const [editTRL, setEditTRL] = useState("");
  const [editTRLError, setEditTRLError] = useState("");
  const [spaceQualified, setSpaceQualified] = useState(null);
  const [material, setMaterial] = useState("");
  const [materials, setMaterials] = useState(null);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [editSpaceQualifiedError, setEditSpaceQualifiedError] = useState("");
  const [editSerialNumberRequiredError, setEditSerialNumberRequiredError] =
    useState("");
  const [manufacturingPartNumbers, setManufacturingPartNumbers] = useState([]);
  const [loadingMPartNumbersData, setLoadingMPartNumbers] = useState(true);
  const [uomData, setUomData] = useState([]);
  const [loadingUOMData, setLoadingUOMData] = useState(true);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [loadingManfacturerData, setLoadingManufacturerData] = useState(true);
  const [editCountryOfOrigin, setEditCountryOfOrigin] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [countries, setCountries] = useState([]);
  const [shortDescription, setShortDescription] = useState("");
  const [editSubsystem, setEditSubsystem] = useState(null);
  const [editPartLevel, setEditPartLevel] = useState(null);
  const [subSystemData, setSubSystemData] = useState([]);
  const [loadingSubSystemData, setLoadingSubSystemData] = useState(true);
  const [partLevelData, setPartLevelData] = useState([]);
  const [loadingPartLevelData, setLoadingPartLevelData] = useState(true);
  const [gradeTypes, setGradeTypes] = useState([]);
  const [loadingGradeTypes, setLoadingGradeTypes] = useState(true);
  const [editGrade, setEditGrade] = useState(null);
  const [showCustomGrade, setShowCustomGrade] = useState(false);
  const [customGrade, setCustomGrade] = useState("");
  const [editSpecification, setEditSpecification] = useState("");
  const [editPackage, setEditPackage] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editRadiationTolerance, setEditRadiationTolerance] = useState("");
  const [editTempRange, setEditTempRange] = useState("");
  const [editTempCoefficient, setEditTempCoefficient] = useState("");

  useEffect(() => {
    const fetchPartLevelData = async () => {
      setLoadingPartLevelData(true);
      try {
        const data = await fetchPartLevelLookup();
        setPartLevelData(data);
      } catch (error) {
        Alert("Error fetching Part Level data", "error");
        console.error("Failed to load part levels:", error);
      } finally {
        setLoadingPartLevelData(false);
      }
    };

    fetchPartLevelData();
  }, []);

  useEffect(() => {
    const fetchSubSystemData = async () => {
      setLoadingSubSystemData(true);
      try {
        const data = await fetchSubsystemsLookup();
        setSubSystemData(data);
      } catch (error) {
        Alert("Error fetching Subsystem data", "error");
        console.error("Failed to load subsystems:", error);
      } finally {
        setLoadingSubSystemData(false);
      }
    };

    fetchSubSystemData();
  }, []);

  useEffect(() => {
    const fetchManufacturersData = async () => {
      setLoadingManufacturerData(true);
      try {
        const data = await fetchManufacturers();
        setManufacturerOptions(data);
      } catch (error) {
        Alert("Error fetching Manufacturer data", "error");
        console.error("Failed to load manufacturers:", error);
      } finally {
        setLoadingManufacturerData(false);
      }
    };

    fetchManufacturersData();
  }, []);

  useEffect(() => {
    const fetchCountriesData = async () => {
      if (countries.length === 0) {
        setLoadingCountries(true);
        try {
          const countriesData = await fetchCountryLookUp();
          setCountries(countriesData || []);
        } catch (error) {
          console.error("Failed to fetch countries:", error);
          setCountries([]);
        } finally {
          setLoadingCountries(false);
        }
      }
    };
    fetchCountriesData();
  }, []);

  const fieldMapping = [
    { setter: setEditPartName, key: "name", from: "part" },
    { setter: setShortDescription, key: "shortDescription", from: "part" },
    { setter: setEditPartNumber, key: "number", from: "part" },
    { setter: setEditMakeOrBuy, key: "makeBuy", from: "part" },
    { setter: setEditWeight, key: "weight", from: "part" },
    { setter: setEditType, key: "partType", from: "part" },
    {
      setter: setSerialNumberRequiredValue,
      key: "isSerialNumberRequired",
      from: "part",
    },
    { setter: setEditUom, key: "unitOfMeasure", from: "root" },
    { setter: setIsParentPart, key: "hasBom", from: "part" },
    {
      setter: setEditManufacturingPartNumber,
      key: "manufacturingPartNumber",
      from: "part",
    },
    { setter: setEditUnitPrice, key: "unitPrice", from: "part" },
    { setter: setPreviewImageUrl, key: "imageUrl", from: "root" },
    { setter: setDescription, key: "description", from: "part" },
    { setter: setReferenceNumber, key: "referenceNumber", from: "part" },
    { setter: setEditManufacturerName, key: "manufacturerName", from: "part" },
    { setter: setEditTRL, key: "trl", from: "part" },
    { setter: setEditCountryOfOrigin, key: "countryOfOrigin", from: "part" },
    { setter: setSpaceQualified, key: "spaceQualified", from: "part" },
    { setter: setMaterial, key: "material", from: "part" },
    { setter: setEditSubsystem, key: "subSystem", from: "root" },
    { setter: setEditPartLevel, key: "partLevel", from: "root" },
    { setter: setEditSpecification, key: "specification", from: "part" },
    { setter: setEditPackage, key: "package", from: "part" },
    { setter: setEditQualification, key: "qualification", from: "part" },
    {
      setter: setEditRadiationTolerance,
      key: "radiationTolerance",
      from: "part",
    },
    { setter: setEditTempRange, key: "tempRange", from: "part" },
    { setter: setEditTempCoefficient, key: "tempCoefficient", from: "part" },
  ];

  useEffect(() => {
    fetchAllBuyPartsData();
    handleFetchUOMData();
  }, []);

  const handleFetchUOMData = async () => {
    setLoadingUOMData(true);
    try {
      const data = await fetchUnitOfMeasureLookUp();
      if (data) {
        setUomData(data);
      }
    } catch (error) {
      Alert("Error fetching Unit of Measure data", "error");
    } finally {
      setLoadingUOMData(false);
    }
  };
  const fetchAllBuyPartsData = async () => {
    setLoadingMPartNumbers(true);
    try {
      const data = await fetchAllBuyParts();

      const allManufacturingPartNumbers = data
        .map((part) => part.manufacturingPartNumber)
        .filter(
          (num) => num !== null && num !== undefined && num.trim() !== "",
        );

      setManufacturingPartNumbers(allManufacturingPartNumbers);
    } catch (error) {
      Alert("Error fetching All Parts data", "error");
    } finally {
      setLoadingMPartNumbers(false);
    }
  };

  const initializeFields = (partData) => {
    fieldMapping.forEach(({ setter, key, from }) => {
      const value = from === "part" ? partData.part[key] : partData[key];
      setter(value ?? "");
    });
  };
  const getGradeState = (partGrade, gradeTypes) => {
    const isCustomGrade =
      partGrade && !gradeTypes.find((g) => g.name === partGrade);
    return {
      editGrade: isCustomGrade ? "Others" : partGrade || null,
      showCustomGrade: isCustomGrade,
      customGrade: isCustomGrade ? partGrade : "",
    };
  };

  useEffect(() => {
    if (selectedPart) {
      initializeFields(selectedPart);

      const gradeState = getGradeState(selectedPart?.part?.grade, gradeTypes);
      setEditGrade(gradeState.editGrade);
      setShowCustomGrade(gradeState.showCustomGrade);
      setCustomGrade(gradeState.customGrade);
    }
  }, [selectedPart, gradeTypes]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const response = await fetchOptionSetByName("part_materials");
      setMaterials(response ? JSON.parse(response.values) : []);
    } catch (error) {
      Alert("Error fetching Material Types data", "error");
      console.error("Error fetching Material Types:", error);
    } finally {
      setMaterialsLoading(false);
    }
  };
  useEffect(() => {
    fetchGradeTypes();
  }, []);

  const fetchGradeTypes = async () => {
    setLoadingGradeTypes(true);
    try {
      const response = await fetchOptionSetByName("grade_types");
      const parsed = response ? JSON.parse(response.values) : [];
      setGradeTypes(parsed);
    } catch (error) {
      Alert("Error fetching Grade Types data", "error");
    } finally {
      setLoadingGradeTypes(false);
    }
  };

  const revisePart = async () => {
    if (!hasPermission(PERMISSIONS.PARTS.REVISE)) {
      Alert("You don't have permission to revise a Part", "warning");
      return;
    }
    setLoadingData(true);
    try {
      await revisePartById(selectedId);
      Alert("Part Revised Successfully..!", "success");
      fetchPartVersionsData();
      handleRefresh();
    } catch (error) {
      Alert("Couldn't Revise Part ...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPartVersionsData();
  }, []);

  const fetchPartVersionsData = async () => {
    setLoadingData(true);
    try {
      const data = await fetchPartVersions(selectedPartNumberSuffix);

      if (data.length > 0) {
        const sortedData = [...data].sort((a, b) =>
          b.part.version.localeCompare(a.part.version, undefined, {
            numeric: true,
          }),
        );
        setPartVersionsData(sortedData);
        const defaultPart =
          sortedData.find(
            (item) => item.part.partNumber === selectedPartNumber,
          ) ||
          sortedData[0] ||
          null;

        setSelectedPart(defaultPart);

        if (defaultPart) {
          initializeFields(defaultPart);
        }
      } else {
        setPartVersionsData([]);
        setSelectedPart(null);
      }
    } catch (error) {
      Alert("Error fetching parts versions data", "error");
      console.error("Error fetching part versions:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (selectedPart) {
      fetchData();
    }
  }, [selectedId, selectedPart]);

  const fetchData = async () => {
    try {
      const guideVersions = await fetchGuideVersionsWithPartId(selectedId);
      if (guideVersions?.length > 0) {
        setCanPartDelete(false);
      }
    } catch (error) {
      Alert("Error fetching guide data", "error");
      console.error("Error fetching parts data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCapture = async (imageSrc) => {
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const file = new File([blob], "captured-image.jpg", {
        type: "image/jpeg",
      });
      handleUpdatePicture(selectedId, file);
      setCameraOpen(false);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  const handleResetClick = () => {
    if (selectedPart) {
      setEditPartName(selectedPart?.part?.name);
      setEditPartNumber(selectedPart?.part?.number);
      setEditType(selectedPart?.part?.partType);
      setEditWeight(selectedPart?.part?.weight);
      setEditMakeOrBuy(selectedPart?.part?.makeBuy);
      setEditUom(selectedPart.unitOfMeasure);
      setEditManufacturingPartNumber(
        selectedPart?.part?.manufacturingPartNumber || "",
      );
      setEditUnitPrice(selectedPart?.part?.unitPrice);
      setEditPartNumberError("");
      setEditPartNameError("");
      setEditManufacturingPartNumberError("");
      setEditTypeError("");
      setEditWeightError("");
      setPreviewImageUrl(selectedPart?.imageUrl || NoImagePNG);
      setSelectedImageFile(null);

      setDescription(selectedPart?.part?.description || "");
      setReferenceNumber(selectedPart?.part?.referenceNumber || "");
      setEditSpaceQualifiedError("");
      setEditTRL(selectedPart?.part?.trl || "");
      setEditManufacturerName(selectedId?.part?.manufacturerName || "");
      setEditCountryOfOrigin(selectedPart?.part?.countryOfOrigin || "");
      setEditSerialNumberRequiredError("");
      setShortDescription(selectedPart?.part?.shortDescription || "");
      const gradeState = getGradeState(selectedPart?.part?.grade, gradeTypes);
      setEditGrade(gradeState.editGrade);
      setShowCustomGrade(gradeState.showCustomGrade);
      setCustomGrade(gradeState.customGrade);
    }
  };

  const validateEditPartFields = () => {
    let valid = true;

    if (!editPartName) {
      setEditPartNameError("Part Name is required");
      valid = false;
    } else if (editPartName.length > 250) {
      setEditPartNameError("Part Name must be at most 250 characters long");
      valid = false;
    } else {
      setEditPartNameError("");
    }

    if (!editType) {
      setEditTypeError("Part Type is required");
      valid = false;
    } else {
      setEditTypeError("");
    }

    if (selectedPart?.part?.makeBuy === 1) {
      if (!editManufacturingPartNumber) {
        setEditManufacturingPartNumberError(
          "Manufacturing Part Number is required",
        );
        valid = false;
      } else if (
        manufacturingPartNumbers.some(
          (num) =>
            normalizePartNumber(num) ===
            normalizePartNumber(editManufacturingPartNumber),
        ) &&
        normalizePartNumber(editManufacturingPartNumber) !==
          normalizePartNumber(selectedPart?.part?.manufacturingPartNumber ?? "")
      ) {
        setEditManufacturingPartNumberError(
          "Manufacturing Part Number already exists.",
        );
        valid = false;
      } else {
        setEditManufacturingPartNumberError("");
      }
      if (!editManufacturerName) {
        setEditManufacturerNameError("Manufacturer is required");
        valid = false;
      }
    }
    // Space Qualified must be selected
    if (
      spaceQualified === "" ||
      spaceQualified === null ||
      spaceQualified === undefined
    ) {
      setEditSpaceQualifiedError("Space Qualified selection is required");
      valid = false;
    } else {
      setEditSpaceQualifiedError("");
    }

    // Serial Number Required must be selected
    if (
      serialNumberRequiredValue === "" ||
      serialNumberRequiredValue === null ||
      serialNumberRequiredValue === undefined
    ) {
      setEditSerialNumberRequiredError("Serial Number selection is required");
      valid = false;
    } else {
      setEditSerialNumberRequiredError("");
    }

    if (!editUom) {
      setEditUomError("Unit of Measure is required");
      valid = false;
    } else {
      setEditUomError("");
    }

    if (editWeight === null || editWeight === "") {
      setEditWeightError("Weight cannot be empty.");
      valid = false;
    } else if (isNaN(Number(editWeight))) {
      setEditWeightError("Weight must be a valid number.");
      valid = false;
    } else if (Number(editWeight) < 0) {
      setEditWeightError("Weight must be a non-negative number.");
      valid = false;
    } else {
      setEditWeightError("");
    }

    if (editTRL !== "" && editTRL !== null && editTRL !== undefined) {
      const trlValue = Number(editTRL);
      if (isNaN(trlValue) || trlValue < 1 || trlValue > 12) {
        setEditTRLError("TRL must be a number between 1 and 12");
        valid = false;
      } else {
        setEditTRLError("");
      }
    } else {
      setEditTRLError("");
    }

    return valid;
  };

  const getMakeBuyLabel = (value) => {
    if (value === 0) {
      return "Make";
    } else if (value === 1) {
      return "Buy";
    } else {
      return "Unknown";
    }
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditPartFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);
    const updatedPart = {
      name: capitalizeFirstLetter(editPartName),
      number: editPartNumber,
      partTypeId: editType?.id,
      weight: editWeight,
      unitOfMeasureId: editUom?.id || null,
      makeBuy: editMakeOrBuy,
      isSerialNumberRequired: serialNumberRequiredValue,
      manufacturingPartNumber: editManufacturingPartNumber || null,
      unitPrice: editUnitPrice || null,
      description: description || null,
      referenceNumber: referenceNumber || null,
      manufacturerName: editManufacturerName || null,
      trl: editTRL || null,
      countryOfOriginId: editCountryOfOrigin?.id || null,
      spaceQualified: spaceQualified,
      material: material || null,
      grade: showCustomGrade ? customGrade : editGrade,
      shortDescription: shortDescription || null,
      subsystemId: editSubsystem?.id,
      partLevelId: editPartLevel?.id,
      specification: editSpecification || null,
      package: editPackage || null,
      qualification: editQualification || null,
      radiationTolerance: editRadiationTolerance || null,
      tempRange: editTempRange || null,
      tempCoefficient: editTempCoefficient || null,
    };
    try {
      await updatePart(selectedId, updatedPart);
      if (selectedImageFile) {
        await handleUpdatePicture(selectedId, selectedImageFile);
      }
      handleRefresh();
      handleCloseClick();
      Alert("Updated Part Details Successfully...!", "success");
    } catch (error) {
      Alert("Couldn't Update Part Details.. Try Again..!", "error");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };
  const handleUpdatePicture = async (selectedId, selectedImageFile) => {
    if (!selectedImageFile) return;
    const tempImageUrl = URL.createObjectURL(selectedImageFile);
    const formData = new FormData();
    formData.append("imageFile", selectedImageFile);
    let fileExtension = "png";
    if (selectedImageFile.name) {
      fileExtension = selectedImageFile.name.split(".").pop() || "png";
    } else if (selectedImageFile.type) {
      fileExtension = selectedImageFile.type.split("/").pop();
    }
    formData.append("ImageType", fileExtension);
    try {
      await updatePartwithImage(selectedId, formData);
      setPreviewImageUrl(tempImageUrl);
      Alert("Image Edited Successfully..!", "success");
    } catch (error) {
      Alert("Couldn't Edit Image...!", "error");
      console.error("Error updating image:", error);
    }
  };

  const EditPartDrawerClose = () => {
    setReadOnlyMode(true);
    handleCloseClick();
    handleClose();
    setEditFlyOutTabsValue("1");
  };

  const editFlyoutTabChange = (event, newValue) => {
    setEditFlyOutTabsValue(newValue);
    if (newValue === "1") {
      setReadOnlyMode(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedImageFile(file);
    setReadOnlyMode(false);
    e.target.value = null;
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImageUrl(imageUrl);
    } else {
      setPreviewImageUrl(selectedPart?.part?.imageUrl || NoImagePNG);
    }
  };

  const handlePreviewClick = () => {
    if (readOnlyMode && previewImageUrl === NoImagePNG) {
      Alert("Please Upload an Image First", "error");
      return;
    }
    if (!readOnlyMode && previewImageUrl === NoImagePNG) {
      if (fileInputRef.current) {
        fileInputRef.current.click();
        return;
      }
    } else {
      setPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
  };

  const InventoryAccesableRoles = ["Super Admin", "SCM Manager", "SCM Staff"];
  const isBuyPart = selectedPart?.part?.makeBuy === 1;

  const isReviseLoading = loadingData || selectedPart?.part?.makeBuy == null;
  return (
    <div className="EditFlyout">
      {loadingData || loadingMPartNumbersData ? (
        <div className="loading-container">
          <Cliploader loading={true} />
        </div>
      ) : (
        <>
          <div className="EditFlyoutHeader">
            <div className="EditFlyoutHeader1">
              <p>{selectedPart?.part?.name}</p>{" "}
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <Autocomplete
                value={selectedPart}
                options={partVersionsData}
                getOptionLabel={(option) => option?.part?.partNumber}
                onChange={(e, value) => setSelectedPart(value)}
                className="AdminTextFeilds"
                fullWidth
                size="small"
                clearIcon={null}
                renderInput={(params) => (
                  <TextField {...params} label="Revision" fullWidth />
                )}
              />
            </div>

            <div className="EditFlyoutHeaderIcons">
              {selectedPart?.eco?.number ? (
                <div
                  className="AppHyperLink"
                  onClick={() => {
                    if (!hasPermission(PERMISSIONS.ECO.VIEW)) {
                      Alert(
                        "You don't have permission to view an ECO",
                        "warning",
                      );
                      return;
                    }
                    navigate("/plm/eco", {
                      state: { selectedPart },
                    });
                  }}
                >
                  {selectedPart?.eco?.number}
                </div>
              ) : (
                <p>ECO:</p>
              )}{" "}
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <p className="EditPartHeaderMakeBuy">
                Make/Buy: {selectedPart?.part?.makeBuy === 0 ? "Make" : "Buy"}
              </p>
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <p className="EditPartHeaderStatus">
                Status:{" "}
                {selectedPart?.part?.status === "Draft"
                  ? " "
                  : selectedPart?.part?.status}
              </p>{" "}
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <Button
                title={!isParentPart ? "NO BOM" : "Clone BOM"}
                className="CloneBOMButton"
                startIcon={<FileCopyIcon />}
                onClick={() => {
                  if (!hasPermission(PERMISSIONS.PARTS.BOM.CLONE)) {
                    Alert(
                      "You don't have permission to clone a BOM",
                      "warning",
                    );
                    return;
                  }
                  if (!isParentPart) {
                    Alert(
                      "Cannot Clone BOM from a Part without a BOM",
                      "error",
                    );
                    return;
                  }

                  setCloneBOMBoxStatus(true);
                }}
              >
                Clone BOM
              </Button>{" "}
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              {editFlyOutTabsValue === "1" &&
                selectedPart?.part?.status === "Draft" && (
                  <button
                    onClick={() => {
                      if (!hasPermission(PERMISSIONS.PARTS.MODIFY)) {
                        Alert(
                          "You don't have permission to edit a Part",
                          "warning",
                        );
                        return;
                      }
                      setReadOnlyMode(false);
                    }}
                  >
                    <ion-icon name="create-outline"></ion-icon>
                  </button>
                )}
              <button onClick={EditPartDrawerClose}>
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>
          </div>
          <TabContext value={editFlyOutTabsValue}>
            <div className="EditFlyoutTabsPanel">
              <TabList
                centered={true}
                onChange={editFlyoutTabChange}
                aria-label="lab API tabs example"
                variant="fullWidth"
              >
                <Tab label="Details" value="1" fullWidth />
                {hasPermission(PERMISSIONS.PARTS.BOM.VIEW) && (
                  <Tab label="BOM" value="2" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.DOCUMENTS.VIEW) && (
                  <Tab label="Documents" value="3" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.WHEREUSED.VIEW) && (
                  <Tab label="Where Used" value="4" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.INVENTORY.VIEW) && (
                  <Tab label="Inventory" value="5" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.TRANSACTIONS.VIEW) && (
                  <Tab label="Transactions" value="6" fullWidth />
                )}
              </TabList>
            </div>
            <>
              <TabPanel value="1" className="EditFlyoutTabPanel">
                <div
                  className={
                    !readOnlyMode || selectedPart?.part?.status === "Release"
                      ? "EditFlyoutContentWithFooter"
                      : "EditFlyoutContent"
                  }
                >
                  <div className="FlyoutContentLeft">
                    <div className="GrnNewFlyoutContentTop">
                      <TextField
                        label="Part Number"
                        name="partNumber"
                        value={selectedPart?.part?.partNumber || ""}
                        disabled
                        className="AdminTextFeilds"
                        fullWidth
                      />

                      <Autocomplete
                        disabled
                        value={editType || null}
                        getOptionLabel={(option) => option.name}
                        freeSolo
                        className="AdminTextFeilds"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Part Type"
                            error={!!editTypeError}
                            helperText={editTypeError}
                            required
                          />
                        )}
                        fullWidth
                      />
                    </div>

                    <div className="GrnNewFlyoutContentTop">
                      <TextField
                        label="Part Name"
                        className="AdminTextFeilds"
                        value={editPartName}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => setEditPartName(e.target.value)}
                        error={!!editPartNameError}
                        helperText={editPartNameError}
                        fullWidth
                      />
                      <TextField
                        label="Enter a brief description"
                        className="AdminTextFeilds"
                        value={shortDescription}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => setShortDescription(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div className="GrnNewFlyoutContentTop">
                      {selectedPart?.part?.makeBuy === 1 && (
                        <>
                          <TextField
                            label="Manufacturing Part Number"
                            name="manufacturingPartNumber"
                            className="AdminTextFeilds"
                            value={editManufacturingPartNumber}
                            InputProps={{ readOnly: readOnlyMode }}
                            onChange={(e) => {
                              const value = e.target.value.trim();
                              setEditManufacturingPartNumber(value);
                              if (value === "") {
                                setEditManufacturingPartNumberError(
                                  "Manufacturing Part Number is required",
                                );
                              } else if (
                                manufacturingPartNumbers.some(
                                  (num) =>
                                    normalizePartNumber(num) ===
                                    normalizePartNumber(value),
                                ) &&
                                normalizePartNumber(value) !==
                                  normalizePartNumber(
                                    selectedPart?.part
                                      ?.manufacturingPartNumber ?? "",
                                  )
                              ) {
                                setEditManufacturingPartNumberError(
                                  "Manufacturing Part Number already exists.",
                                );
                              } else {
                                setEditManufacturingPartNumberError("");
                              }
                            }}
                            required
                            fullWidth
                            error={!!editManufacturingPartNumberError}
                            helperText={editManufacturingPartNumberError}
                          />
                          <Autocomplete
                            freeSolo
                            fullWidth
                            options={manufacturerOptions}
                            value={editManufacturerName || ""}
                            inputValue={editManufacturerName || ""}
                            readOnly={readOnlyMode}
                            loading={loadingManfacturerData}
                            onInputChange={(event, newInputValue) => {
                              if (readOnlyMode) return;

                              setEditManufacturerName(newInputValue);

                              if (newInputValue === "") {
                                setEditManufacturerNameError(
                                  "Manufacturer is required",
                                );
                              } else {
                                setEditManufacturerNameError("");
                              }
                            }}
                            onChange={(event, newValue) => {
                              if (readOnlyMode) return;

                              setEditManufacturerName(newValue || "");

                              if (!newValue) {
                                setEditManufacturerNameError(
                                  "Manufacturer is required",
                                );
                              } else {
                                setEditManufacturerNameError("");
                              }

                              if (
                                newValue &&
                                !manufacturerOptions.includes(newValue)
                              ) {
                                setManufacturerOptions((prev) => [
                                  ...prev,
                                  newValue,
                                ]);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Manufacturer"
                                className="AdminTextFeilds"
                                required
                                error={!!editManufacturerNameError}
                                helperText={editManufacturerNameError}
                              />
                            )}
                          />
                        </>
                      )}
                    </div>
                    <div className="GrnNewFlyoutContentTop">
                      <Autocomplete
                        value={editUom || null}
                        onChange={(event, newValue) => {
                          if (newValue && newValue.newUomValue) {
                            handleAddUom(event, newValue);
                          } else if (newValue === null || newValue === "") {
                            setEditUomError("Unit of Measure is required");
                          } else {
                            setEditUom(newValue);
                          }
                        }}
                        loading={loadingUOMData}
                        loadingText="Loading Unit of Measure..."
                        readOnly={readOnlyMode}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        options={uomData}
                        getOptionLabel={(option) => option.name}
                        renderOption={(props, option, index) => (
                          <MenuItem {...props} key={option.id || index}>
                            {option.name}
                          </MenuItem>
                        )}
                        freeSolo
                        className="AdminTextFeilds"
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Unit Of Measure"
                            required
                            error={!!editUomError}
                            helperText={editUomError}
                          />
                        )}
                        fullWidth
                      />

                      <TextField
                        label="TRL #"
                        className="AdminTextFeilds"
                        type="number"
                        value={editTRL ?? ""}
                        InputProps={{ readOnly: readOnlyMode }}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditTRL(value);

                          if (value === "") {
                            setEditTRLError("");
                          } else if (
                            isNaN(value) ||
                            Number(value) < 1 ||
                            Number(value) > 12
                          ) {
                            setEditTRLError(
                              "TRL # must be a number between 1 and 12",
                            );
                          } else {
                            setEditTRLError("");
                          }
                        }}
                        error={!!editTRLError}
                        helperText={editTRLError}
                        inputProps={{ min: 1, max: 12 }}
                        fullWidth
                      />
                    </div>
                    <div className="GrnNewFlyoutContentTop">
                      <TextField
                        label="Weight (g)"
                        className="AdminTextFeilds"
                        placeholder="Enter weight in grams"
                        type="number"
                        error={!!editWeightError}
                        helperText={editWeightError}
                        value={editWeight}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEditWeight(value);
                          if (value === "" || Number(value) >= 0) {
                            setEditWeightError("");
                          } else {
                            setEditWeightError(
                              "Weight must be 0 or a positive value",
                            );
                          }
                        }}
                        fullWidth
                      />
                      <Autocomplete
                        options={countries}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) =>
                          option && value && option.id === value.id
                        }
                        loading={loadingCountries}
                        loadingText="Loading Countries..."
                        value={
                          countries.find(
                            (country) => country.id === editCountryOfOrigin?.id,
                          ) || null
                        }
                        readOnly={readOnlyMode}
                        onChange={(event, newValue) => {
                          setEditCountryOfOrigin(newValue ? newValue : null);
                        }}
                        className="AdminTextFeilds"
                        fullWidth
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Country of Origin"
                            className="AdminTextFeilds"
                          />
                        )}
                      />
                    </div>

                    {/* <TextField
                      label="Reference Number"
                      className="AdminTextFeilds"
                      value={referenceNumber}
                      InputProps={{ readOnly: readOnlyMode }}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      fullWidth
                    /> */}

                    <div className="GrnNewFlyoutContentTop">
                      <Autocomplete
                        options={subSystemData || []}
                        getOptionLabel={(option) => option?.name || ""}
                        isOptionEqualToValue={(option, value) =>
                          option && value && option.id === value.id
                        }
                        loading={loadingSubSystemData}
                        loadingText="Loading Subsystems..."
                        value={
                          subSystemData.find(
                            (item) => item.id === editSubsystem?.id,
                          ) || null
                        }
                        readOnly={readOnlyMode}
                        onChange={(event, newValue) => {
                          setEditSubsystem(newValue || null);
                        }}
                        className="AdminTextFeilds"
                        fullWidth
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Subsystem"
                            className="AdminTextFeilds"
                          />
                        )}
                      />
                      <Autocomplete
                        value={
                          materials?.find((m) => m.name === material) || null
                        }
                        loading={materialsLoading}
                        loadingText="Loading Materials..."
                        readOnly={readOnlyMode}
                        onChange={(event, newValue) => {
                          setMaterial(newValue?.name || "");
                        }}
                        options={materials || []}
                        getOptionLabel={(option) => option?.name || ""}
                        isOptionEqualToValue={(option, value) =>
                          option?.name === value?.name
                        }
                        renderOption={(props, option) => (
                          <MenuItem {...props} key={option.name}>
                            {option.name}
                          </MenuItem>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Material"
                            className="AdminTextFeilds"
                          />
                        )}
                        fullWidth
                      />
                    </div>

                    <div className="GrnNewFlyoutContentTop">
                      <TextField
                        label="Specification"
                        className="AdminTextFeilds"
                        value={editSpecification}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => {
                          setEditSpecification(e.target.value);
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Radiation Tolerance"
                        className="AdminTextFeilds"
                        value={editRadiationTolerance}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => {
                          setEditRadiationTolerance(e.target.value);
                        }}
                        fullWidth
                      />
                    </div>
                    <div className="GrnNewFlyoutContentTop">
                      <TextField
                        label="Package"
                        className="AdminTextFeilds"
                        value={editPackage}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => {
                          setEditPackage(e.target.value);
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Qualification"
                        className="AdminTextFeilds"
                        value={editQualification}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => {
                          setEditQualification(e.target.value);
                        }}
                        fullWidth
                      />
                    </div>
                    <div className="GrnNewFlyoutContentTop">
                      <TextField
                        label="Temperature Range"
                        className="AdminTextFeilds"
                        value={editTempRange}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => {
                          setEditTempRange(e.target.value);
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Temperature Coefficient"
                        className="AdminTextFeilds"
                        value={editTempCoefficient}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => {
                          setEditTempCoefficient(e.target.value);
                        }}
                        fullWidth
                      />
                    </div>

                    <div className="GrnNewFlyoutContentTop">
                      <Autocomplete
                        value={
                          gradeTypes.find((g) => g.name === editGrade) || null
                        }
                        loading={loadingGradeTypes}
                        options={gradeTypes}
                        getOptionLabel={(option) => option?.name || ""}
                        isOptionEqualToValue={(o, v) => o?.name === v?.name}
                        readOnly={readOnlyMode}
                        onChange={(event, newValue) => {
                          if (newValue?.name === "Others") {
                            setShowCustomGrade(true);
                            setEditGrade("Others");
                          } else {
                            setShowCustomGrade(false);
                            setEditGrade(newValue?.name || null);
                            setCustomGrade("");
                          }
                        }}
                        className="AdminTextFeilds"
                        fullWidth
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Grade"
                            placeholder="Select grade (optional)"
                          />
                        )}
                      />
                      {showCustomGrade && (
                        <TextField
                          label="Custom Grade"
                          className="AdminTextFeilds"
                          value={customGrade}
                          InputProps={{ readOnly: readOnlyMode }}
                          onChange={(e) => setCustomGrade(e.target.value)}
                          fullWidth
                        />
                      )}
                    </div>
                    <div className="GrnNewFlyoutContentTopgap">
                      {/* DESCRIPTION */}
                      <TextField
                        label="Description"
                        className="AdminTextFeilds"
                        multiline
                        rows={4}
                        value={description}
                        InputProps={{ readOnly: readOnlyMode }}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div className="test-container">
                      {/* RADIO ROW */}
                      <div className="formFieldInline">
                        <div
                          className={`SerialNumberRequiredDiv ${editSpaceQualifiedError ? "error" : ""}`}
                        >
                          <label className="radioLabel">
                            Space Qualified:{" "}
                            <span className="required-asterisk">*</span>
                          </label>

                          <RadioGroup
                            row
                            value={spaceQualified}
                            onChange={(e) => {
                              setSpaceQualified(e.target.value === "true");
                              setEditSpaceQualifiedError("");
                              setReadOnlyMode(false);
                            }}
                            disabled={readOnlyMode}
                          >
                            <div className="yesno-container">
                              <FormControlLabel
                                value="true"
                                control={<Radio />}
                                label="Yes"
                              />
                              <FormControlLabel
                                value="false"
                                control={<Radio />}
                                label="No"
                              />
                            </div>
                          </RadioGroup>
                        </div>

                        <div
                          className={`SerialNumberRequiredDiv ${editSerialNumberRequiredError ? "error" : ""}`}
                        >
                          <label className="radioLabel">
                            Serial Number Required:{" "}
                            <span className="required-asterisk">*</span>
                          </label>

                          <RadioGroup
                            row
                            value={serialNumberRequiredValue}
                            onChange={(e) => {
                              setSerialNumberRequiredValue(
                                e.target.value === "true",
                              );
                              setEditSerialNumberRequiredError("");
                              setReadOnlyMode(false);
                            }}
                            disabled={readOnlyMode}
                          >
                            <div className="yesno-container">
                              <FormControlLabel
                                value="true"
                                control={<Radio />}
                                label="Yes"
                              />
                              <FormControlLabel
                                value="false"
                                control={<Radio />}
                                label="No"
                              />
                            </div>
                          </RadioGroup>
                        </div>
                      </div>

                      {/* IMAGE BOX */}
                      <div className="EditPartImageBlock">
                        <img
                          onClick={handlePreviewClick}
                          src={previewImageUrl || NoImagePNG}
                          alt={selectedPart?.part?.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = NoImagePNG;
                          }}
                        />

                        <div className="EditPartImageControls">
                          {!readOnlyMode && (
                            <div className="NewPartIconsContainer">
                              <label htmlFor="image-input">
                                <Button
                                  component="span"
                                  className="NewPartIcon"
                                >
                                  <AttachFileIcon className="small-icon" />

                                  <input
                                    id="image-input"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                  />
                                </Button>
                              </label>

                              <Button
                                onClick={() => setCameraOpen(true)}
                                className="NewPartIcon"
                              >
                                <ion-icon name="camera-outline"></ion-icon>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {cameraOpen && (
                      <CameraComponent
                        onSave={handleCapture}
                        onClose={() => setCameraOpen(false)}
                      />
                    )}
                  </div>
                </div>
                {readOnlyMode ? (
                  <div className="EditPartReviseButtonDiv">
                    {selectedPart?.part?.id === partVersionsData[0]?.part?.id &&
                      selectedPart?.part?.status === "Release" && (
                        <Tooltip
                          title={isBuyPart ? "Buy parts cannot be revised" : ""}
                        >
                          <span>
                            <Button
                              className="EditPartReviseButton"
                              onClick={revisePart}
                              disabled={isBuyPart || isReviseLoading}
                            >
                              Revise Part
                            </Button>
                          </span>
                        </Tooltip>
                      )}
                  </div>
                ) : (
                  <div className="EditFlyoutFooterParts">
                    <div className="update-reset">
                      <Button
                        className="CancelButton"
                        onClick={handleResetClick}
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={handleEditSubmit}
                        disabled={loadingData || !!editPartNumberError}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                )}
              </TabPanel>
              <TabPanel value="2">
                <ChildPart
                  selectedId={selectedId}
                  canEdit={selectedPart?.part?.status === "Draft"}
                  setIsParentPart={setIsParentPart}
                  selectedPart={selectedPart}
                  handleClose={handleClose}
                />
              </TabPanel>
              <TabPanel value="3">
                <Documents
                  entityId={selectedId}
                  entityType="Part"
                  canDelete={
                    selectedPart?.part?.status == "Draft" &&
                    hasPermission(PERMISSIONS.PARTS.DOCUMENTS.DELETE)
                  }
                  canEdit={hasPermission(PERMISSIONS.PARTS.DOCUMENTS.MODIFY)}
                  isDraft={selectedPart?.part?.status == "Draft"}
                />
              </TabPanel>
              <TabPanel value="4">
                <PartUsedIn selectedPartId={selectedId} />
              </TabPanel>{" "}
              <TabPanel value="5" style={{ padding: 0, margin: 0 }}>
                <PartInventory selectedPartId={selectedId} />
              </TabPanel>
              <TabPanel value="6" style={{ padding: 0, margin: 0 }}>
                <InventoryTransaction partId={selectedId} />
              </TabPanel>
            </>
          </TabContext>

          <ImagePreviewDrawer
            open={previewOpen}
            imageUrl={previewImageUrl}
            onClose={closePreview}
          />

          <CloneBOM
            isOpen={cloneBOMBoxStatus}
            onClose={() => setCloneBOMBoxStatus(false)}
            selectedPart={selectedPart}
          />
          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default EditPart;
