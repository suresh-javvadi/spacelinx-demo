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
import { resetPassword } from "../../services/localAuth";
import { getAuthConfig } from "../../services/authConfigService";

/**
 * Landing page for the link sent by "forgot password".
 *
 * Reachable without a session — the email address and single-use token arrive as
 * query parameters, and the API validates them.
 */
const ResetPasswordPage = () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get("email") || "";
  const token = params.get("token") || "";

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
      const result = await resetPassword(email, token, password);
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const missingLink = !email || !token;

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
          Choose a new password
        </Typography>

        {missingLink && (
          <Alert severity="error" sx={{ mt: 2 }}>
            This reset link is incomplete. Please request a new one from the sign-in
            page.
          </Alert>
        )}

        {done ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="success">
              Your password has been reset. You can now sign in with it.
            </Alert>
            <Button variant="contained" onClick={() => window.location.assign("/")}>
              Go to sign in
            </Button>
          </Stack>
        ) : (
          !missingLink && (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Resetting the password for <strong>{email}</strong>.
                </Typography>

                {error && <Alert severity="error">{error}</Alert>}

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
                  {submitting ? "Saving…" : "Set new password"}
                </Button>
              </Stack>
            </Box>
          )
        )}
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
