import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Drawer,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { searchAudit } from "../../services/auditService";

const OPERATIONS = ["INSERT", "UPDATE", "SOFT_DELETE", "HARD_DELETE"];

const operationColor = (op) => {
  switch (op) {
    case "INSERT":
      return "success";
    case "UPDATE":
      return "info";
    case "SOFT_DELETE":
      return "warning";
    case "HARD_DELETE":
      return "error";
    default:
      return "default";
  }
};

const prettyJson = (value) => {
  if (!value) return "—";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const AuditTrail = () => {
  const [filters, setFilters] = useState({
    entityType: "",
    actor: "",
    operation: "",
    from: "",
    to: "",
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchAudit({ ...filters, take: 200 });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(
        e?.response?.status === 403
          ? "You are not permitted to view these audit records."
          : "Failed to load the audit trail.",
      );
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
    // initial load only; subsequent loads are triggered by the Search button
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (field) => (e) =>
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));

  const columns = [
    {
      field: "occurredAt",
      headerName: "When",
      width: 170,
      valueFormatter: (value) =>
        value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "",
    },
    { field: "entityType", headerName: "Entity", width: 150 },
    {
      field: "operation",
      headerName: "Operation",
      width: 140,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={operationColor(params.value)}
          variant="outlined"
        />
      ),
    },
    { field: "actorEmail", headerName: "Actor", width: 220 },
    {
      field: "changedColumns",
      headerName: "Changed fields",
      flex: 1,
      minWidth: 200,
      valueGetter: (value) => (Array.isArray(value) ? value.join(", ") : ""),
    },
    { field: "correlationId", headerName: "Correlation", width: 170 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Audit Trail</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={load}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" useFlexGap>
        <TextField
          label="Entity type"
          size="small"
          value={filters.entityType}
          onChange={onChange("entityType")}
          placeholder="e.g. Part"
        />
        <TextField
          label="Actor (email)"
          size="small"
          value={filters.actor}
          onChange={onChange("actor")}
        />
        <TextField
          label="Operation"
          size="small"
          select
          sx={{ minWidth: 160 }}
          value={filters.operation}
          onChange={onChange("operation")}
        >
          <MenuItem value="">Any</MenuItem>
          {OPERATIONS.map((op) => (
            <MenuItem key={op} value={op}>
              {op}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="From"
          size="small"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={filters.from}
          onChange={onChange("from")}
        />
        <TextField
          label="To"
          size="small"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={filters.to}
          onChange={onChange("to")}
        />
        <Button variant="contained" onClick={load} disabled={loading}>
          Search
        </Button>
      </Stack>

      {error && (
        <Typography color="error" mb={1}>
          {error}
        </Typography>
      )}

      <div style={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          loading={loading}
          density="compact"
          disableRowSelectionOnClick
          onRowClick={(params) => setSelected(params.row)}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 50 } },
          }}
        />
      </div>

      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)}>
        <Box sx={{ width: 520, p: 3 }} role="presentation">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Change detail</Typography>
            <IconButton onClick={() => setSelected(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          {selected && (
            <Stack spacing={1.5}>
              <DetailRow label="Entity" value={`${selected.entityType} (${selected.schemaName}.${selected.tableName})`} />
              <DetailRow label="Record id" value={selected.rowPk} />
              <DetailRow
                label="Operation"
                value={
                  <Chip
                    size="small"
                    label={selected.operation}
                    color={operationColor(selected.operation)}
                    variant="outlined"
                  />
                }
              />
              <DetailRow label="When" value={dayjs(selected.occurredAt).format("YYYY-MM-DD HH:mm:ss")} />
              <DetailRow label="Actor" value={selected.actorEmail} />
              <DetailRow label="Request" value={`${selected.requestMethod || ""} ${selected.requestPath || ""}`.trim() || "—"} />
              <DetailRow label="Source IP" value={selected.sourceIp || "—"} />
              <DetailRow label="Correlation" value={selected.correlationId || "—"} />
              <Divider />
              <Typography variant="subtitle2">Before</Typography>
              <JsonBlock text={prettyJson(selected.oldValues)} />
              <Typography variant="subtitle2">After</Typography>
              <JsonBlock text={prettyJson(selected.newValues)} />
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

const DetailRow = ({ label, value }) => (
  <Stack direction="row" spacing={1}>
    <Typography variant="body2" sx={{ minWidth: 110, color: "text.secondary" }}>
      {label}
    </Typography>
    <Typography variant="body2" component="div" sx={{ wordBreak: "break-all" }}>
      {value}
    </Typography>
  </Stack>
);

const JsonBlock = ({ text }) => (
  <Box
    component="pre"
    sx={{
      m: 0,
      p: 1.5,
      bgcolor: "grey.100",
      borderRadius: 1,
      fontSize: 12,
      overflowX: "auto",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }}
  >
    {text}
  </Box>
);

export default AuditTrail;
