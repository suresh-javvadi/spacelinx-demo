import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { ClipLoader } from "react-spinners";
import "./MaskLoader.css";
const Mask = ({ message }) => {
  return (
    <Backdrop className="MaskMainDiv" open={true}>
      <ClipLoader
        color={"#ffff"}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      <p className="MaskLoaderMessage">{message}</p>
    </Backdrop>
  );
};

export default Mask;
