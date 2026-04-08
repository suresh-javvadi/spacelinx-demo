import Swal from "sweetalert2";

const getThemeStyles = () => {
  const theme = document.documentElement.getAttribute("AppTheme");
  const isDarkMode = theme === "dark";

  return isDarkMode
    ? {
        background: "#2c2c2c",
        color: "var(--dark-text-color)",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#555",
        cancelButtonTextColor: "var(--dark-text-color)",
      }
    : {
        background: "var(--light-background-color)",
        color: "var(--dark-primary-color)",
        confirmButtonColor: "var(--error-color)",
        cancelButtonColor: "var(--cancel-button-bg-light)",
        cancelButtonTextColor: "var(--button-color-light)",
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
    confirmButtonColor: themeStyles.confirmButtonColor,
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

export const showPrintOptionsDialog = async () => {
  const themeStyles = getThemeStyles();

  const result = await Swal.fire({
    title: "Print Options",
    html: `
      <div style="text-align: left; margin: 20px 0;">
        <label style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer; gap: 10px;">
          <input type="checkbox" id="showPartNumber" style="transform: scale(1.2); cursor: pointer;">
          <span style="user-select: none;">Part Number</span>
        </label>
        <label style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer; gap: 10px;">
          <input type="checkbox" id="hsn" style="transform: scale(1.2); cursor: pointer;">
          <span style="user-select: none;">HSN</span>
        </label>
        <label style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer; gap: 10px;">
          <input type="checkbox" id="mfgPartNumber" style="transform: scale(1.2); cursor: pointer;">
          <span style="user-select: none;">Manufacturing Part Number</span>
        </label>
        <label style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer; gap: 10px;">
          <input type="checkbox" id="showTaxType" style="transform: scale(1.2); cursor: pointer;">
          <span style="user-select: none;">Tax Group</span>
        </label>
        <label style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer; gap: 10px;">
          <input type="checkbox" id="showTaxValue" style="transform: scale(1.2); cursor: pointer;">
          <span style="user-select: none;">Tax Value</span>
        </label>
        <label style="display: flex; align-items: center; margin-bottom: 12px; cursor: pointer; gap: 10px;">
          <input type="checkbox" id="showTaxAmount" style="transform: scale(1.2); cursor: pointer;">
          <span style="user-select: none;">Tax Amount</span>
        </label>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: themeStyles.confirmButtonColor,
    cancelButtonColor: themeStyles.cancelButtonColor,
    background: themeStyles.background,
    color: themeStyles.color,
    confirmButtonText: "Print",
    cancelButtonText: "Cancel",
    focusConfirm: false,
    preConfirm: () => {
      const showPartNumber = document.getElementById("showPartNumber").checked;
      const hsn = document.getElementById("hsn").checked;
      const mfgPartNumber = document.getElementById("mfgPartNumber").checked;
      const showTaxType = document.getElementById("showTaxType").checked;
      const showTaxValue = document.getElementById("showTaxValue").checked;
      const showTaxAmount = document.getElementById("showTaxAmount").checked;

      return {
        hsn,
        mfgPartNumber,
        showTaxType,
        showTaxValue,
        showTaxAmount,
        showPartNumber,
      };
    },
    didOpen: () => {
      const swalPopup = document.querySelector(".swal2-container");
      if (swalPopup) {
        swalPopup.style.zIndex = "2000";
      }
    },
  });

  if (result.isConfirmed) {
    return result.value;
  }

  return null;
};
