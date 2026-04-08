import { useState, useContext, useEffect } from "react";
import { TextField, Button, FormGroup, FormHelperText } from "@mui/material";
import {
  createLocation,
  fetchLocations,
} from "../../../services/locationService";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
const NewLocation = ({
  handleCloseClick,
  handleRefresh,
  setMainLoadingData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [formValues, setFormValues] = useState({
    locationName: "",
    locationNumber: "",
  });
  const [formErrors, setFormErrors] = useState({
    locationName: "",
    locationNumber: "",
  });
  const { locationName, locationNumber } = formValues;
  const [loadingData, setLoadingData] = useState(false);
  const [locationNumbersData, setLocationNumberData] = useState();

  const validateCreateLocationFields = () => {
    let valid = true;
    const errors = { locationName: "", locationNumber: "" };

    if (!locationName) {
      errors.locationName = "Location Name is required";
      valid = false;
    } else if (locationName.length > 250) {
      errors.locationName = "Location Name must be at most 250 characters long";
      valid = false;
    }

    if (!locationNumber) {
      errors.locationNumber = "Location Number is required";
      valid = false;
    } else if (locationNumber.length > 100) {
      errors.locationNumber =
        "Location Number must be at most 100 characters long";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  useEffect(() => {
    const fetchLocationsNumbersData = async () => {
      setLoadingData(true);
      try {
        const data = await fetchLocations();
        if (data) {
          setLocationNumberData(data.map((location) => location.number));
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchLocationsNumbersData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreateLocationFields()) {
      Alert("Please Fill All the Required Fields", "error");
      return;
    }
    setMainLoadingData(true);
    setLoadingData(true);
    const location = {
      name: locationName,
      number: locationNumber,
    };
    try {
      const newLocation = await createLocation(location);
      handleCloseClick();
      handleRefresh();
      setFormValues({ locationName: "", locationNumber: "" });
      setFormErrors({ locationName: "", locationNumber: "" });
      Alert("Location Created Successfully..!", "success");
    } catch (error) {
      Alert("Couldn't Create Location...!", "error");
    } finally {
      setLoadingData(false);
      setMainLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "30px" }}>Create location</h2>
        <button onClick={handleCloseClick}>
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
      <div className="CreateFlyoutBody">
        <h3>Enter The Details</h3>
        <FormGroup>
          <TextField
            label="Location Number"
            className="AdminTextFeilds"
            onBlur={(e) => {
              const locationNumber = e.target.value.trim();
              const exactMatch = locationNumbersData.some(
                (number) =>
                  number.toLowerCase() === locationNumber.toLowerCase()
              );
              const errorMessage = exactMatch
                ? "The Location Number Already Exists"
                : "";

              setFormErrors({
                ...formErrors,
                locationNumber: errorMessage,
              });

              if (!errorMessage) {
                setFormValues({
                  ...formValues,
                  locationNumber: locationNumber,
                });
              }
            }}
            onChange={(e) => {
              setFormValues({
                ...formValues,
                locationNumber: e.target.value,
              });
              setFormErrors({
                ...formErrors,
                locationNumber: "",
              });
            }}
            value={formValues.locationNumber}
            error={!!formErrors.locationNumber}
            required
          />
          <FormHelperText error={!!formErrors.locationNumber}>
            {formErrors.locationNumber}
          </FormHelperText>
        </FormGroup>
        <FormGroup>
          <TextField
            label="Location Name"
            className="AdminTextFeilds"
            onChange={(e) => {
              setFormValues({ ...formValues, locationName: e.target.value });
              setFormErrors({ ...formErrors, locationName: "" });
            }}
            value={locationName}
            error={!!formErrors.locationName}
            required
          ></TextField>
          <FormHelperText error={!!formErrors.locationName}>
            {formErrors.locationName}
          </FormHelperText>
        </FormGroup>
      </div>
      <div className="CreateFlyoutFooter">
        <Button className="CancelButton" onClick={handleCloseClick}>
          Cancel
        </Button>
        <Button
          disabled={loadingData || !!formErrors.locationNumber}
          onClick={handleCreate}
        >
          Create
        </Button>
      </div>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default NewLocation;
