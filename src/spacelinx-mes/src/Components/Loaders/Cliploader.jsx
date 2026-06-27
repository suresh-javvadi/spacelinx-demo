import React from "react";

// SARSPACE branded loader — a gradient ring (replaces the plain spinner).
// Keeps the same API (`loading`, optional `size`) so all existing call sites work.
const Cliploader = ({ loading = true, size = 40 }) => (
  <div className="loader-container">
    {loading && (
      <span
        className="sarspace-loader"
        style={{ width: size, height: size }}
        role="status"
        aria-label="Loading"
      />
    )}
  </div>
);

export default Cliploader;
