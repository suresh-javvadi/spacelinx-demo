import { Box, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const CustomNoRowsOverlay = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}>
      <ErrorOutlineIcon sx={{ fontSize: 50, mb: 1 }} />
      <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
        No Data Available
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Add new entries to populate the table.
      </Typography>
    </Box>
  );
};

export default CustomNoRowsOverlay;
