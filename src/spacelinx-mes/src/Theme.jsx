import { createTheme } from "@mui/material";

const GetTheme = (themeMode) =>
  createTheme({
    palette: {
      mode: themeMode,
      ...(themeMode === "dark"
        ? {
            primary: { main: "#a1a1a1" },
            secondary: { main: "#8c8c8c" },
            background: { paper: "#16161f", default: "#0a0a14" },
          }
        : {
            primary: { main: "#A1A1A1" },
            secondary: { main: "#C0C0C0" },
          }),
    },
    typography: {
      fontFamily: "var(--body-font-family)",
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            fontFamily: "var(--body-font-family)",
          },
          body: {
            fontFamily: "var(--body-font-family)",
          },
          "h1, h2, h3, h4, h5, h6": {
            fontWeight: "normal",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color:
              themeMode === "dark"
                ? "var(--light-primary-color)"
                : "var(--dark-primary-color)",
            "&.Mui-selected": {
              color: "#6366F1",
              backgroundColor: "rgba(99, 102, 241, 0.12)",
            },
            textTransform: "none",
            flex: "1",
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: "#6366F1",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: "#6366F1",
            color: "#ffffff",
          },
          outlinedPrimary: {
            borderColor: "#6366F1",
            color: "#6366F1",
          },
        },
      },

      MuiButton: {
        defaultProps: {
          variant: "outlined",
        },
        styleOverrides: {
          root: {
            backgroundColor:
              themeMode === "dark"
                ? "var(--button-background-color-dark)"
                : "var(--button-background-color-light)",
            color:
              themeMode === "dark"
                ? "var(--button-color-dark)"
                : "var(--button-color-light)",
            border:
              themeMode === "dark"
                ? "1px solid var(--border-color-dark)"
                : "1px solid var(--border-color-light)",
            "&:not(.Mui-disabled):hover": {
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              border:
                themeMode === "dark"
                  ? "1px solid var(--border-color-dark)"
                  : "1px solid var(--border-color-light)",
            },
            "&:active": {
              transform: "scale(0.95)",
              opacity: 0.8,
            },
            "&.Mui-disabled": {
              pointerEvents: "auto",
              cursor: "not-allowed",
            },
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            fontFamily: "var(--body-font-family)",
            "&.CancelButton": {
              border:
                themeMode === "dark"
                  ? "2px solid var(--cancel-button-border-dark)"
                  : "2px solid var(--cancel-button-border-light)",
              color:
                themeMode === "dark"
                  ? "var(--cancel-button-color-dark)"
                  : "var(--cancel-button-color-light)",
              backgroundColor:
                themeMode === "dark"
                  ? "var(--cancel-button-bg-dark)"
                  : "var(--cancel-button-bg-light)",
              "&:hover": {
                backgroundColor:
                  themeMode === "dark"
                    ? "var(--cancel-button-bg-dark)"
                    : "var(--cancel-button-bg-light)",
                color:
                  themeMode === "dark"
                    ? "var(--cancel-button-color-dark)"
                    : "var(--cancel-button-color-light)",
                border:
                  themeMode === "dark"
                    ? "2px solid var(--cancel-button-border-dark)"
                    : "2px solid var(--cancel-button-border-light)",
              },
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            backgroundColor:
              themeMode === "dark"
                ? "var(--accordion-summary-bg-dark)"
                : "var(--accordion-summary-bg-light)",
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            backgroundColor:
              themeMode === "dark"
                ? "var(--accordion-details-bg-dark)"
                : "var(--accordion-details-bg-light)",
            padding:
              themeMode === "dark"
                ? "var(--accordion-details-padding-dark)"
                : "var(--accordion-details-padding-light)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor:
              themeMode === "dark"
                ? "var(--drawer-bg-color-dark)"
                : "var(--drawer-bg-color-light)",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: "none",
            backgroundColor:
              themeMode === "dark"
                ? "var(--drawer-bg-color-dark)"
                : "var(--drawer-bg-color-light)",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
        styleOverrides: {
          root: {
            "& input[type='date']::-webkit-calendar-picker-indicator": {
              filter: themeMode === "dark" ? "invert(1)" : "none",
            },
          },
        },
      },

      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 10,
          },
          bar: {
            backgroundColor: "var(--link-color)",
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: "#6366F1",
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: "var(--link-color)",
            "&.Mui-checked": {
              color: "var(--link-color)",
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: "var(--link-color)",
            "&.Mui-checked": {
              color: "var(--link-color)",
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            "&.Mui-checked": {
              color: "var(--link-color)",
              "& + .MuiSwitch-track": {
                backgroundColor: "var(--link-color)",
              },
            },
          },
        },
      },
    },
  });

export default GetTheme;
