import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, Autocomplete } from "@mui/material";
import { createGuide, updateGuide } from "../../services/guideService";
import { fetchGuideType } from "../../services/guideTypeService";
import { fetchPlatformLookUp } from "../../services/platformService";
import {
  fetchParentPartsWithoutGuide,
  fetchPartVersions,
} from "../../services/partService";
import { fetchOptionSetByName } from "../../services/optionSetService";
import { AlertsContext } from "../../features/AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import { showConfirmation } from "../../Components/ConfirmationDialog/ConfirmationDialog";
import ClipLoader from "../../Components/Loaders/Cliploader";
import "../../features/features.css";
import "../materialKits/Kits.css";

const NewGuide = ({
  handleCloseClick,
  handleRefresh,
  editGuideData,
  setEditGuideDetailsAccordion,
  editGuideDetailsAccordion,
  guideVersions,
  fetchGuides,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [GuideName, setGuideName] = useState("");
  const [parentPart, setParentPart] = useState(null);
  const [Type, setType] = useState(null);
  const [editType, setEditType] = useState(editGuideData?.guideType || null);
  const [Platform, setPlatform] = useState(null);
  const [editPlatform, setEditPlatform] = useState(null);
  const [formErrors, setFormErrors] = useState({
    GuideName: "",
    ParentPart: "",
    Type: "",
    Category: "",
  });
  const [loadingData, setLoadingData] = useState(false);
  const [GuideTypes, setGuideTypes] = useState([]);
  const [platformTypes, setplatformTypes] = useState([]);
  const [partsWithoutGuide, setPartsWithoutGuide] = useState([]);
  const [partVersionsData, setPartVersionsData] = useState([]);
  const [guideCategories, setGuideCategories] = useState([]);
  const [Category, setCategory] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [loadingPlatformData, setLoadingPlatformData] = useState(true);
  const [loadingGuideTypeData, setLoadingGuideTypeData] = useState(true);
  const [loadingGuideCategoriesData, setLoadingGuideCategoriesData] =
    useState(true);
  const [loadingPartData, setLoadingPartData] = useState(true);

  useEffect(() => {
    if (editGuideData?.part?.partNumberSuffix) {
      fetchPartVersionsData();
    }
  }, [editGuideData?.part?.partNumberSuffix]);

  const fetchPartVersionsData = async () => {
    setLoadingPartData(true);
    try {
      const data = await fetchPartVersions(
        editGuideData?.part?.partNumberSuffix,
      );
      if (data?.length) {
        const sortedData = [...data].sort((a, b) =>
          b.part.version.localeCompare(a.part.version, undefined, {
            numeric: true,
          }),
        );
        setPartVersionsData(sortedData);
      }
    } catch (error) {
      console.error("Error fetching part versions:", error);
    } finally {
      setLoadingPartData(false);
    }
  };

  useEffect(() => {
    const fetchGuideCategories = async () => {
      setLoadingGuideCategoriesData(true);
      try {
        const response = await fetchOptionSetByName("guide_categories");
        const categories = response ? JSON.parse(response.values) : [];
        setGuideCategories(categories);

        if (!editGuideData && categories.length) {
          const defaultCategory = categories.find(
            (item) => item.name === "Satellite",
          );
          setCategory(defaultCategory);
        } else if (editGuideData) {
          const matchedCategory = categories.find(
            (c) =>
              c.name.toLowerCase() === editGuideData.category?.toLowerCase(),
          );
          setEditCategory(matchedCategory || null);
        }
      } catch (error) {
        console.error("Error fetching guide categories:", error);
        Alert("Couldn't fetch guide categories!", "error");
      } finally {
        setLoadingGuideCategoriesData(false);
      }
    };
    fetchGuideCategories();
  }, [editGuideData]);

  useEffect(() => {
    const fetchGuideTypeData = async () => {
      setLoadingGuideTypeData(true);
      try {
        const data = await fetchGuideType();
        setGuideTypes(data || []);
        if (!Type && !editType) {
          const defaultType = data.find((t) => t.name === "Assembly");
          setType(defaultType || null);
        }
      } catch (error) {
        Alert("Couldn't fetch Guide Types!", "error");
        console.error(error);
      } finally {
        setLoadingGuideTypeData(false);
      }
    };

    const fetchPlatformData = async () => {
      setLoadingPlatformData(true);
      try {
        const data = await fetchPlatformLookUp();
        setplatformTypes(data || []);
        if (editGuideData) {
          const editPlat = data.find((p) => p.id === editGuideData.platformId);
          setEditPlatform(editPlat || null);
        }
      } catch (error) {
        Alert("Couldn't fetch Platform Types!", "error");
        console.error(error);
      } finally {
        setLoadingPlatformData(false);
      }
    };

    fetchGuideTypeData();
    fetchPlatformData();
  }, []);

  const validateCreateGuideFields = () => {
    let valid = true;
    if (!GuideName.trim()) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        GuideName: "Guide Name is required",
      }));
      valid = false;
    }

    if (!parentPart) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        ParentPart: "Parent Part is required",
      }));
      valid = false;
    }

    if (!Type) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        Type: "Type is required",
      }));
      valid = false;
    }
    if (!Category) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        Category: "Category is required",
      }));
      valid = false;
    }
    return valid;
  };

  useEffect(() => {
    const fetchParts = async () => {
      setLoadingPartData(true);
      try {
        const parts = await fetchParentPartsWithoutGuide();
        setPartsWithoutGuide(parts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPartData(false);
      }
    };
    fetchParts();
  }, []);

  const handlePartChangeConfirmation = async (newPart, isEditing) => {
    if (!isEditing || !newPart) return true;
    const confirmed = await showConfirmation(
      "Change Part?",
      "Are you sure you want to change the part? This will update the guide's BOM and all associated step BOMs.",
      "Yes, change it!",
      true,
    );
    return confirmed;
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!validateCreateGuideFields()) {
      return;
    }

    setLoadingData(true);
    try {
      const guideData = {
        name: GuideName,
        partId: parentPart?.id,
        guideTypeId: Type?.id,
        platformId: Platform?.id || null,
        category: Category?.name || null,
      };
      const createdGuide = await createGuide(guideData);
      handleCloseClick();
      handleRefresh();
      Alert("Guide Created Successfully..!", "success");
    } catch (error) {
      console.error("Error creating guide:", error);
      Alert("Couldn't Create guide...!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const handleEditGuide = async () => {
    setLoadingData(true);
    try {
      const updateInfo = {
        id: editGuideData?.id,
        name: editGuideData?.name,
        platformId: editPlatform?.id || editGuideData?.platformId,
        guideTypeId: editType?.id || editGuideData?.guideTypeId,
        category: editCategory?.name || editGuideData?.category,
        partId: parentPart?.id || editGuideData?.part?.id,
      };
      await updateGuide(editGuideData?.id, updateInfo);
      fetchGuides();
      setEditGuideDetailsAccordion(false);
      Alert("Guide Updated Successfully!", "success");
    } catch (error) {
      console.error(error);
      Alert("Couldn't update guide!", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const filterOptions = (options, params) => {
    const { inputValue } = params;
    return options.filter((option) => {
      const lowerCaseInput = inputValue.toLowerCase();
      return (
        option.partNumber?.toLowerCase().includes(lowerCaseInput) ||
        option.name?.toLowerCase().includes(lowerCaseInput)
      );
    });
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2>{editGuideDetailsAccordion ? "Edit" : "Create"} Guide</h2>
        <button
          onClick={() => {
            if (editGuideDetailsAccordion) {
              setEditGuideDetailsAccordion(false);
            } else {
              handleCloseClick();
            }
          }}
        >
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>

      {loadingData ? (
        <div className="loader-container">
          <ClipLoader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>{editGuideDetailsAccordion ? "Edit" : "Enter"} The Details</h3>
            <Autocomplete
              value={parentPart || editGuideData?.part || null}
              disabled={!!editGuideData && guideVersions?.length <= 1}
              onChange={async (event, newValue) => {
                const isEditing = !!editGuideData;
                const confirmed = await handlePartChangeConfirmation(
                  newValue,
                  isEditing,
                );
                if (confirmed) {
                  setParentPart(newValue);
                  setGuideName(newValue?.name || "");
                  setFormErrors((prev) => ({
                    ...prev,
                    ParentPart: "",
                    GuideName: "",
                  }));
                }
              }}
              filterOptions={filterOptions}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="parent-child-autocomplete"
              options={
                editGuideData?.part
                  ? partVersionsData.map((pv) => pv.part)
                  : partsWithoutGuide
              }
              loading={loadingPartData}
              loadingText="Loading Parts...."
              getOptionLabel={(option) =>
                `${option.partNumber} - ${option.name}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              className="AdminTextFeilds"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Part"
                  error={!!formErrors.ParentPart}
                  helperText={formErrors.ParentPart}
                  required
                />
              )}
            />
            <TextField
              label="Name"
              className="AdminTextFeilds"
              value={parentPart?.name || editGuideData?.name || ""}
              error={!!formErrors.GuideName}
              helperText={formErrors.GuideName}
              disabled
              required
            />
            <Autocomplete
              value={Platform || editPlatform || null}
              onChange={(event, newValue) =>
                editGuideData
                  ? setEditPlatform(newValue)
                  : setPlatform(newValue)
              }
              options={platformTypes}
              loading={loadingPlatformData}
              loadingText="Loading Platform...."
              className="AdminTextFeilds"
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Platform" variant="outlined" />
              )}
            />
            <Autocomplete
              value={Type || editType || null}
              disabled={guideVersions?.some(
                (item) => item.status === "Published",
              )}
              onChange={(event, newValue) => {
                editGuideData ? setEditType(newValue) : setType(newValue);
                setFormErrors((prev) => ({ ...prev, Type: "" }));
              }}
              options={GuideTypes}
              loading={loadingGuideTypeData}
              loadingText="Loading type...."
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              className="AdminTextFeilds"
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Type"
                  error={!!formErrors.Type}
                  helperText={formErrors.Type}
                  required
                />
              )}
            />
            <Autocomplete
              value={editGuideData ? editCategory : Category}
              onChange={(event, newValue) => {
                editGuideData
                  ? setEditCategory(newValue)
                  : setCategory(newValue);
                setFormErrors((prev) => ({ ...prev, Category: "" }));
              }}
              options={guideCategories}
              loading={loadingGuideCategoriesData}
              loadingText="Loading categories...."
              isOptionEqualToValue={(option, value) =>
                option.name === value?.name
              }
              className="AdminTextFeilds"
              getOptionLabel={(option) => option?.name || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  error={!!formErrors.Category}
                  helperText={formErrors.Category}
                  required
                />
              )}
            />
          </div>
          <div className="CreateFlyoutFooter">
            <Button
              onClick={() =>
                editGuideDetailsAccordion
                  ? setEditGuideDetailsAccordion(false)
                  : handleCloseClick()
              }
              className="CancelButton"
            >
              Cancel
            </Button>
            <Button
              disabled={loadingData || !!formErrors.GuideName}
              onClick={
                editGuideDetailsAccordion ? handleEditGuide : handleCreate
              }
              className="CreateButton"
            >
              {editGuideDetailsAccordion ? "Update" : "Create"}
            </Button>
          </div>
          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default NewGuide;
