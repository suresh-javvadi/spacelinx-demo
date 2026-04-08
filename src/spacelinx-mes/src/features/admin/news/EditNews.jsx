import { useState, useEffect, useContext } from "react";
import { MenuItem, TextField, Button, Alert } from "@mui/material";
import { updateNews, deleteNews } from "../../../services/newsService";
import {
  createNewsType,
  fetchNewsTypeLookUp,
} from "../../../services/newsTypeService";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import "../../features.css";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import { useUserContext } from "../../userContext/UserContext";
import { PERMISSIONS } from "../../../constants/PagePermissions";
const EditNews = ({
  handleCloseClick,
  handleRefresh,
  selectedId,
  setMainLocationsLoadingData,
  selectedNewsData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const { hasPermission } = useUserContext();
  const [editTitle, setEditTitle] = useState("");
  const [editHyperLink, setEditHyperLink] = useState("");
  const [editType, setEditType] = useState("");
  const [newsTypes, setNewsTypes] = useState([]);
  const [editOrigin, setEditOrigin] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editTitleError, setEditTitleError] = useState("");
  const [editHyperLinkError, setEditHyperLinkError] = useState("");
  const [editTypeError, setEditTypeError] = useState("");
  const [editOriginError, setEditOriginError] = useState("");
  const [editImageUrlError, setEditImageUrlError] = useState("");
  const [newsTypesLoading, setNewsTypesLoading] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setSelectedNews(selectedNewsData);
        setLoadingData(false);
      } catch (error) {
        Alert("Error fetching  News data", "error");
        console.error("Error fetching News data:", error);
      }
    };
    fetchNewsData();
  }, [selectedId]);

  useEffect(() => {
    if (selectedNews) {
      setSelectedTitle(selectedNews.title);
      setEditTitle(selectedNews.title || "");
      setEditHyperLink(selectedNews.hyperlink || "");
      setEditOrigin(selectedNews.origin || "");
      setEditImageUrl(selectedNews.image || "");
      setEditType({
        id: selectedNews.newsType.id,
        name: selectedNews.newsType.name,
      });
    }
  }, [selectedNews]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const NewsTypesData = await fetchNewsTypeLookUp();
        setNewsTypes(NewsTypesData);
        setNewsTypesLoading(false);
      } catch (error) {
        Alert("Couldn't fetch News Types...!", "error");
        console.error("Error fetching data:", error);
        setNewsTypesLoading(false);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleOriginChange = (value) => {
    setEditOrigin(value);
    setEditOriginError("");
  };

  const filter = createFilterOptions();

  const validateEditNewsFields = () => {
    let valid = true;
    if (!editTitle) {
      setEditTitleError("Title is required");
      valid = false;
    } else if (editTitle.length > 100) {
      setEditTitleError("Title must be at most 100 characters long");
      valid = false;
    } else {
      setEditTitleError("");
    }

    if (!editHyperLink) {
      setEditHyperLinkError("Hyper Link is required");
      valid = false;
    } else if (editHyperLink.length > 100) {
      setEditHyperLinkError("Hyper Link must be at most 100 characters long");
      valid = false;
    } else {
      const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
      if (!urlPattern.test(editHyperLink)) {
        setEditHyperLinkError("Enter a valid URL");
        valid = false;
      } else {
        setEditHyperLinkError("");
      }
    }

    if (!editType) {
      setEditTypeError("Type is required");
      valid = false;
    } else {
      setEditTypeError("");
    }

    if (!editOrigin) {
      setEditOriginError("Origin is required");
      valid = false;
    } else {
      setEditOriginError("");
    }

    if (!editImageUrl) {
      setEditImageUrlError("Image URL is required");
      valid = false;
    } else {
      const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
      if (!urlPattern.test(editImageUrl)) {
        setEditImageUrlError("Enter a valid URL");
        valid = false;
      } else {
        setEditImageUrlError("");
      }
    }

    return valid;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditNewsFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setMainLocationsLoadingData(true);
    setLoadingData(true);
    const updatedNews = {
      title: editTitle,
      hyperlink: editHyperLink,
      newsTypeId: editType.id,
      image: editImageUrl,
      origin: editOrigin,
    };
    try {
      await updateNews(selectedId, updatedNews);
      EditNewsDrawerClose();
      handleRefresh();
      setLoadingData(false);
      Alert("Updated News Details Successfully...!", "success");
    } catch (error) {
      Alert("Couldn't Update News Details.. Try Again..!", "error");
    } finally {
      setLoadingData(false);
    }
    EditNewsDrawerClose(false);
  };

  const EditNewsDrawerClose = () => {
    setReadOnlyMode(true);
    handleCloseClick();
  };

  const handleResetClick = () => {
    if (selectedNews) {
      setEditTitle(selectedNews.title);
      setEditHyperLink(selectedNews.hyperlink);
      setEditType({
        id: selectedNews.newsType.id,
        name: selectedNews.newsType.name,
      });
      setEditOrigin(selectedNews.origin);
      setEditImageUrl(selectedNews.image);
      setEditTitleError("");
      setEditHyperLinkError("");
      setEditTypeError("");
      setEditOriginError("");
      setEditImageUrlError("");
    }
  };

  const handleDelete = async () => {
    setMainLocationsLoadingData(true);
    setLoadingData(true);
    if (selectedId) {
      try {
        await deleteNews(selectedNews.id);
        Alert("News Deleted Successfully..!", "success");
        handleRefresh();
      } catch (error) {
        Alert("Couldn't Delete News ...!", "error");
      } finally {
        setLoadingData(false);
      }
    }
    EditNewsDrawerClose(false);
  };
  const handleAddNewsType = async (event, newValue) => {
    setLoadingData(true);
    if (newValue && newValue.newNewsTypeValue) {
      const newNewsTypeData = {
        name: newValue.newNewsTypeValue,
      };
      try {
        await createNewsType(newNewsTypeData);
        const newsTypesData = await fetchNewsTypeLookUp();
        setNewsTypes(newsTypesData);
        setEditType(newNewsTypeData);
        Alert("News Type Added Successfully!", "success");
      } catch (error) {
        console.error("Error adding news type:", error);
        Alert("Couldn't Add News Type!", "error");
      } finally {
        setLoadingData(false);
      }
    } else {
      setLoadingData(false);
    }
  };

  const handleRefreshNewsTypes = () => {
    setNewsTypesLoading(true);
  };

  return (
    <div className="EditFlyout">
      <div className="EditFlyoutHeaderNew">
        <h3>{` ${selectedTitle} Details`}</h3>
        <div>
          <button
            onClick={() => {
              if (!hasPermission(PERMISSIONS.NEWS.MODIFY)) {
                Alert("You do not have access to edit.", "warning");
                return;
              }
              setReadOnlyMode(false);
            }}
          >
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button onClick={handleCloseClick}>
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <div className="EditFlyoutBodyNew">
          <TextField
            label="Title"
            error={!!editTitleError}
            helperText={editTitleError}
            value={editTitle}
            InputProps={{ readOnly: readOnlyMode }}
            onChange={(e) => {
              const newValue = e.target.value;
              setEditTitle(newValue);
              if (newValue.trim() === "") {
                setEditTitleError("Title is required");
              } else {
                setEditTitleError("");
              }
            }}
            readOnly={readOnlyMode}
            className="AdminTextFeilds"
          />

          <TextField
            label="HyperLink"
            value={editHyperLink}
            error={!!editHyperLinkError}
            helperText={editHyperLinkError}
            readOnly={readOnlyMode}
            InputProps={{ readOnly: readOnlyMode }}
            onChange={(e) => {
              const newValue = e.target.value.trim();
              setEditHyperLink(newValue);
              if (newValue === "") {
                setEditHyperLinkError("HyperLink is required");
              } else {
                setEditHyperLinkError("");
              }
            }}
            className="AdminTextFeilds"
          />

          {!readOnlyMode ? (
            <Autocomplete
              value={editType || null}
              onChange={(event, newValue) => {
                if (newValue && newValue.newNewsTypeValue) {
                  handleAddNewsType(newValue.newNewsTypeValue);
                } else if (!newValue || (newValue && !newValue.name.trim())) {
                  setEditTypeError("News Type cannot be empty");
                } else {
                  setEditType(newValue);
                  setEditTypeError("");
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                if (
                  inputValue &&
                  !options.find((option) => option.name === inputValue)
                ) {
                  filtered.push({
                    newNewsTypeValue: inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="news-type-autocomplete"
              options={newsTypes}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <MenuItem {...props} key={option.id}>
                  {option.name}
                </MenuItem>
              )}
              freeSolo
              className="AdminTextFeilds"
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="News Type"
                  error={!!editTypeError}
                  helperText={editTypeError}
                />
              )}
            />
          ) : (
            <TextField
              label="News Type"
              value={editType ? editType.name : ""}
              InputProps={{
                readOnly: true,
              }}
              InputLabelProps={{
                className: "AdminTextFeilds",
              }}
            />
          )}

          <TextField
            label="Origin"
            value={editOrigin}
            helperText={editOriginError}
            className="AdminTextFeilds"
            error={!!editOriginError}
            readOnly={readOnlyMode}
            InputProps={{ readOnly: readOnlyMode }}
            onChange={(e) => {
              handleOriginChange(e.target.value);
            }}
            select
          >
            <MenuItem value="WorkOrder">Work Order</MenuItem>
            <MenuItem value="Guide">Guide</MenuItem>
          </TextField>
          <TextField
            label="Image URL"
            value={editImageUrl}
            helperText={editImageUrlError}
            error={!!editImageUrlError}
            readOnly={readOnlyMode}
            InputProps={{ readOnly: readOnlyMode }}
            onChange={(e) => {
              const newValue = e.target.value.trim();
              setEditImageUrl(newValue);
              if (newValue === "") {
                setEditImageUrlError("Image URL is required");
              } else {
                setEditImageUrlError("");
              }
            }}
            className="AdminTextFeilds"
          />
        </div>
      )}
      {readOnlyMode ? null : (
        <div className="EditFlyoutFooter">
          <ion-icon
            name="trash-outline"
            onClick={() => {
              if (!hasPermission(PERMISSIONS.NEWS.DELETE)) {
                Alert("You do not have access to delete.", "warning");
                return;
              }
              handleDelete();
            }}
          ></ion-icon>
          <div className="update-reset">
            <Button className="CancelButton" onClick={handleResetClick}>
              Reset
            </Button>
            <Button onClick={handleEditSubmit} disabled={loadingData}>
              Update
            </Button>
          </div>
        </div>
      )}
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default EditNews;
