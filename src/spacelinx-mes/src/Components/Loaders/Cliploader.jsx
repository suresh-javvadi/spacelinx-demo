import React from "react";
import { ClipLoader } from "react-spinners";

const Cliploader = ({ loading }) => (
  <div className="loader-container">
    <ClipLoader
      color={"#4F46E5"}
      loading={loading}
      size={30}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  </div>
);

export default Cliploader;
