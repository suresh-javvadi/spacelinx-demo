import React, { useState, useEffect, useContext, useRef } from "react";
import ChildPart from "../../admin/parts/ChildPart";
import {
  Tab,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { fetchPartVersions } from "../../../services/partService";
import Autocomplete from "@mui/material/Autocomplete";
import "../../admin/admin.css";
import Cliploader from "../../../Components/Loaders/Cliploader";
import { AlertsContext } from "../../AlertsContext/Context";
import { FlyoutAlerts } from "../../AlertsContext/Alerts";
import Documents from "../../../Components/Documents/Documents";
import noImageDark from "../../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noImageLight from "../../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import { useTheme } from "@mui/material/styles";
import PartUsedIn from "../../admin/parts/PartUsedIn";
import { useUserContext } from "../../userContext/UserContext";
import ImagePreviewDrawer from "../../../Components/ImagePreviewDrawer/ImagePreviewDrawer";
import PartInventory from "../../admin/parts/PartInventory";
import InventoryTransaction from "./InventoryTransaction";
import { PERMISSIONS } from "../../../constants/PagePermissions";
import TransactionHistory from "./TransactionHistory";

const EditPartInventory = ({ handleCloseClick, selectedPartNumberSuffix }) => {
  const { hasPermission } = useUserContext();
  const { Alert } = useContext(AlertsContext);
  const [loadingData, setLoadingData] = useState(true);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
  const [editPartName, setEditPartName] = useState("");
  const [canPartDelete, setCanPartDelete] = useState(true);
  const [editFlyOutTabsValue, setEditFlyOutTabsValue] = useState("1");
  const [serialNumberRequiredValue, setSerialNumberRequiredValue] =
    useState(true);
  const [editWeight, setEditWeight] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const theme = useTheme();
  const NoImagePNG = theme.palette.mode === "dark" ? noImageDark : noImageLight;
  const [partVersionsData, setPartVersionsData] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const selectedId = selectedPart?.part?.id;
  const [editManufacturingPartNumber, setEditManufacturingPartNumber] =
    useState("");
  const [editUnitPrice, setEditUnitPrice] = useState("");

  const fileInputRef = useRef(null);

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
        const defaultPart = sortedData[0] || null;
        setSelectedPart(defaultPart);

        if (defaultPart) {
          const part = defaultPart.part;
          setEditPartName(part?.name || "");
          setEditWeight(part?.weight);
          setSerialNumberRequiredValue(part?.isSerialNumberRequired);
          setEditManufacturingPartNumber(part?.manufacturingPartNumber || "");
          setEditUnitPrice(part?.unitPrice);
          setPreviewImageUrl(defaultPart.imageUrl || NoImagePNG);
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

  const EditPartDrawerClose = () => {
    setReadOnlyMode(true);
    handleCloseClick();
    setEditFlyOutTabsValue("1");
  };

  const editFlyoutTabChange = (event, newValue) => {
    setEditFlyOutTabsValue(newValue);
    if (newValue === "1") {
      setReadOnlyMode(true);
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

  return (
    <div className="EditFlyout">
      {loadingData ? (
        <div className="loading-container">
          <Cliploader loading={loadingData} />
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
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <p className="EditPartHeaderMakeBuy">
                {selectedPart?.part?.makeBuy === 0 ? "Make" : "Buy"}
              </p>
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
              <p className="EditPartHeaderStatus">
                Status:{" "}
                {selectedPart?.part?.status === "Draft"
                  ? ""
                  : selectedPart?.part?.status}
              </p>{" "}
              <Divider
                className="VerticalDivider"
                orientation="vertical"
                flexItem
              />
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
                <Tab label="Inventory" value="1" fullWidth />
                {hasPermission(PERMISSIONS.PARTS.VIEW) && (
                  <Tab label="Details" value="3" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.TRANSACTIONS.VIEW) && (
                  <Tab label="Transactions" value="2" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.BOM.VIEW) && (
                  <Tab label="BOM" value="4" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.WHEREUSED.VIEW) && (
                  <Tab label="Where Used" value="5" fullWidth />
                )}
                {hasPermission(PERMISSIONS.PARTS.DOCUMENTS.VIEW) && (
                  <Tab label="Documents" value="6" fullWidth />
                )}
              </TabList>
            </div>
            <>
              <TabPanel value="3" className="EditFlyoutTabPanel">
                <div className={"EditFlyoutContent"}>
                  <div className="EditFlyoutContentLeft">
                    <TextField
                      label="Part Number"
                      name="partNumber"
                      value={selectedPart?.part?.partNumber || ""}
                      InputProps={{ readOnly: true }}
                      className="AdminTextFeilds"
                      fullWidth
                    />

                    <TextField
                      label="Part Type"
                      value={selectedPart?.part?.partType?.name}
                      className="AdminTextFeilds"
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />

                    <TextField
                      label="Part Name"
                      className="AdminTextFeilds"
                      value={editPartName}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />

                    <TextField
                      label="Unit Of Measure"
                      value={selectedPart?.unitOfMeasure?.name || ""}
                      className="AdminTextFeilds"
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />

                    <TextField
                      label="Weight (g)"
                      className="AdminTextFeilds"
                      placeholder="Enter weight in grams"
                      type="number"
                      value={editWeight}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                    {selectedPart?.part?.makeBuy === 1 && (
                      <>
                        <TextField
                          label="Manufacturing Part Number"
                          name="manufacturingPartNumber"
                          className="AdminTextFeilds"
                          value={editManufacturingPartNumber}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />

                        <TextField
                          label="Unit Price"
                          name="unitPrice"
                          className="AdminTextFields"
                          value={editUnitPrice}
                          InputProps={{ readOnly: true }}
                          fullWidth
                        />
                      </>
                    )}

                    <div className="SerialNumberRequiredDiv">
                      <p>Serial Number Required:</p>
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        name="radio-buttons-group"
                        value={serialNumberRequiredValue}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                        }}
                        disabled
                      >
                        <FormControlLabel
                          value={true}
                          control={<Radio />}
                          disabled
                          label="Yes"
                        />
                        <FormControlLabel
                          value={false}
                          control={<Radio />}
                          disabled
                          label="No"
                        />
                      </RadioGroup>
                    </div>
                  </div>
                  <div className="EditFlyoutContentRight">
                    <div className="EditPartImage">
                      <img
                        onClick={handlePreviewClick}
                        src={previewImageUrl || NoImagePNG}
                        alt={selectedPart?.part?.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = NoImagePNG;
                        }}
                      />
                    </div>
                  </div>{" "}
                </div>
              </TabPanel>
              <TabPanel value="4">
                <ChildPart
                  selectedId={selectedId}
                  selectedPart={selectedPart}
                  canPartDelete={canPartDelete}
                  canEdit={false}
                />
              </TabPanel>
              <TabPanel value="6">
                <Documents
                  entityId={selectedId}
                  entityType="Part"
                  canDelete={hasPermission(PERMISSIONS.PARTS.DOCUMENTS.DELETE)}
                  canEdit={hasPermission(PERMISSIONS.PARTS.DOCUMENTS.MODIFY)}
                  isDraft={selectedPart?.part?.status === "Draft"}
                />
              </TabPanel>
              <TabPanel value="5">
                <PartUsedIn selectedPartId={selectedId} />
              </TabPanel>{" "}
              <TabPanel value="1" style={{ padding: 0, margin: 0 }}>
                <PartInventory selectedPartId={selectedId} />
              </TabPanel>
              <TabPanel value="2" style={{ padding: 0, margin: 0 }}>
                <TransactionHistory partId={selectedId} />
              </TabPanel>
            </>
          </TabContext>

          <ImagePreviewDrawer
            open={previewOpen}
            imageUrl={previewImageUrl}
            onClose={closePreview}
          />

          <div className="AlertMessages">
            <FlyoutAlerts />
          </div>
        </>
      )}
    </div>
  );
};

export default EditPartInventory;
