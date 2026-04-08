import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import "./ImagePreviewDrawer.css";
import noImageDark from "../../Assest/Images/noimagelarge/noimagelargedarkmode.png";
import noImageLight from "../../Assest/Images/noimagelarge/noimagelargelightmode.png";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

const ImagePreviewDrawer = ({ open, imageUrl, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const theme = useTheme();
  const NoImagePNG = theme.palette.mode === "dark" ? noImageDark : noImageLight;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "image.png";
    link.click();
  };

  const handleReset = () => {
    setZoomLevel(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e) => {
    e.preventDefault();

    const zoomStep = 0.005; // smaller value = smoother zoom
    const newZoom = zoomLevel - e.deltaY * zoomStep;

    setZoomLevel(Math.min(Math.max(newZoom, 0.5), 3));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: isFullScreen ? "100vw" : "80vw",
          maxWidth: isFullScreen ? "100vw" : "80vw",
          height: "100vh",
          marginRight: isFullScreen ? 0 : "10vw",
          marginLeft: isFullScreen ? 0 : "10vw",
          boxShadow: 24,
          borderRadius: isFullScreen ? 0 : "12px 0 0 12px",
          overflow: "hidden",
          transition: "margin 0.3s ease, width 0.3s ease",
        },
      }}
    >
      <div className="ImagePreviewDrawerContainer">
        <img
          src={imageUrl || NoImagePNG}
          alt="Preview"
          style={{
            transform: `scale(${zoomLevel}) translate(${offset.x}px, ${offset.y}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
            cursor: zoomLevel > 1 ? "grab" : "default",
          }}
          onMouseDown={(e) => {
            if (zoomLevel <= 1) return;
            setIsDragging(true);
            setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setOffset({
              x: e.clientX - dragStart.x,
              y: e.clientY - dragStart.y,
            });
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onWheel={handleWheelZoom}
          draggable={false}
        />

        <div className="ImagePreviewDrawerControls">
          <Tooltip title="Zoom In" arrow>
            <IconButton
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 3))}
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom Out" arrow>
            <IconButton
              onClick={() =>
                setZoomLevel((z) => Math.max(z - 0.2, isFullScreen ? 0.5 : 1))
              }
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset View" arrow>
            <IconButton onClick={handleReset}>
              <span className="material-symbols-outlined">refresh</span>
            </IconButton>
          </Tooltip>

          <Tooltip title="Download Image" arrow>
            <IconButton onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            arrow
          >
            <IconButton onClick={() => setIsFullScreen((prev) => !prev)}>
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Close Preview" arrow>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Drawer>
  );
};

export default ImagePreviewDrawer;
