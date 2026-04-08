import React from "react";
import { ClipLoader } from "react-spinners";

const Cliploader = ({ loading }) => (
  <div className="loader-container">
    <ClipLoader
      color={"#009cbb"}
      loading={loading}
      size={30}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  </div>
);

export default Cliploader;
