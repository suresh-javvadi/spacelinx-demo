namespace SpaceLinx.Model;

/// <summary>
/// Password-login fields for <see cref="User"/>.
///
/// These are only used when password authentication is enabled
/// (<c>Auth:Password:Enabled</c>). Deployments that authenticate purely through
/// Azure AD leave every column here NULL and behave exactly as before.
/// </summary>
public partial class User
{
    /// <summary>
    /// PBKDF2 hash of the user's password, encoded as
    /// <c>{iterations}.{base64 salt}.{base64 hash}</c>.
    /// NULL means this user cannot sign in with a password — only via Azure AD.
    /// </summary>
    public string? PasswordHash { get; set; }

    /// <summary>When the password was last set. Used for "password age" reporting.</summary>
    public DateTime? PasswordUpdatedAt { get; set; }

    /// <summary>
    /// Forces a password change on next sign-in. Set when an administrator
    /// issues a temporary password.
    /// </summary>
    public bool MustChangePassword { get; set; }

    /// <summary>Consecutive failed sign-in attempts; reset to 0 on success.</summary>
    public int FailedLoginAttempts { get; set; }

    /// <summary>When set and in the future, password sign-in is refused for this user.</summary>
    public DateTime? LockoutUntil { get; set; }

    /// <summary>SHA-256 hash of the outstanding password-reset token (the raw token is only ever emailed).</summary>
    public string? PasswordResetTokenHash { get; set; }

    /// <summary>Expiry of the outstanding password-reset token.</summary>
    public DateTime? PasswordResetTokenExpiresAt { get; set; }
}
