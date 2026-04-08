import React, { useRef, useEffect, useState, useContext } from "react";
import Webcam from "react-webcam";
import {
  TextField,
  MenuItem,
  styled,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import "../../features/features.css";
import { AlertsContext } from "../AlertsContext/Context";
import { FlyoutAlerts } from "../AlertsContext/Alerts";
import capturePictureImage from "../../Assest/Images/CircleImageForCapture.png";
import "./CameraComponent.css";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const CameraComponent = ({ onSave, onClose }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);
  const { Alert } = useContext(AlertsContext);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        Alert("Error fetching devices", "error");
        console.error("Error fetching devices:", error);
      }
    };

    getDevices();
  }, []);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
      } else {
        console.error("Failed to capture image.");
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleSave = () => {
    if (capturedImage) {
      onSave(capturedImage);
    }
  };

  const handleDeviceChange = (event) => {
    setSelectedDeviceId(event.target.value);
  };

  return (
    <div>
      <StyledModal
        open={true}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={true}>
          <div className="VideoCameraCompDiv">
            <div className="VideoCameraCompDivHeader">
              <ion-icon name="close-outline" onClick={onClose}></ion-icon>
            </div>
            <div className="VideoCameraCompDivBody">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="CapturedImage"
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ deviceId: selectedDeviceId }}
                />
              )}
            </div>
            <div className="CameraControls">
              <TextField
                select
                fullWidth
                className="CameraInputSelect"
                value={selectedDeviceId}
                onChange={handleDeviceChange}
              >
                {devices.map((device) => (
                  <MenuItem
                    key={device.deviceId}
                    className="menu-item"
                    value={device.deviceId}
                  >
                    {device.label || `Camera ${device.deviceId}`}
                  </MenuItem>
                ))}
              </TextField>
              <button
                className="CapturePic"
                onClick={!capturedImage ? handleCapture : handleRetake}
              >
                {!capturedImage ? (
                  <img src={capturePictureImage} alt="Capture" />
                ) : (
                  <ion-icon name="refresh-outline"></ion-icon>
                )}
              </button>
              <button
                className="SavePic"
                onClick={handleSave}
                style={{ color: capturedImage ? "white" : "grey" }}
              >
                <ion-icon name="save-outline"></ion-icon>
              </button>
            </div>
          </div>
        </Fade>
      </StyledModal>
      <div className="AlertMessages">
        <FlyoutAlerts />
      </div>
    </div>
  );
};

export default CameraComponent;
