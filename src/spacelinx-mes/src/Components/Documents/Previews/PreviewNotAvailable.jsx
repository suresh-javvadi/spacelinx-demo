import React from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const PreviewNotAvailable = ({ fileName, fileExtension, onDownload }) => {
  return (
    <div className="NoPreviewContainer">
      <Card className="NoPreviewCard">
        <CardContent className="NoPreviewCardContent">
          <div className="NoPreviewIconWrapper">
            <InsertDriveFileIcon className="NoPreviewIcon" />
          </div>
          <Typography variant="h5" className="NoPreviewTitle">
            Preview Not Available
          </Typography>
          <Typography variant="body1" className="NoPreviewText">
            The file <strong>{fileName}</strong> with type{" "}
            <strong>{fileExtension}</strong> cannot be previewed.
          </Typography>
          <Button
            variant="contained"
            onClick={onDownload}
            className="DownloadButton"
          >
            Download File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewNotAvailable;
