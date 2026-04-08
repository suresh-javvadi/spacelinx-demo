import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";

const CsvPreview = ({ csvData, visibleRows, lastRowRef }) => {
  if (!csvData || !csvData.headers || csvData.headers.length === 0) {
    return;
  }

  return (
    <TableContainer component={Paper} className="csv-table-container">
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {csvData.headers.map((header, index) => (
              <TableCell key={index} className="csv-header-cell">
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {csvData.rows.slice(0, visibleRows).map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              ref={rowIndex === visibleRows - 1 ? lastRowRef : null}
            >
              {csvData.headers.map((header, colIndex) => (
                <TableCell key={colIndex}>{row[header]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {visibleRows < csvData.rows.length && (
        <div className="DocCsvLoader">
          <CircularProgress size={24} />
        </div>
      )}
    </TableContainer>
  );
};

export default CsvPreview;
