// Drop-in shim for `react-spinners` so every <ClipLoader/> in the app renders
// the SARSPACE branded gradient ring instead of a plain spinner.
// Aliased in vite.config.js: "react-spinners" -> this file.
import React from "react";

export const ClipLoader = ({ loading = true, size = 35, cssOverride, ...rest }) => {
  if (loading === false) return null;
  const dim = typeof size === "number" ? `${size}px` : size || "35px";
  return (
    <span
      className="sarspace-loader"
      style={{ width: dim, height: dim, ...(cssOverride || {}) }}
      role="status"
      aria-label="Loading"
    />
  );
};

// A few other react-spinners exports point at the same branded loader, just in
// case they get used later.
export const BeatLoader = ClipLoader;
export const PulseLoader = ClipLoader;
export const SyncLoader = ClipLoader;
export const MoonLoader = ClipLoader;

export default ClipLoader;
