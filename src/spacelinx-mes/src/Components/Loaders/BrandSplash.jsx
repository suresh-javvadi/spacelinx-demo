import React from "react";

// SARSPACE branded loading splash shown while the app boots.
const BrandSplash = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1.6rem",
      background: "#000000",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        fontFamily: "var(--header-font-family)",
        fontWeight: 700,
        fontSize: "3rem",
        letterSpacing: "0.16em",
        background: "var(--brand-gradient)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      }}
    >
      SARSPACE
    </div>
    <div className="sarspace-splash-bar">
      <span />
    </div>
  </div>
);

export default BrandSplash;
