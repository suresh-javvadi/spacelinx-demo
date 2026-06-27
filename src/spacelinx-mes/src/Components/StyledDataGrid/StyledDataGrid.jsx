import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import * as XLSX from "xlsx";
import CustomDataGridOverlay from "./CustomDataGridOverlay";
import { Button, Tooltip } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useGridApiContext } from "@mui/x-data-grid";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const ExportButtons = () => {
  const apiRef = useGridApiContext();

  const handleExportCSV = () => {
    apiRef.current.exportDataAsCsv({
      fileName: `SARSPACE_${new Date().toISOString().split("T")[0]}`,
      allColumns: true,
      utf8WithBom: true,
    });
  };

  const handleExportExcel = () => {
    const visibleRows = Array.from(apiRef.current.getRowModels().values());
    const visibleColumns = apiRef.current.getVisibleColumns();

    const data = visibleRows.map((row) => {
      const rowData = {};
      visibleColumns.forEach((col) => {
        rowData[col.headerName || col.field] = row[col.field];
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(
      workbook,
      `SARSPACE_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  return (
    <>
      <Tooltip title="Export as CSV">
        <Button startIcon={<FileDownloadIcon />} onClick={handleExportCSV}>
          CSV
        </Button>
      </Tooltip>
      {/* <Tooltip title="Export as Excel">
        <Button startIcon={<FileDownloadIcon />} onClick={handleExportExcel}>
          Excel
        </Button>
      </Tooltip> */}
    </>
  );
};

const CustomToolbar = ({ showDensitySelector }) => (
  <GridToolbarContainer className="CustomToolbarContainer">
    <div className="MuiDatagridButtons">
      <ExportButtons />
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />

      {showDensitySelector && <GridToolbarDensitySelector />}
    </div>
    <div>
      <GridToolbarQuickFilter debounceMs={300} placeholder="Search..." />
    </div>
  </GridToolbarContainer>
);

const baseStyles = (themeMode) => ({
  // Main grid background
  backgroundColor: themeMode === "dark" ? "#0a0a14" : "#F2F2F2",
  color: themeMode === "dark" ? "#FFFFFF" : "#000000",

  // Column header
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: themeMode === "dark" ? "#1a1a24" : "#eceefb",
    borderBottom: "2px solid rgba(99, 102, 241, 0.45)",
    boxShadow:
      themeMode === "dark"
        ? "0px 4px 4px 0px #00000026"
        : "0px 4px 4px 0px rgba(0, 0, 0, 0.1)",
  },

  // Column header title
  "& .MuiDataGrid-columnHeaderTitle": {
    whiteSpace: "normal",
    lineHeight: "1.2rem",
    textAlign: "center",
    fontWeight: 600,
  },

  // Row hover
  "& .MuiDataGrid-row:hover": {
    cursor: "pointer",
    backgroundColor:
      themeMode === "dark"
        ? "rgba(99, 102, 241, 0.14)"
        : "rgba(99, 102, 241, 0.08)",
  },

  // Selected row
  "& .MuiDataGrid-row.Mui-selected, & .MuiDataGrid-row.Mui-selected:hover": {
    backgroundColor:
      themeMode === "dark"
        ? "rgba(99, 102, 241, 0.24)"
        : "rgba(99, 102, 241, 0.16)",
  },

  // Cell borders
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
    borderBottom:
      themeMode === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.1)",
  },

  "& .MuiDataGrid-toolbarContainer": {
    flexDirection: "row-reverse",
    display: "flex",
    justifyContent: "space-between !important",

    "& button, & button:hover": {
      height: "30px",
      fontSize: "12px !important",
      color: "var(--light-secondary-color)",
      border: "1px solid #6366F140",
      backgroundColor: "#6366F126",
      margin: "0 5px",
    },
  },

  "& .MuiDataGrid-toolbarQuickFilter button": {
    border: "none !important",
  },

  "& .MuiDataGrid-toolbarQuickFilter .MuiInputBase-root": {
    border: "1px solid #6366F140 !important",
    height: "30px",
    fontSize: "14px",
  },

  "& .CustomToolbarContainer": {
    display: "flex",
    justifyContent: "space-between",
  },
  "& .MuiDataGrid-scrollbar--horizontal": {
    height: "6px !important",
  },
  "& .MuiDataGrid-scrollbarFiller": {
    display: "none !important",
  },

  "& .MuiDataGrid-scrollbarFiller--both": {
    display: "none !important",
  },

  "& .MuiDataGrid-scrollbarFiller, & .css-1k068yr": {
    display: "none !important",
  },
});

export const StyledDataGrid = ({
  sx,
  slots,
  slotProps,
  onRefresh,
  showRefresh = false,
  enableDensitySelector = false,
  columns,
  ...props
}) => {
  const theme = useTheme();
  const themeMode = theme.palette.mode;

  return (
    <DataGrid
      initialState={{
        density: "standard",
      }}
      slots={{
        toolbar: CustomToolbar,
        noRowsOverlay: CustomDataGridOverlay,
        ...slots,
      }}
      columns={columns.map((col) => ({
        ...col,
        minWidth: col.minWidth ?? 150,
      }))}
      slotProps={{
        toolbar: {
          onRefresh,
          showRefresh,
          showDensitySelector: enableDensitySelector,
          ...slotProps?.toolbar,
        },
        ...slotProps,
      }}
      sx={{
        ...baseStyles(themeMode),
        ...sx,
      }}
      {...props}
      showToolbar
    />
  );
};
