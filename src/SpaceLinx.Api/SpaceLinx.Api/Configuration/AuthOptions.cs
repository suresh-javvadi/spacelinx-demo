namespace SpaceLinx.Api.Configuration;

/// <summary>
/// Which sign-in methods this deployment offers, and how the password one behaves.
///
/// Defaults are deliberately "Microsoft only", so an existing deployment that does
/// not add an <c>Auth</c> section keeps behaving exactly as it did before.
/// </summary>
public class AuthOptions
{
    public const string SectionName = "Auth";

    public MicrosoftAuthOptions Microsoft { get; set; } = new();

    public PasswordAuthOptions Password { get; set; } = new();
}

public class MicrosoftAuthOptions
{
    /// <summary>Show "Sign in with Microsoft" and accept Azure AD tokens.</summary>
    public bool Enabled { get; set; } = true;
}

public class PasswordAuthOptions
{
    /// <summary>Show the email/password form and accept SpaceLinx-issued tokens.</summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// Symmetric key used to sign SpaceLinx-issued tokens. Must be at least 32 bytes
    /// and kept secret — anyone holding it can mint valid tokens. Required when
    /// <see cref="Enabled"/> is true; startup fails fast if it is missing or too short.
    /// </summary>
    public string SigningKey { get; set; } = string.Empty;

    public string Issuer { get; set; } = "spacelinx";

    public string Audience { get; set; } = "spacelinx-api";

    /// <summary>How long an issued token stays valid. Default is one working day.</summary>
    public int TokenLifetimeMinutes { get; set; } = 480;

    /// <summary>Consecutive failures before the account is temporarily locked.</summary>
    public int MaxFailedAttempts { get; set; } = 5;

    /// <summary>How long the lockout lasts once <see cref="MaxFailedAttempts"/> is hit.</summary>
    public int LockoutMinutes { get; set; } = 15;

    public int MinPasswordLength { get; set; } = 8;

    /// <summary>Lifetime of a password-reset link.</summary>
    public int ResetTokenLifetimeMinutes { get; set; } = 60;
}
