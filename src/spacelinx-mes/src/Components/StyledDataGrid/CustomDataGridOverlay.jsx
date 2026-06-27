import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

const CustomNoRowsOverlay = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 1.25,
        py: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(99, 102, 241, 0.12)",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          boxShadow: "0 8px 24px rgba(79, 70, 229, 0.18)",
          mb: 0.5,
        }}
      >
        <InboxOutlinedIcon sx={{ fontSize: 42, color: "#6366F1" }} />
      </Box>
      <Typography
        sx={{
          fontFamily: "var(--header-font-family)",
          fontWeight: 600,
          fontSize: "1.15rem",
          letterSpacing: "0.04em",
        }}
      >
        Nothing here yet
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.6, maxWidth: 280 }}>
        No records to show. Add a new entry or adjust your filters to see data.
      </Typography>
    </Box>
  );
};

export default CustomNoRowsOverlay;
