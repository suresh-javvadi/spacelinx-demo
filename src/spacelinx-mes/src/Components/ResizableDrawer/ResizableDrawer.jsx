import React, { useRef, useState, useEffect } from "react";
import { Drawer } from "@mui/material";

const ResizableDrawer = ({
  anchor,
  open,
  onClose,
  children,
  defaultWidth = 50,
  minWidth = 40,
  maxWidth = 90,
}) => {
  const drawerRef = useRef(null);
  const isDragging = useRef(false);
  const [drawerWidth, setDrawerWidth] = useState(`${defaultWidth}%`);
  const dragStartXPosition = useRef(0);
  const dragStartWidth = useRef(0);

  const getClampedWidth = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  useEffect(() => {
    setDrawerWidth(`${defaultWidth}%`);
  }, [defaultWidth]);

  const handleStartDragging = (event) => {
    isDragging.current = true;
    dragStartXPosition.current = event.clientX;
    dragStartWidth.current = parseFloat(drawerWidth);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleDragging);
    document.addEventListener("mouseup", handleEndDragging);
    event.preventDefault();
  };

  const handleDragging = (event) => {
    if (!isDragging.current || !drawerRef.current) return;

    const mouseMovementX = event.clientX - dragStartXPosition.current;
    const resizeDirection = anchor === "right" ? -1 : 1;
    const newWidthPercentage =
      dragStartWidth.current +
      (mouseMovementX / window.innerWidth) * 100 * resizeDirection;

    const clampedWidth = getClampedWidth(
      newWidthPercentage,
      minWidth,
      maxWidth
    );
    setDrawerWidth(`${clampedWidth}%`);
  };

  const handleEndDragging = () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", handleEndDragging);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleDragging);
      document.removeEventListener("mouseup", handleEndDragging);
    };
  }, []);

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          width: drawerWidth,
          overflow: "hidden",
        },
        ref: drawerRef,
      }}
    >
      {children}
      <div
        className={`DrawerResizeHandle ${
          anchor === "right"
            ? "DrawerResizeHandleLeft"
            : "DrawerResizeHandleRight"
        }`}
        onMouseDown={handleStartDragging}
      />
    </Drawer>
  );
};

export default ResizableDrawer;
