import React, { useState, useEffect, useContext } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { Autocomplete } from "@mui/material";
import { createFilterOptions } from "@mui/material";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  fetchPartsLookUp,
  fetchUniqueReleaseParts,
} from "../../services/partService";
import { fetchUsers } from "../../services/userService";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { createWorkPackage } from "../../services/WorkOrderPackage";
import {
  fetchGuidesWithNumber,
  PartsHavingPublishedGuide,
} from "../../services/guideService";
import { fetchProduct } from "../../services/productService";
import { AlertsContext } from "../AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import Cliploader from "../../Components/Loaders/Cliploader";

const CreateWorkPackage = ({
  handleCloseClick,
  handleRefresh,
  setMainMOrderLoadingData,
}) => {
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [workOrderName, setWorkOrderName] = useState("");
  const [quantity, setQuantity] = useState(null);
  const [parentPart, setParentPart] = useState(null);
  const [startDate, setStartDate] = useState(dayjs());
  const [dueDate, setDueDate] = useState(dayjs());
  const [technicianRoles, setTechnicianRoles] = useState([]);
  const [managerRoles, setManagerRoles] = useState([]);
  const [managerRole, setManagerRole] = useState(null);
  const [technicianRole, setTechnicianRole] = useState(null);
  const [product, setProduct] = useState(null);
  const [workOrderTypeRadioOption, setWorkOrderTypeRadioOption] =
    useState("part");
  const filter = createFilterOptions();
  const [validationErrors, setValidationErrors] = useState({
    parentPart: "",
    product: "",
    assembly: "",
    workOrderName: "",
    managerRole: "",
    technicianRole: "",
    quantity: "",
  });
  const [selectedGuideId, setSelectedGuideId] = useState("");
  const [parts, setParts] = useState([]);
  const [products, setProducts] = useState([]);
  const [guideNumber, setGuideNumber] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [latestPublishedVersion, setLatestPublishedVersion] = useState(null);
  const [loadingManagerData, setLoadingManagerData] = useState(true);
  useEffect(() => {
    setParentPart(null);
    setProduct(null);
    setGuideNumber(null);
    setPlatformName(null);
    setLatestPublishedVersion(null);
    setSelectedGuideId(null);
    setQuantity(1);
    setWorkOrderName(null);
    setManagerRole(null);
  }, [workOrderTypeRadioOption]);

  useEffect(() => {
    const fetchPartsHavingPublishedGuide = async () => {
      setLoadingData(true);
      try {
        const publishedGuideParts = await PartsHavingPublishedGuide(); // parts with guide info
        const uniqueReleaseParts = await fetchUniqueReleaseParts(); // all unique parts

        const mergedParts = uniqueReleaseParts.map((part) => {
          const matchingGuidePart = publishedGuideParts.find(
            (g) => g.partId === part.id
          );

          return {
            ...part,
            guideNumber: matchingGuidePart ? matchingGuidePart.number : null,
            platformName: matchingGuidePart
              ? matchingGuidePart.platformName
              : null,
          };
        });

        setParts(mergedParts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPartsHavingPublishedGuide();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingData(true);
      try {
        const data = await fetchProduct();
        const updatedProductsData = data.map((product) => {
          const guideInfo = parts.find(
            (item) => item.partId === product.partId
          );

          return {
            ...product,
            guideNumber: guideInfo ? guideInfo.number : null,
          };
        });

        setProducts(
          updatedProductsData.sort((a, b) => b.sequence - a.sequence)
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchProducts();
  }, [workOrderTypeRadioOption]);

  useEffect(() => {
    const fetchTechniciansData = async () => {
      setLoadingManagerData(true);
      try {
        const data = await fetchUsers();
        const filterTechnicians = data.filter((user) =>
          user.roles.some((role) => role.roleName === "Engineer/Technician")
        );
        const filterManagers = data.filter((user) =>
          user.roles.some((role) => role.roleName === "Project Manager")
        );
        setManagerRoles(filterManagers);
        setTechnicianRoles(filterTechnicians);
      } catch (error) {
        Alert("Error Fetching Technicinans Data", "error");
        console.error("Error fetching technicians data:", error);
      } finally {
        setLoadingManagerData(false);
      }
    };

    fetchTechniciansData();
  }, []);

  const fetchGuideVersionsWithGNumber = async (number) => {
    setLoadingData(true);
    try {
      const data = await fetchGuidesWithNumber(number);
      return data;
    } catch (error) {
      Alert("Error Fetching Product Information", "error");
      console.error("Error fetching product part information:", error);
    } finally {
      setLoadingData(false);
    }
  };
  const validateForm = () => {
    let valid = true;
    const errors = {
      parentPart: "",
      product: "",
      workOrderName: "",
      technicianRole: "",
      materialKit: "",
      quantity: "",
    };

    if (workOrderTypeRadioOption === "part") {
      if (!parentPart) {
        errors.parentPart = "Parent Part is required.";
        valid = false;
      }
    } else {
      if (!product) {
        errors.product = "Product is required.";
        valid = false;
      }
    }

    if (!workOrderName) {
      errors.workOrderName = "Work Order Name is required.";
      valid = false;
    }

    if (!managerRole) {
      errors.managerRole = "Manager is required.";
      valid = false;
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      errors.quantity = "Quantity should be a positive number.";
      valid = false;
    }

    setValidationErrors(errors);
    return valid;
  };

  const handleCreate = async () => {
    setLoadingData(true);
    if (!validateForm()) {
      Alert("Please Fill All the Required Fields", "error");
      setLoadingData(false);
      return;
    }

    try {
      const workOrder = {
        name: workOrderName,
        quantity: quantity,
        technicianId: technicianRole ? technicianRole.id : null,
        managerId: managerRole ? managerRole.id : null,
        guideId: selectedGuideId,
        partId: parentPart.id,
        productId: product?.id,
        startDate: startDate.toISOString(),
        endDate: dueDate.toISOString(),
      };
      setMainMOrderLoadingData(true);
      const data = await createWorkPackage(workOrder);
      handleCloseClick();
      handleRefresh();
      Alert("Manufacturing Order Created Successfully...", "success");
    } catch (error) {
      Alert("Couldn't Create workorder — Please Try Again...", "error");
      console.error("Error creating work order:", error);
    } finally {
      setMainMOrderLoadingData(false);
      setLoadingData(false);
    }
  };

  return (
    <div className="CreateFlyout">
      <div className="CreateFlyoutHeader">
        <h2 style={{ marginLeft: "4%" }}>Create Work Order</h2>
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
            <Autocomplete
              value={parentPart}
              onChange={async (event, newValue) => {
                if (newValue) {
                  setParentPart(newValue);
                  setPlatformName(newValue?.platformName || null);

                  if (newValue.guideNumber) {
                    try {
                      const guideVersions = await fetchGuideVersionsWithGNumber(
                        newValue.guideNumber
                      );

                      const publishedVersions = guideVersions.filter(
                        (item) => item.status === "Published"
                      );

                      const latestPublished = publishedVersions.sort(
                        (a, b) => b.version - a.version
                      )[0];

                      setGuideNumber(newValue.guideNumber);
                      setValidationErrors((errors) => ({
                        ...errors,
                        parentPart: "",
                      }));

                      if (latestPublished) {
                        setLatestPublishedVersion(latestPublished);
                        setSelectedGuideId(latestPublished.id);
                      } else {
                        setLatestPublishedVersion(null);
                        setSelectedGuideId(null);
                        setValidationErrors((errors) => ({
                          ...errors,
                          parentPart: "No published guide version found",
                        }));
                      }
                    } catch (error) {
                      console.error("Error fetching guide versions:", error);
                    }
                  } else {
                    setGuideNumber(null);
                    setLatestPublishedVersion(null);
                    setSelectedGuideId(null);
                  }
                } else {
                  setParentPart(null);
                  setGuideNumber(null);
                  setPlatformName(null);
                  setLatestPublishedVersion(null);
                  setSelectedGuideId(null);
                }
              }}
              filterOptions={(options, params) => filter(options, params)}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              className="AdminTextFeilds"
              id="parent-child-autocomplete"
              options={parts}
              getOptionLabel={(option) =>
                `${option.partNumber} - ${option.name}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Part"
                  className="AdminTextFeilds"
                  error={!!validationErrors.parentPart}
                  helperText={validationErrors.parentPart}
                  required
                />
              )}
            />

            {guideNumber && (
              <div className="CreateWOGuideInfo">
                <div className="CreateWOGuideInfoChild1">
                  <p>Guide Number: {guideNumber}</p>
                  <p>Guide Version: {latestPublishedVersion?.version}</p>
                </div>
                <p>Platform: {platformName}</p>
              </div>
            )}

            <TextField
              label="Work Order Name"
              className="AdminTextFeilds"
              value={workOrderName || ""}
              onChange={(e) => {
                setWorkOrderName(e.target.value);
                setValidationErrors((errors) => ({
                  ...errors,
                  workOrderName: "",
                }));
              }}
              error={!!validationErrors.workOrderName}
              helperText={validationErrors.workOrderName}
              required
            />

            <Autocomplete
              id="manager-autocomplete"
              options={
                technicianRole
                  ? managerRoles.filter((item) => item.id !== technicianRole.id)
                  : managerRoles
              }
              loading={loadingManagerData}
              loadingText="Loading Managers..."
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName}`
              }
              renderOption={(props, option) => (
                <MenuItem
                  {...props}
                >{`${option.firstName} ${option.lastName}`}</MenuItem>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Manager"
                  className="AdminTextFeilds"
                  error={!!validationErrors.managerRole}
                  helperText={validationErrors.managerRole}
                  required
                />
              )}
              value={managerRole}
              onChange={(event, newValue) => {
                setManagerRole(newValue);
                setValidationErrors((errors) => ({
                  ...errors,
                  managerRole: "",
                }));
              }}
            />
            <TextField
              label="Quantity"
              className="AdminTextFeilds"
              type="number"
              inputProps={{ min: 1 }}
              value={quantity}
              onChange={(e) => {
                const inputValue = e.target.value;

                if (inputValue === "") {
                  setQuantity("");
                } else {
                  const num = Number(inputValue);
                  if (Number.isInteger(num) && num > 0) {
                    setQuantity(num);
                  }
                }
              }}
              error={quantity === "" || quantity <= 0}
              helperText={
                quantity === "" || quantity <= 0
                  ? validationErrors.quantity
                  : ""
              }
              required
            />

            <div className="NewWODatesDiv">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                />
                <DatePicker
                  label="Due Date"
                  value={dueDate}
                  minDate={startDate}
                  onChange={(date) => setDueDate(date)}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div className="CreateFlyoutFooter">
            <Button className="CancelButton" onClick={handleCloseClick}>
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

export default CreateWorkPackage;
