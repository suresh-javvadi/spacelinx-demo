import React, { useRef, useEffect, useContext, useState } from "react";
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
import "../materialKits/CameraComponent.css";

const StyledModal = styled(Modal)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const VideoCameraComponent = ({ onSave, onClose }) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const { Alert } = useContext(AlertsContext);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [paused, setPaused] = useState(false);

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

  useEffect(() => {
    let interval = null;
    if (recording && !paused) {
      interval = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording, paused]);

  const startRecording = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      const options = { mimeType: "video/webm" };
      const mediaRecorder = new MediaRecorder(
        webcamRef.current.stream,
        options
      );
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      setPaused(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setPaused(false);
    }
  };
  const handleRetake = () => {
    setPreviewUrl(null);
    setVideoBlob(null);
    setRecordingTime(0);
  };

  const handleSave = () => {
    if (videoBlob) {
      onSave(videoBlob);
      onClose();
    }
  };
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
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
              {previewUrl ? (
                <video src={previewUrl} controls className="VideoFeed" />
              ) : (
                <Webcam
                  ref={webcamRef}
                  className="VideoFeed"
                  videoConstraints={{ deviceId: selectedDeviceId }}
                />
              )}
              {recording && (
                <div className="RecordingTime">{formatTime(recordingTime)}</div>
              )}
            </div>
            <div className="CameraControls">
              <TextField
                select
                fullWidth
                className="CameraInputSelect"
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
              >
                {devices.map((device) => (
                  <MenuItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId}`}
                  </MenuItem>
                ))}
              </TextField>
              {previewUrl ? (
                <>
                  <button className="CapturePic" onClick={handleRetake}>
                    <ion-icon name="refresh-outline"></ion-icon>
                  </button>
                  <button className="CapturePic" onClick={handleSave}>
                    <ion-icon name="save-outline"></ion-icon>
                  </button>
                </>
              ) : (
                <button
                  className="CapturePic"
                  onClick={!recording ? startRecording : stopRecording}
                >
                  {!recording ? (
                    <img src={capturePictureImage} alt="Capture" />
                  ) : (
                    <ion-icon name="stop-circle-outline"></ion-icon>
                  )}
                </button>
              )}
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

export default VideoCameraComponent;
