import React from "react";
import FilerobotImageEditor, { TABS } from "react-filerobot-image-editor";

const ImageEditor = ({
  source,
  onSaveImage,
  isFullScreen,
  onClose,
  loadingData,
}) => {
  const handleSave = (editedImageObject) => {
    loadingData(true);
    onSaveImage(editedImageObject.imageBase64);
  };

  return (
    <div
      className={`image-editor-container ${isFullScreen ? "full-screen" : ""}`}
    >
      {isFullScreen && (
        <FilerobotImageEditor
          source={source}
          onSave={handleSave}
          onClose={onClose}
          annotationsCommon={{
            fill: "black",
          }}
          Text={{ text: "" }}
          Rotate={{ angle: 90, componentType: "slider" }}
          tabsIds={[
            TABS.ADJUST,
            TABS.ANNOTATE,
            TABS.FILTERS,
            TABS.FINETUNE,
            TABS.WATERMARK,
            TABS.RESIZE,
          ]}
          defaultTabId={TABS.ADJUST}
        />
      )}
    </div>
  );
};

export default ImageEditor;
