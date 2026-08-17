using System.Security.Cryptography;

namespace SpaceLinx.Api.Security.LocalAuth;

/// <summary>
/// PBKDF2-HMAC-SHA256 password hashing.
///
/// Hashes are stored as <c>{iterations}.{base64 salt}.{base64 hash}</c> so the
/// work factor travels with the hash — raising <see cref="DefaultIterations"/>
/// later keeps existing hashes verifiable, and <see cref="NeedsRehash"/> flags
/// the ones worth upgrading on next successful sign-in.
/// </summary>
public static class PasswordHasher
{
    /// <summary>Work factor for newly created hashes.</summary>
    public const int DefaultIterations = 210_000;

    private const int SaltBytes = 16;
    private const int HashBytes = 32;

    public static string Hash(string password, int iterations = DefaultIterations)
    {
        ArgumentException.ThrowIfNullOrEmpty(password);

        var salt = RandomNumberGenerator.GetBytes(SaltBytes);
        var hash = Derive(password, salt, iterations);

        return $"{iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    /// <summary>
    /// Verifies <paramref name="password"/> against a stored hash. Returns false for
    /// null/empty/malformed stored values rather than throwing, so a user row with no
    /// password simply fails to authenticate.
    /// </summary>
    public static bool Verify(string password, string? storedHash)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(storedHash))
        {
            return false;
        }

        if (!TryParse(storedHash, out var iterations, out var salt, out var expected))
        {
            return false;
        }

        var actual = Derive(password, salt, iterations);

        // Constant-time: never leak how much of the hash matched.
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    /// <summary>True when the stored hash uses a weaker work factor than we now issue.</summary>
    public static bool NeedsRehash(string? storedHash)
    {
        if (string.IsNullOrEmpty(storedHash) || !TryParse(storedHash, out var iterations, out _, out _))
        {
            return false;
        }

        return iterations < DefaultIterations;
    }

    private static byte[] Derive(string password, byte[] salt, int iterations) =>
        Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, HashBytes);

    private static bool TryParse(string storedHash, out int iterations, out byte[] salt, out byte[] hash)
    {
        iterations = 0;
        salt = [];
        hash = [];

        var parts = storedHash.Split('.');
        if (parts.Length != 3 || !int.TryParse(parts[0], out iterations) || iterations <= 0)
        {
            return false;
        }

        try
        {
            salt = Convert.FromBase64String(parts[1]);
            hash = Convert.FromBase64String(parts[2]);
        }
        catch (FormatException)
        {
            return false;
        }

        return salt.Length == SaltBytes && hash.Length == HashBytes;
    }
}
