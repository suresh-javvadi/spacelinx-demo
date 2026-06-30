import React, { useState, useEffect, useContext, useRef } from "react";
import {
  TextField,
  MenuItem,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { fetchPartTypesLookUp } from "../../../services/partTypeService";
import {
  createPart,
  fetchAllBuyParts,
  fetchManufacturers,
  updatePartwithImage,
} from "../../../services/partService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
import CameraComponent from "../../materialKits/CameraComponent";
import { styled, useTheme } from "@mui/material/styles";
import "../admin.css";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import noImageDark from "../../../Assest/Images/noimagelarge/noimagedarkmode.png";
import noimagelightmode from "../../../Assest/Images/noimagelarge/noimagelightmode.jpg";
import { fetchOptionSetByName } from "../../../services/optionSetService";
import { fetchUnitOfMeasureLookUp } from "../../../services/unitOfMeasureService";
import { fetchSubsystemsLookup } from "../../../services/subsystemService";
import { fetchPartLevelLookup } from "../../../services/partLevelService";
import "../admin.css";

const HiddenInput = styled("input")({
  display: "none",
});

const NewPart = ({ handleCloseClick, handleRefresh }) => {
  const { Alert } = useContext(AlertsContext);
  const [formValues, setFormValues] = useState({
    partName: "",
    partType: null,
    makeOrBuy: "0",
    uom: "",
    serialNumberRequiredValue: false,
    spaceQualified: true,
    manufacturingPartNumber: "",
    unitPrice: "",
    trl: "",
    manufacturerName: "",
    material: null,
    shortDescription: "",
    subsystem: null,
    partLevel: null,
    grade: null,
    customGrade: "",
    specification: "",
    package: "",
    qualification: "",
    radiationTolerance: "",
    tempRange: "",
    tempCoefficient: "",
    hsnCode: "",
  });
  const fileInputRef = useRef(null);

  const capitalizeFirstLetter = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const normalizePartNumber = (num) =>
    num.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const [loadingData, setLoadingData] = useState(false);
  const [partTypes, setPartTypes] = useState([]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const theme = useTheme();
  const NoImagePNG =
    theme.palette.mode === "dark" ? noImageDark : noimagelightmode;
  const [loadingPartTypesData, setLoadingPartTypesData] = useState(false);
  const [materials, setMaterials] = useState(null);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [manufacturingPartNumbers, setManufacturingPartNumbers] = useState([]);
  const [loadingMPartNumbersData, setLoadingMPartNumbers] = useState(true);
  const [uomData, setUomData] = useState([]);
  const [loadingUOMData, setLoadingUOMData] = useState(true);
  const [loadingManfacturerData, setLoadingManfacturerData] = useState(true);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [subSystemData, setSubSystemData] = useState([]);
  const [loadingSubSystemData, setLoadingSubSystemData] = useState(true);
  const [partLevelData, setPartLevelData] = useState([]);
  const [loadingPartLevelData, setLoadingPartLevelData] = useState(true);
  const [gradeTypes, setGradeTypes] = useState([]);
  const [loadingGradeTypes, setLoadingGradeTypes] = useState(true);
  const [showCustomGrade, setShowCustomGrade] = useState(false);

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
    fetchGradeTypes();
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
      setLoadingManfacturerData(true);
      try {
        const data = await fetchManufacturers();
        setManufacturerOptions(data);
      } catch (error) {
        Alert("Error fetching Manufacturer data", "error");
        console.error("Failed to load manufacturers:", error);
      } finally {
        setLoadingManfacturerData(false);
      }
    };

    fetchManufacturersData();
  }, []);

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
    setFormValues((prev) => ({
      ...prev,
      uom: uomData?.find((item) => item?.name === "Each (EA)"),
    }));
  }, [uomData]);

  useEffect(() => {
    fetchPartTypesData();
  }, []);

  useEffect(() => {
    if (selectedImageFile) {
      const preview = URL.createObjectURL(selectedImageFile);
      setImagePreview(preview);
      return () => URL.revokeObjectURL(preview);
    } else {
      setImagePreview(null);
    }
  }, [selectedImageFile]);

  const fetchPartTypesData = async () => {
    setLoadingPartTypesData(true);
    try {
      const partTypesData = await fetchPartTypesLookUp();
      setPartTypes(partTypesData);
    } catch (error) {
      Alert("Couldn't fetch Part Types...!", "error");
      console.error("Error fetching part types data:", error);
    } finally {
      setLoadingPartTypesData(false);
    }
  };

  const handleTextFieldChange = (e) => {
    const { name, value } = e.target;
    const trimmedValue = value.trim();

    setFormValues((prev) => ({ ...prev, [name]: value }));

    const newErrors = { ...formErrors };
    const requiredFields = {
      partName: "Part Name",
      manufacturingPartNumber: "Manufacturing Part Number",
      manufacturerName: "Manufacturer",
    };

    if (!trimmedValue && requiredFields[name]) {
      newErrors[name] = `${requiredFields[name]} is required`;
    } else if (
      name === "manufacturingPartNumber" &&
      manufacturingPartNumbers.some(
        (num) => normalizePartNumber(num) === normalizePartNumber(trimmedValue),
      )
    ) {
      newErrors[name] = "Manufacturing Part Number already exists.";
    } else {
      newErrors[name] = "";
    }

    setFormErrors(newErrors);
  };

  const handleAutocompleteChange = (name, newValue) => {
    setFormValues((prev) => ({ ...prev, [name]: newValue }));
    const newErrors = { ...formErrors };
    const requiredFields = { partType: "Part Type", uom: "Unit of Measure" };
    newErrors[name] = !newValue ? `${requiredFields[name]} is required` : "";
    setFormErrors(newErrors);
  };

  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
    } else {
      setSelectedImageFile(null);
    }
  };

  const handleCapture = async (imageSrc) => {
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const file = new File([blob], "captured-image.jpg", {
        type: "image/jpeg",
      });

      setSelectedImageFile(file);
      setCameraOpen(false);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  const validateCreatePartFields = () => {
    let valid = true;
    const errors = {};

    if (!formValues.partName?.trim()) {
      errors.partName = "Part Name is required";
      valid = false;
    } else if (formValues.partName.length > 250) {
      errors.partName = "Part Name must be at most 250 characters long";
      valid = false;
    }
    if (
      formValues.spaceQualified === "" ||
      formValues.spaceQualified === null ||
      formValues.spaceQualified === undefined
    ) {
      errors.spaceQualified = "Space Qualified selection is required";
      valid = false;
    }

    if (
      formValues.serialNumberRequiredValue === "" ||
      formValues.serialNumberRequiredValue === null ||
      formValues.serialNumberRequiredValue === undefined
    ) {
      errors.serialNumberRequiredValue = "Serial Number selection is required";
      valid = false;
    }

    if (!formValues.partType) {
      errors.partType = "Part Type is required";
      valid = false;
    }
    if (
      formValues.trl !== "" &&
      formValues.trl !== null &&
      formValues.trl !== undefined
    ) {
      if (formValues.trl < 1 || formValues.trl > 12) {
        errors.trl = "TRL must be between 1 and 12";
        valid = false;
      }
    }

    if (formValues.makeOrBuy === null || formValues.makeOrBuy === "") {
      errors.makeOrBuy = "Make/Buy selection is required";
      valid = false;
    }

    if (formValues.makeOrBuy === "1") {
      const value = formValues.manufacturingPartNumber?.trim();
      const manufacturerName = formValues.manufacturerName?.trim();
      if (!value) {
        errors.manufacturingPartNumber =
          "Manufacturing Part Number is required";
        valid = false;
      } else if (
        manufacturingPartNumbers.some(
          (num) => normalizePartNumber(num) === normalizePartNumber(value),
        )
      ) {
        errors.manufacturingPartNumber =
          "Manufacturing Part Number already exists.";
        valid = false;
      }
      if (!manufacturerName) {
        errors.manufacturerName = "Manufacturer Name is required";
        valid = false;
      }
    }

    if (!formValues.uom) {
      errors.uom = "Unit of Measure is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };
  const fetchGradeTypes = async () => {
    setLoadingGradeTypes(true);
    try {
      const response = await fetchOptionSetByName("grade_types");
      const parsed = response ? JSON.parse(response.values) : [];

      setGradeTypes(parsed);
    } catch (err) {
      Alert("Error fetching grade types", "error");
      console.error("Error fetching grade_types:", err);
    } finally {
      setLoadingGradeTypes(false);
    }
  };

  const handleCreate = async () => {
    if (!validateCreatePartFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setLoadingData(true);
    const part = {
      name: capitalizeFirstLetter(formValues.partName),
      partTypeId: formValues.partType.id,
      unitOfMeasureId: formValues?.uom?.id || null,
      makeBuy: formValues.makeOrBuy,
      isSerialNumberRequired: formValues.serialNumberRequiredValue,
      manufacturingPartNumber: formValues.manufacturingPartNumber || null,
      manufacturerName: formValues.manufacturerName || null,
      unitPrice: formValues.unitPrice || null,
      trl: formValues.trl ? Number(formValues.trl) : null,
      spaceQualified: formValues.spaceQualified,
      material: formValues?.material?.name || null,
      shortDescription: formValues.shortDescription || null,
      subsystemId: formValues.subsystem?.id,
      partLevelId: formValues.partLevel?.id,
      grade: showCustomGrade
        ? formValues.customGrade
        : formValues.grade?.name || null,
      hsnCode: formValues.hsnCode || null,
      specification: formValues.specification || null,
      package: formValues.package || null,
      qualification: formValues.qualification || null,
      radiationTolerance: formValues.radiationTolerance || null,
      tempRange: formValues.tempRange || null,
      tempCoefficient: formValues.tempCoefficient || null,
    };

    try {
      const newPart = await createPart(part);
      if (newPart && selectedImageFile) {
        const formData = new FormData();
        formData.append("imageFile", selectedImageFile);
        let fileExtension = "png";
        if (selectedImageFile.name) {
          fileExtension = selectedImageFile.name.split(".").pop() || "png";
        } else if (selectedImageFile.type) {
          fileExtension = selectedImageFile.type.split("/").pop();
        }
        formData.append("ImageType", fileExtension);
        await updatePartwithImage(newPart.id, formData);
      }
      if (newPart?.manufacturingPartNumber) {
        setManufacturingPartNumbers((prev) => [
          ...prev,
          newPart.manufacturingPartNumber,
        ]);
      }

      handleRefresh();
      handleCloseClick();
      Alert("Part Created Successfully..!", "success");
    } catch (error) {
      Alert("Couldn't Create Part...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>Create Part</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loadingData || loadingMPartNumbersData ? (
        <div className="loader-container">
          <Cliploader loading={true} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <div className="FlyoutContentSection">
              <div className="FlyoutContentWrapper">
                <div className="FlyoutContentLeft">
                  <h3>Enter The Details</h3>
                  <div className="GrnNewFlyoutContentTop">
                    <Autocomplete
                      value={formValues.partType || null}
                      onChange={(event, newValue) =>
                        handleAutocompleteChange("partType", newValue)
                      }
                      loading={loadingPartTypesData}
                      loadingText="Loading part types..."
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      id="part-type-autocomplete"
                      options={partTypes}
                      getOptionLabel={(option) =>
                        `${option.name} - ${option.partNumberPrefix}`
                      }
                      renderOption={(props, option, index) => (
                        <MenuItem
                          {...props}
                          key={option.id || index}
                          className={
                            option.newPartTypeValue ? "customMenuItem" : null
                          }
                        >
                          {`${option.name} - ${option.partNumberPrefix}`}
                        </MenuItem>
                      )}
                      className="AdminTextFeilds"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Part Type"
                          name="partType"
                          error={!!formErrors.partType}
                          helperText={formErrors.partType}
                          required
                        />
                      )}
                      fullWidth
                    />
                    <TextField
                      select
                      label="Make / Buy"
                      name="makeOrBuy"
                      fullWidth
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.makeOrBuy}
                      error={!!formErrors.makeOrBuy}
                    >
                      <MenuItem value="0">Make</MenuItem>
                      <MenuItem value="1">Buy</MenuItem>
                    </TextField>
                  </div>
                  <div className="GrnNewFlyoutContentTop">
                    {formValues.makeOrBuy === "1" && (
                      <>
                        <TextField
                          label="Manufacturing Part Number"
                          name="manufacturingPartNumber"
                          className="AdminTextFeilds"
                          onChange={handleTextFieldChange}
                          value={formValues.manufacturingPartNumber || ""}
                          error={!!formErrors.manufacturingPartNumber}
                          helperText={formErrors.manufacturingPartNumber}
                          required
                          fullWidth
                        />
                        <Autocomplete
                          options={manufacturerOptions}
                          value={formValues.manufacturerName || null}
                          freeSolo
                          fullWidth
                          loading={loadingManfacturerData}
                          onChange={(event, newValue) => {
                            const value = newValue || "";

                            setFormValues((prev) => ({
                              ...prev,
                              manufacturerName: value,
                            }));

                            setFormErrors((prev) => ({
                              ...prev,
                              manufacturerName: value?.trim()
                                ? ""
                                : "Manufacturer is required",
                            }));
                          }}
                          onInputChange={(event, newInputValue) => {
                            setFormValues((prev) => ({
                              ...prev,
                              manufacturerName: newInputValue,
                            }));

                            setFormErrors((prev) => ({
                              ...prev,
                              manufacturerName: newInputValue?.trim()
                                ? ""
                                : "Manufacturer is required",
                            }));
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Manufacturer"
                              name="manufacturerName"
                              className="AdminTextFeilds"
                              error={!!formErrors.manufacturerName}
                              helperText={formErrors.manufacturerName}
                              required
                              fullWidth
                            />
                          )}
                        />
                      </>
                    )}
                  </div>
                  <div className="GrnNewFlyoutContentTop">
                    <TextField
                      label="Part Name"
                      name="partName"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.partName || ""}
                      error={!!formErrors.partName}
                      helperText={formErrors.partName}
                      required
                      fullWidth
                    />
                    <TextField
                      label="Enter a brief description"
                      name="shortDescription"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.shortDescription || ""}
                      fullWidth
                    />
                  </div>

                  <div className="GrnNewFlyoutContentTop">
                    <Autocomplete
                      value={formValues.uom || null}
                      onChange={(event, newValue) =>
                        handleAutocompleteChange("uom", newValue)
                      }
                      loading={loadingUOMData}
                      loadingText="Loading Unit of Measure..."
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      id="uom-autocomplete"
                      options={uomData}
                      getOptionLabel={(option) => option.name}
                      renderOption={(props, option) => (
                        <MenuItem {...props} key={option.id}>
                          {option.name}
                        </MenuItem>
                      )}
                      freeSolo
                      className="AdminTextFeilds"
                      renderInput={(params) => (
                        <div>
                          <TextField
                            {...params}
                            label="Unit Of Measure"
                            name="uom"
                            value={formValues.uom || ""}
                            required
                            error={!!formErrors.uom}
                            helperText={formErrors.uom}
                          />
                        </div>
                      )}
                      fullWidth
                    />
                    <TextField
                      label="TRL #"
                      name="trl"
                      type="number"
                      className="AdminTextFields"
                      value={formValues.trl ?? ""}
                      error={!!formErrors.trl}
                      helperText={formErrors.trl}
                      onKeyDown={(e) => {
                        if (["e", "E", "+", "-"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;

                        setFormValues((prev) => ({ ...prev, trl: value }));

                        if (value === "") {
                          setFormErrors((prev) => ({ ...prev, trl: "" }));
                        } else if (Number(value) < 1 || Number(value) > 12) {
                          setFormErrors((prev) => ({
                            ...prev,
                            trl: "TRL must be between 1 and 12",
                          }));
                        } else {
                          setFormErrors((prev) => ({ ...prev, trl: "" }));
                        }
                      }}
                      inputProps={{ min: 1, max: 12 }}
                      fullWidth
                    />
                  </div>

                  <div className="GrnNewFlyoutContentTop">
                    <Autocomplete
                      value={formValues.subsystem}
                      loading={loadingSubSystemData}
                      loadingText="Loading Subsystems..."
                      options={subSystemData || []}
                      getOptionLabel={(option) => option?.name || ""}
                      isOptionEqualToValue={(option, value) =>
                        option?.id === value?.id
                      }
                      onChange={(event, newValue) =>
                        setFormValues((prev) => ({
                          ...prev,
                          subsystem: newValue,
                        }))
                      }
                      renderOption={(props, option) => (
                        <MenuItem {...props} key={option.id}>
                          {option.name}
                        </MenuItem>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Subsystem"
                          name="subsystem"
                        />
                      )}
                      className="AdminTextFeilds"
                      fullWidth
                    />
                    <Autocomplete
                      value={formValues.material || null}
                      loading={materialsLoading}
                      loadingText="Loading Materials..."
                      selectOnFocus
                      clearOnBlur
                      handleHomeEndKeys
                      onChange={(event, newValue) =>
                        handleAutocompleteChange("material", newValue)
                      }
                      id="material-type-autocomplete"
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
                      className="AdminTextFeilds"
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Material"
                          name="material"
                        />
                      )}
                      fullWidth
                    />
                  </div>

                  <div className="GrnNewFlyoutContentTop">
                    <TextField
                      label="Specification"
                      name="specification"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.specification || ""}
                      fullWidth
                    />
                    <TextField
                      label="Radiation Tolerance"
                      name="radiationTolerance"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.radiationTolerance || ""}
                      fullWidth
                      multiline
                    />
                  </div>

                  <div className="GrnNewFlyoutContentTop">
                    <TextField
                      label="Package"
                      name="package"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.package || ""}
                      fullWidth
                      multiline
                    />
                    <TextField
                      label="Qualification"
                      name="qualification"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.qualification || ""}
                      fullWidth
                      multiline
                    />
                  </div>
                  <div className="GrnNewFlyoutContentTop">
                    <TextField
                      label="Temperature Range"
                      name="tempRange"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.tempRange || ""}
                      fullWidth
                      multiline
                    />

                    <TextField
                      label="Temperature coefficient"
                      name="tempCoefficient"
                      className="AdminTextFeilds"
                      onChange={handleTextFieldChange}
                      value={formValues.tempCoefficient || ""}
                      fullWidth
                      multiline
                    />
                  </div>
                  <div className="GrnNewFlyoutContentTop">
                    <div>
                      <Autocomplete
                        value={formValues.grade}
                        loading={loadingGradeTypes}
                        options={gradeTypes || []}
                        getOptionLabel={(option) => option?.name || ""}
                        onChange={(event, newValue) => {
                          if (newValue?.name === "Others") {
                            setShowCustomGrade(true);
                            setFormValues((prev) => ({
                              ...prev,
                              grade: newValue,
                            }));
                          } else {
                            setShowCustomGrade(false);
                            setFormValues((prev) => ({
                              ...prev,
                              grade: newValue,
                              customGrade: "",
                            }));
                          }
                        }}
                        renderOption={(props, option) => (
                          <MenuItem {...props} key={option.name}>
                            {option.name}
                          </MenuItem>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Grade"
                            placeholder="Select grade"
                          />
                        )}
                        className="AdminTextFeilds"
                        fullWidth
                      />
                    </div>

                    {showCustomGrade && (
                      <TextField
                        label="Enter Custom Grade"
                        name="customGrade"
                        className="AdminTextFeilds"
                        value={formValues.customGrade}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            customGrade: e.target.value,
                          }))
                        }
                      />
                    )}
                    <TextField
                      label="HSN Code"
                      name="hsnCode"
                      className="AdminTextFeilds"
                      value={formValues.hsnCode || ""}
                      onChange={handleTextFieldChange}
                      fullWidth
                    />
                  </div>

                  <div className="GrnNewFlyoutContentTop radioRow">
                    {/* SPACE QUALIFIED */}
                    <div
                      className={`formFieldInlineWrapper ${
                        formErrors.spaceQualified ? "formFieldError" : ""
                      }`}
                    >
                      <div className="formFieldInline">
                        <label className="fieldLabelInline">
                          Space Qualified{" "}
                          <span className="required-asterisk">*</span>
                        </label>

                        <RadioGroup
                          row
                          value={String(formValues.spaceQualified)}
                          onChange={(e) => {
                            setFormValues((prev) => ({
                              ...prev,
                              spaceQualified: e.target.value === "true",
                            }));
                            setFormErrors((prev) => ({
                              ...prev,
                              spaceQualified: "",
                            }));
                          }}
                          className="radioGroupInline"
                        >
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
                        </RadioGroup>
                      </div>

                      {formErrors.spaceQualified && (
                        <span className="errorTextBelow">
                          {formErrors.spaceQualified}
                        </span>
                      )}
                    </div>

                    {/* SERIAL NUMBER REQUIRED */}
                    <div
                      className={`formFieldInlineWrapper ${
                        formErrors.serialNumberRequiredValue
                          ? "formFieldError"
                          : ""
                      }`}
                    >
                      <div className="formFieldInline">
                        <label className="fieldLabelInline">
                          Serial Number Required{" "}
                          <span className="required-asterisk">*</span>
                        </label>

                        <RadioGroup
                          row
                          value={String(formValues.serialNumberRequiredValue)}
                          onChange={(e) => {
                            setFormValues((prev) => ({
                              ...prev,
                              serialNumberRequiredValue:
                                e.target.value === "true",
                            }));
                            setFormErrors((prev) => ({
                              ...prev,
                              serialNumberRequiredValue: "",
                            }));
                          }}
                          className="radioGroupInline"
                        >
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
                        </RadioGroup>
                      </div>

                      {formErrors.serialNumberRequiredValue && (
                        <span className="errorTextBelow">
                          {formErrors.serialNumberRequiredValue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="NewPartImageContainer">
                <div className="FlyoutContentRight">
                  {cameraOpen && (
                    <CameraComponent
                      onSave={handleCapture}
                      onClose={() => setCameraOpen(false)}
                    />
                  )}

                  {selectedImageFile ? (
                    <div className="NewPartUploadedImageWrapper">
                      <div className="NewPartImagePreview">
                        <IconButton
                          onClick={() => setSelectedImageFile(null)}
                          aria-label="delete"
                          className="NewPartCloseButton"
                        >
                          <ion-icon
                            name="close-outline"
                            class="CloseIcon"
                          ></ion-icon>
                        </IconButton>
                        <img
                          src={imagePreview}
                          alt="Uploaded"
                          className="UploadedImage"
                        />
                      </div>
                    </div>
                  ) : (
                    <img src={NoImagePNG} />
                  )}
                </div>
                <div className="newimage-container">
                  <div className="image-header">
                    {!selectedImageFile && (
                      <div className="NewPartIconsContainer">
                        <label htmlFor="image-input">
                          <Button component="span" className="NewPartIcon">
                            <AttachFileIcon className="small-icon" />
                          </Button>
                        </label>
                        <label>
                          <Button
                            onClick={() => setCameraOpen(true)}
                            className="NewPartIcon"
                          >
                            <CameraAltIcon className="small-icon" />
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>

                  <HiddenInput
                    type="file"
                    accept="image/*"
                    id="image-input"
                    onChange={handleSelectImage}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="CreateFlyoutFooter">
            <Button onClick={handleCloseClick} className="CancelButton">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loadingData}>
              Create
            </Button>
          </div>
        </>
      )}

      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewPart;
