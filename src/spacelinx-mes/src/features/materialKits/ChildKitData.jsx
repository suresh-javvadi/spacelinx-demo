import React, { useEffect, useState, useContext, useRef } from "react";
import {
  fetchGuideBomWithKitId,
  fetchSerialNumberWithkitId,
} from "../../services/childKitService";
import { Divider, Modal, Fade, IconButton, Drawer } from "@mui/material";
import Cliploader from "../../Components/Loaders/Cliploader";
import { AlertsContext } from "../AlertsContext/Context";
import { HomeAlerts } from "../AlertsContext/Alerts";
import AddEditChildKit from "./AddEditChildKit";
import { updateMaterialKitPicture } from "../../services/materialKitService";
import CameraComponent from "./CameraComponent";
import { useTheme } from "@mui/material/styles";
import noImageDark from "../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noImageLight from "../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import { useUserContext } from "../userContext/UserContext";
import { PERMISSIONS } from "../../constants/PagePermissions";
import { StyledDataGrid } from "../../Components/StyledDataGrid/StyledDataGrid";

const ChildKitData = ({
  materialKitData,
  setChildKitDataDrawer,
  childKitData,
  fetchMaterialKitData,
  openPartDetailsDrawer,
}) => {
  const { hasPermission } = useUserContext();
  const [childKitGenealogy, setChildKitGenealogy] = useState([]);
  const materialKitImage = materialKitData?.image?.filePath;
  const [loadingData, setLoadingData] = useState(false);
  const [showImageFlyout, setShowImageFlyout] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const { Alert } = useContext(AlertsContext);
  const [
    AddEditChildMaterialKitDrawerStatus,
    setAddEditChildMaterialKitDrawerStatus,
  ] = useState(false);
  const materialKitId = materialKitData?.id;
  const [cameraOpen, setCameraOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();
  const NoImagePNG = theme.palette.mode === "dark" ? noImageDark : noImageLight;
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    if (!hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)) {
      Alert("You do not have permission to modify material kits!", "warning");
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const imageFile = e.target.files[0];
    handleUpdatePicture(materialKitId, imageFile);
  };

  const handleCapture = async (imageSrc) => {
    if (!hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)) {
      Alert("You do not have permission to modify material kits!", "warning");
      return;
    }
    try {
      const blob = await (await fetch(imageSrc)).blob();
      const file = new File([blob], "captured-image.jpg", {
        type: "image/jpeg",
      });
      handleUpdatePicture(materialKitId, file);
      setCameraOpen(false);
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  const handleUpdatePicture = async (id, imageFile) => {
    if (!imageFile) return;
    const tempImageUrl = URL.createObjectURL(imageFile);
    setSelectedImage(tempImageUrl);
    const formData = new FormData();
    formData.append("imageFile", imageFile);
    try {
      const response = await updateMaterialKitPicture(id, formData);
      fetchMaterialKitData();
      setIsEditing(false);
      Alert("Image Edited Successfully..!", "success");
    } catch (error) {
      Alert("Couldn't Edit Image...!", "error");
      console.error("Error updating image:", error);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageFlyout(true);
  };

  const handleCloseImageFlyout = () => {
    setShowImageFlyout(false);
    setSelectedImage("");
  };
  useEffect(() => {
    if (childKitData) {
      fetchWorkOrderData();
    }
  }, [childKitData]);
  const fetchWorkOrderData = async () => {
    setLoadingData(true);
    try {
      const KitBom = await fetchGuideBomWithKitId(childKitData.id);
      const serialNumbersData = await fetchSerialNumberWithkitId(
        childKitData.id
      );
      const mergedData = KitBom.map((kit) => {
        const matchedData = serialNumbersData.filter(
          (serial) => kit.ebomPartId === serial.partId
        );
        return {
          ...kit,
          consumedQuantity: matchedData
            ? matchedData.filter((serial) => serial.status === "Consumed")
                .length
            : 0,
          unConsumedQuantity: matchedData
            ? matchedData.filter((serial) => serial.status === "UnConsumed")
                .length
            : 0,
        };
      });
      if (mergedData) {
        setChildKitGenealogy(mergedData.filter((item) => item.quantityM > 0));
      }
      setLoadingData(false);
    } catch (error) {
      Alert("Couldn't fetch MBOM for this Kit...!", "error");
      console.log(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddEditCloseClick = () => {
    setAddEditChildMaterialKitDrawerStatus(false);
  };

  const columns = [
    {
      field: "partNumber",
      headerName: "Part Number",
      flex: 2,
      renderCell: ({ row }) => {
        const partObj = {
          id: row?.partId,
          name: row?.name,
          partNumber: row?.partNumber,
          partNumberSuffix: row?.partNumberSuffix,
        };

        return (
          <div
            className="AppHyperLink"
            onClick={(e) => {
              e.stopPropagation();
              openPartDetailsDrawer(partObj);
            }}
          >
            {row?.partNumber || "---"}
          </div>
        );
      },
    },

    {
      field: "quantityE",
      headerName: "Q (E)",
      flex: 1,
    },

    {
      field: "quantityM",
      headerName: "Q (M)",
      flex: 1,
    },

    {
      field: "isSerialNumberRequired",
      headerName: "Serial No Req.",
      flex: 1.5,
      renderCell: ({ row }) => (row.isSerialNumberRequired ? "Yes" : "No"),
    },

    {
      field: "consumedQuantity",
      headerName: "Consumed",
      flex: 1,
    },

    {
      field: "unConsumedQuantity",
      headerName: "Unconsumed",
      flex: 1,
    },

    {
      field: "actions",
      headerName: "",
      width: 50,
      renderCell: ({ row, id }) => {
        if (!row.isSerialNumberRequired) return null;

        return (
          <ion-icon
            class={
              !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                ? "IonIconDisabled ChildKitActionIcon"
                : "ChildKitActionIcon"
            }
            name="arrow-forward-circle-outline"
            onClick={() => {
              if (!hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)) {
                Alert(
                  "You do not have permission to modify material kits!",
                  "warning"
                );
                return;
              }

              const rowIndex = childKitGenealogy.findIndex((r) => r.id === id);
              setSelectedRow(row);
              setAddEditChildMaterialKitDrawerStatus(true);
            }}
          ></ion-icon>
        );
      },
    },
  ];

  return (
    <>
      <div className="ChildKitDatacontainer">
        <div className="ChildKitDataFlyoutHeader">
          <div className="CreateFlyoutHeaderChildKit">
            <h2>Kit Details</h2>
            <ion-icon
              name="close-outline"
              onClick={() => setChildKitDataDrawer(false)}
            ></ion-icon>
          </div>
        </div>
        {loadingData ? (
          <div className="loader-container">
            <Cliploader loading={loadingData} />
          </div>
        ) : (
          <div className="ChildKitDataDetailsBody1">
            <div className="ChildKitDetailsHeader">
              <div className="ChildKitDetailsHeaderInner">
                <h2>Name</h2>:{" "}
                <p>
                  {childKitData?.name}/{childKitData?.number}
                </p>
              </div>

              <div className="ChildKitDetailsHeaderInner">
                <h2>Part</h2>:{" "}
                <p>
                  {childKitData?.part?.name}/{childKitData?.part?.partNumber}
                </p>
              </div>

              {childKitData?.location && (
                <div className="ChildKitDetailsHeaderInner">
                  <h2>Location</h2>: <p>{childKitData?.location?.name}</p>
                </div>
              )}

              <div className="ChildKitDetailsHeaderInner">
                <h2>Work Order No.</h2>:{" "}
                <p>{childKitData?.workOrder?.number}</p>
              </div>
            </div>

            <div className="ChildKitDataDetailsBody">
              <div className="ChildKitDataDetailsDivBody">
                <div className="ChildKitDataDetailsDivBodyRow">
                  <div className="ChildKitDataGridDiv">
                    <h2 className="ChildKitDataGridHeader">Details:</h2>
                    <StyledDataGrid
                      rows={childKitGenealogy}
                      columns={columns}
                      getRowId={(row) => row.ebomId}
                      className="ChildKitDataGrid"
                    />
                  </div>
                  <h2>Kit Image:</h2>
                  <div className="ChildKitDataDetailsImage">
                    <img
                      src={
                        selectedImage ||
                        (materialKitImage ? materialKitImage : NoImagePNG)
                      }
                      alt="Material Kit Image"
                      onClick={() =>
                        handleImageClick(selectedImage || materialKitImage)
                      }
                    />

                    <div className="icons-container">
                      <p
                        onClick={() => {
                          if (!hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)) {
                            Alert(
                              "You do not have permission to modify material kits!",
                              "warning"
                            );
                            return;
                          }
                          setIsEditing(!isEditing);
                        }}
                        className={
                          !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                            ? "IonIconDisabled icons-child1"
                            : "icons-child1"
                        }
                      >
                        <ion-icon
                          name={isEditing ? "close-outline" : "create-outline"}
                          title={isEditing ? "Close" : "Edit"}
                          class={
                            !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                              ? "IonIconDisabled ChildKitImageEditIcon"
                              : "ChildKitImageEditIcon"
                          }
                        ></ion-icon>
                        {isEditing ? "Close" : "Edit"}
                      </p>

                      {isEditing && (
                        <div className="MaterialKitImageControlsDiv">
                          <p
                            className={
                              !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                                ? "IonIconDisabled upload"
                                : "upload"
                            }
                            onClick={handleUploadClick}
                          >
                            <ion-icon
                              name="share-outline"
                              className={
                                !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                                  ? "IonIconDisabled"
                                  : undefined
                              }
                            ></ion-icon>
                            Upload
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            disabled={
                              !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                            }
                          />
                          <p
                            onClick={() => {
                              if (
                                !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                              ) {
                                Alert(
                                  "You do not have permission to modify material kits!",
                                  "warning"
                                );
                                return;
                              }
                              setCameraOpen(true);
                            }}
                            className={
                              !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                                ? "IonIconDisabled camera"
                                : "camera"
                            }
                          >
                            <ion-icon
                              name="camera-outline"
                              class={
                                !hasPermission(PERMISSIONS.MATERIALKITS.MODIFY)
                                  ? "IonIconDisabled"
                                  : undefined
                              }
                            ></ion-icon>
                            Camera
                          </p>
                        </div>
                      )}
                    </div>

                    {cameraOpen && (
                      <CameraComponent
                        onSave={handleCapture}
                        onClose={() => setCameraOpen(false)}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <Drawer
          anchor="right"
          open={AddEditChildMaterialKitDrawerStatus}
          onClose={handleAddEditCloseClick}
          PaperProps={{ className: "ChildKitDrawerStyles" }}
        >
          <AddEditChildKit
            selectedRow={selectedRow}
            kitId={childKitData.id}
            handleAddEditCloseClick={handleAddEditCloseClick}
          />
        </Drawer>
        <Modal open={showImageFlyout} onClose={handleCloseImageFlyout}>
          <Fade in={showImageFlyout}>
            <div className="image-flyout">
              <IconButton
                onClick={handleCloseImageFlyout}
                className="close-button"
              >
                <ion-icon name="close-outline"></ion-icon>
              </IconButton>
              <img
                src={selectedImage || NoImagePNG}
                alt="Selected Material Kit"
              />
            </div>
          </Fade>
        </Modal>
        <div className="AlertMessages">
          <HomeAlerts />
        </div>
      </div>
    </>
  );
};

export default ChildKitData;
