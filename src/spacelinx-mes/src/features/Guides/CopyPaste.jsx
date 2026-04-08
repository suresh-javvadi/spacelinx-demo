import React, { useContext } from "react";
import { AlertsContext } from "../AlertsContext/Context";

const CopyPaste = ({ onImagePaste, selectedStepId }) => {
  const { Alert } = useContext(AlertsContext);

  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData?.items;
    if (clipboardItems) {
      for (let i = 0; i < clipboardItems.length; i++) {
        const clipboardItem = clipboardItems[i];
        if (clipboardItem.kind === "file") {
          const pastedImageBlob = clipboardItem.getAsFile();
          onImagePaste(pastedImageBlob, selectedStepId);
          return;
        }
      }
    }
    Alert("Copy An Image Or Take A Screenshot To Proceed", "error");
  };

  const handleClickPaste = async (e) => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (
          item.types.includes("image/png") ||
          item.types.includes("image/jpeg")
        ) {
          const blob = await item.getType(item.types[0]);
          onImagePaste(blob, selectedStepId);
          return;
        }
      }
      Alert("Paste An Image Or Take A Screenshot To Proceed", "error");
    } catch (error) {
      console.error("Error reading clipboard:", error);
      Alert("Failed to read clipboard", "error");
    }
  };

  return (
    <div className="PasteContainer">
      <ion-icon
        name="clipboard-outline"
        title="Ctrl V"
        onClick={handleClickPaste}
      ></ion-icon>

      <input
        type="text"
        onPaste={handlePaste}
        style={{ position: "absolute", left: "-9999px", opacity: 0 }}
      />
    </div>
  );
};

export default CopyPaste;
