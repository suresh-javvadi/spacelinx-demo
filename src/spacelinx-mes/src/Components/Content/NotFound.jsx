import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "relative",
        minHeight: "calc(100vh - 90px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        textAlign: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at 25% 25%, rgba(99,102,241,0.18), transparent 45%), radial-gradient(circle at 75% 80%, rgba(79,70,229,0.2), transparent 45%)",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontFamily: "var(--header-font-family)",
            fontWeight: 700,
            fontSize: "clamp(5rem, 18vw, 11rem)",
            lineHeight: 1,
            letterSpacing: "0.08em",
            background: "var(--brand-gradient)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          404
        </div>
        <h2
          style={{
            fontFamily: "var(--header-font-family)",
            fontWeight: 600,
            letterSpacing: "0.04em",
            margin: "10px 0 6px",
          }}
        >
          Page not found
        </h2>
        <p style={{ opacity: 0.6, marginBottom: 24 }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Button
          variant="contained"
          startIcon={<HomeOutlinedIcon />}
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
