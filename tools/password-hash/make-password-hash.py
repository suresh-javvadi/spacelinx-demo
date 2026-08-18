#!/usr/bin/env python3
"""
Generate a password hash in the format SpaceLinx stores in application.user.password_hash.

Needed to set the very first password on a fresh database, because the
/api/auth/admin/set-password endpoint requires an existing Super Admin to call it.

Must stay in step with SpaceLinx.Api/Security/LocalAuth/PasswordHasher.cs:
PBKDF2-HMAC-SHA256, 16-byte salt, 32-byte hash, stored as
"{iterations}.{base64 salt}.{base64 hash}".

Usage:
    python make-password-hash.py 'TheP@ssword' user@example.com
"""
import base64
import hashlib
import os
import sys

ITERATIONS = 210_000
SALT_BYTES = 16
HASH_BYTES = 32


def make_hash(password: str) -> str:
    salt = os.urandom(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERATIONS, HASH_BYTES)
    return f"{ITERATIONS}.{base64.b64encode(salt).decode()}.{base64.b64encode(digest).decode()}"


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1

    password = sys.argv[1]
    email = sys.argv[2] if len(sys.argv) > 2 else "admin@example.com"

    if len(password) < 8:
        print("Refusing: password must be at least 8 characters (Auth:Password:MinPasswordLength).")
        return 1

    stored = make_hash(password)

    print("password_hash:")
    print(f"  {stored}\n")
    print("SQL to set it (user must already exist):")
    print(
        "  UPDATE application.\"user\"\n"
        f"     SET password_hash = '{stored}',\n"
        "         password_updated_at = now(),\n"
        "         must_change_password = true,\n"
        "         failed_login_attempts = 0,\n"
        "         lockout_until = NULL\n"
        f"   WHERE lower(email) = lower('{email}') AND deleted_at IS NULL;"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
