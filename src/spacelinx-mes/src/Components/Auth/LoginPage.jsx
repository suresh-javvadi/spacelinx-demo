import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { getAuthConfig } from "../../services/authConfigService";
import { loginWithPassword, requestPasswordReset } from "../../services/localAuth";

/**
 * Sign-in screen.
 *
 * Which options appear is decided at runtime by /api/auth/config, so the same build
 * serves a Microsoft-only deployment, a password-only one, or both.
 */
const LoginPage = () => {
  const { instance } = useMsal();

  const [config, setConfig] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    let active = true;
    getAuthConfig().then((cfg) => {
      if (active) setConfig(cfg);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleMicrosoft = () => {
    setError(null);
    instance.loginRedirect().catch((err) => {
      console.error("Microsoft sign-in failed", err);
      setError("Microsoft sign-in could not be started. Please try again.");
    });
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const result = await loginWithPassword(email.trim(), password);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // A full reload lets UserContext pick the new token up cleanly rather than
      // trying to re-run the whole auth bootstrap in place.
      window.location.assign(result.mustChangePassword ? "/change-password" : "/");
    } catch (err) {
      console.error("Sign-in failed", err);
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      // Deliberately the same message whether or not the account exists.
      setNotice(
        "If that email address has an account, a reset link is on its way. Please check your inbox."
      );
      setShowForgot(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!config) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  const bothEnabled = config.microsoftEnabled && config.passwordEnabled;

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
          Sign in to SpaceLinx
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {notice && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setNotice(null)}>
            {notice}
          </Alert>
        )}

        {config.microsoftEnabled && (
          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleMicrosoft}
          >
            Sign in with Microsoft
          </Button>
        )}

        {bothEnabled && (
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>
        )}

        {config.passwordEnabled && !showForgot && (
          <Box component="form" onSubmit={handlePasswordLogin} sx={{ mt: bothEnabled ? 0 : 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="username"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => {
                  setShowForgot(true);
                  setError(null);
                }}
                sx={{ alignSelf: "center" }}
              >
                Forgot password?
              </Link>
            </Stack>
          </Box>
        )}

        {config.passwordEnabled && showForgot && (
          <Box component="form" onSubmit={handleForgot} sx={{ mt: 3 }}>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Enter your email address and we&apos;ll send you a link to reset your
                password.
              </Typography>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="username"
              />
              <Button type="submit" variant="contained" fullWidth disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => setShowForgot(false)}
                sx={{ alignSelf: "center" }}
              >
                Back to sign in
              </Link>
            </Stack>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LoginPage;
