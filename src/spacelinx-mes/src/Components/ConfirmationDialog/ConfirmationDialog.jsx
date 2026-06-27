import Swal from "sweetalert2";

const getThemeStyles = () => {
  const theme = document.documentElement.getAttribute("AppTheme");
  const isDarkMode = theme === "dark";

  return isDarkMode
    ? {
        background: "#16161f",
        color: "var( --dark-text-color)",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3a3a4c",
        cancelButtonTextColor: "var( --dark-text-color)",
      }
    : {
        background: "var(--light-background-color)",
        color: "var(  --dark-primary-color)",
        confirmButtonColor: "var(--error-color)",
        cancelButtonColor: "var(  --cancel-button-bg-light)",
        cancelButtonTextColor: "var( --button-color-light)",
      };
};

export const showAlert = (
  type,
  title,
  text,
  confirmButton = false,
  confirmButtonText,
  onConfirm
) => {
  const themeStyles = getThemeStyles();

  Swal.fire({
    icon: type,
    title: title,
    text: text,
    background: themeStyles.background,
    color: themeStyles.color,
    timer: !confirmButton ? 1500 : null,
    showConfirmButton: confirmButton,
    confirmButtonText: confirmButtonText || "OK",
    confirmButtonColor: "#6366F1",
    didOpen: () => {
      const swalPopup = document.querySelector(".swal2-container");
      if (swalPopup) {
        swalPopup.style.zIndex = "2000";
      }
    },
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === "function") {
      onConfirm();
    }
  });
};

export const showConfirmation = async (
  title,
  text,
  confirmText = "Yes,delete it!",
  showCancel = true
) => {
  const themeStyles = getThemeStyles();

  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    // showCancelButton: true,
    showCancelButton: showCancel,
    confirmButtonColor: themeStyles.confirmButtonColor,
    cancelButtonColor: themeStyles.cancelButtonColor,
    background: themeStyles.background,
    color: themeStyles.color,
    confirmButtonText: confirmText,
    didOpen: () => {
      const swalPopup = document.querySelector(".swal2-container");
      if (swalPopup) {
        swalPopup.style.zIndex = "2000";
      }
    },
  });

  return result.isConfirmed;
};
