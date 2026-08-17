import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { changePassword } from "../../services/localAuth";
import { getAuthConfig } from "../../services/authConfigService";

/**
 * Change-password screen for a signed-in password user.
 *
 * Also the destination when sign-in reports mustChangePassword — i.e. the user was
 * given a temporary password and has to replace it before continuing.
 */
const ChangePasswordPage = () => {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [minLength, setMinLength] = useState(8);

  useEffect(() => {
    getAuthConfig().then((cfg) => setMinLength(cfg.minPasswordLength || 8));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    if (password.length < minLength) {
      setError(`Password must be at least ${minLength} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await changePassword(current, password);
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Change your password
        </Typography>

        {done ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="success">Your password has been changed.</Alert>
            <Button variant="contained" onClick={() => window.location.assign("/")}>
              Continue
            </Button>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Current password"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
              />
              <TextField
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
                helperText={`At least ${minLength} characters.`}
              />
              <TextField
                label="Confirm new password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Saving…" : "Change password"}
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChangePasswordPage;
