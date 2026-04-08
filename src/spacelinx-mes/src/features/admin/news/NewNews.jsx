import { useState, useEffect, useContext } from "react";
import {
  TextField,
  MenuItem,
  Button,
  FormGroup,
  FormHelperText,
} from "@mui/material";
import {
  createNewsType,
  fetchNewsTypes,
} from "../../../services/newsTypeService";
import { createNews } from "../../../services/newsService";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Cliploader from "../../../Components/Loaders/Cliploader";
const NewNews = ({
  handleCloseClick,
  handleRefresh,
  setMainLOcationsLoadingData,
}) => {
  const [loadingData, setLoadingData] = useState(true);
  const { Alert } = useContext(AlertsContext);
  const [newsTypes, setNewsTypes] = useState([]);
  const [loadNewsTypes, setLoadNewsTypes] = useState(true);
  const [formValues, setFormValues] = useState({
    title: "",
    newsType: null,
    hyperLink: "",
    origin: 0,
    imageUrl: "",
  });
  const { title, newsType, hyperLink, origin, imageUrl } = formValues;
  const [formErrors, setFormErrors] = useState({
    title: "",
    newsType: "",
    hyperLink: "",
    origin: "",
    imageUrl: "",
  });

  const handleRefreshNewsTypes = () => {
    setLoadNewsTypes(true);
  };
  useEffect(() => {
    if (!loadNewsTypes) {
      return;
    }
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const newsTypesData = await fetchNewsTypes();
        setNewsTypes(newsTypesData);
        setLoadNewsTypes(false);
        setLoadingData(false);
      } catch (error) {
        Alert("Couldn't fetch News Types...!", "error");
        console.error("Error fetching News data:", error);
        setLoadNewsTypes(false);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [loadNewsTypes]);
  const filter = createFilterOptions();
  const validateCreateNewsFields = () => {
    let valid = true;
    const errors = {
      title: "",
      newsType: "",
      hyperLink: "",
      origin: "",
      imageUrl: "",
    };

    if (!title) {
      errors.title = "Title is required";
      valid = false;
    } else if (title.length > 100) {
      errors.title = "Title must be at most 100 characters long";
      valid = false;
    } else if (!/^[a-zA-Z\s\d]+$/.test(title)) {
      errors.title = "Title should only contain letters, spaces, and numbers";
      valid = false;
    }

    if (!hyperLink) {
      errors.hyperLink = "Hyper Link is required";
      valid = false;
    } else if (hyperLink.length > 100) {
      errors.hyperLink = "Hyper Link must be at most 100 characters long";
      valid = false;
    } else {
      const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
      if (!urlPattern.test(hyperLink)) {
        errors.hyperLink = "Enter a valid URL";
        valid = false;
      }
    }

    if (!newsType) {
      errors.newsType = "Type is required";
      valid = false;
    }

    if (!origin) {
      errors.origin = "Origin is required";
      valid = false;
    }

    if (!imageUrl) {
      errors.imageUrl = "Image URL is required";
      valid = false;
    } else {
      const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
      if (!urlPattern.test(imageUrl)) {
        errors.imageUrl = "Enter a valid URL";
        valid = false;
      }
    }

    setFormErrors(errors);
    return valid;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreateNewsFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setMainLOcationsLoadingData(true);
    setLoadingData(true);
    const news = {
      title: formValues.title,
      hyperLink: formValues.hyperLink,
      newsTypeId: formValues.newsType?.id,
      origin: formValues.origin,
      image: formValues.imageUrl,
    };

    try {
      const newNews = await createNews(news);
      handleRefresh();
      handleCloseClick();
      Alert("News Created Successfully..!", "success");
      setFormValues({
        title: "",
        newsType: null,
        hyperLink: "",
        origin: null,
        imageUrl: "",
      });
      setFormErrors({
        title: "",
        newsType: "",
        hyperLink: "",
        origin: "",
        imageUrl: "",
      });
    } catch (error) {
      Alert("Couldn't Create News...!", "error");
    } finally {
      setLoadingData(false);
      setMainLOcationsLoadingData(false);
    }
  };

  const handleAddNewsType = async (newNewsTypeValue) => {
    setLoadingData(true);
    if (newNewsTypeValue) {
      setFormValues({
        ...formValues,
        newsType: { name: newNewsTypeValue },
      });

      const newNewsTypeData = {
        name: newNewsTypeValue,
      };

      try {
        await createNewsType(newNewsTypeData);
        handleRefreshNewsTypes();
        Alert("News Type Added Successfully!", "success");
      } catch (error) {
        console.error("Error adding news type:", error);
        Alert("Failed to Add News Type!", "error");
      } finally {
        setLoadingData(false);
      }
    } else {
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>Create News</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      {loadingData ? (
        <div className="loader-container">
          <Cliploader loading={loadingData} />
        </div>
      ) : (
        <>
          <div className="CreateFlyoutBody">
            <h3>Enter The Details</h3>
            <FormGroup>
              <TextField
                label="Title"
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({ ...formValues, title: e.target.value });
                  setFormErrors({ ...formErrors, title: "" });
                }}
                value={formValues.title}
                error={!!formErrors.title}
                required
              />
              <FormHelperText error={!!formErrors.title}>
                {formErrors.title}
              </FormHelperText>
            </FormGroup>

            <Autocomplete
              value={newsType}
              onChange={(event, newValue) => {
                if (newValue && newValue.newNewsTypeValue) {
                  handleAddNewsType(newValue.newNewsTypeValue);
                } else {
                  setFormValues({ ...formValues, newsType: newValue });
                  setFormErrors({ ...formErrors, newsType: "" });
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
              renderOption={(props, option, index) => (
                <MenuItem
                  {...props}
                  key={option.id || index}
                  className={option.newNewsTypeValue ? "customMenuItem" : null}
                >
                  {option.name}
                </MenuItem>
              )}
              freeSolo
              className="AdminTextFeilds"
              renderInput={(params) => (
                <div>
                  <TextField
                    {...params}
                    label="News Type"
                    error={!!formErrors.newsType}
                    required
                  />
                  <FormHelperText error={!!formErrors.newsType}>
                    {formErrors.newsType}
                  </FormHelperText>
                </div>
              )}
            />

            <FormGroup>
              <TextField
                label="HyperLink"
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({ ...formValues, hyperLink: e.target.value });
                  setFormErrors({ ...formErrors, hyperLink: "" });
                }}
                value={formValues.hyperLink}
                error={!!formErrors.hyperLink}
                required
              />
              <FormHelperText error={!!formErrors.hyperLink}>
                {formErrors.hyperLink}
              </FormHelperText>
            </FormGroup>

            <FormGroup>
              <TextField
                select
                label="Origin"
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({ ...formValues, origin: e.target.value });
                  setFormErrors({ ...formErrors, origin: "" });
                }}
                value={formValues.origin || ""}
                error={!!formErrors.origin}
                required
              >
                <MenuItem value="WorkOrder">WorkOrder</MenuItem>
                <MenuItem value="Guide">Guide</MenuItem>
              </TextField>
              <FormHelperText error={!!formErrors.origin}>
                {formErrors.origin}
              </FormHelperText>
            </FormGroup>

            <FormGroup>
              <TextField
                label="Image URL"
                className="AdminTextFeilds"
                onChange={(e) => {
                  setFormValues({ ...formValues, imageUrl: e.target.value });
                  setFormErrors({ ...formErrors, imageUrl: "" });
                }}
                value={formValues.imageUrl}
                error={!!formErrors.imageUrl}
                required
              />
              <FormHelperText error={!!formErrors.imageUrl}>
                {formErrors.imageUrl}
              </FormHelperText>
            </FormGroup>
          </div>
          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
              Cancel
            </Button>
            <Button disabled={loadingData} onClick={handleCreate}>
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

export default NewNews;
