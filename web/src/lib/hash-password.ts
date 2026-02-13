import crypto from "crypto";

/**
 * Hash a password using PBKDF2-SHA256.
 * Must match the Python implementation in config.py:
 *   salt = b'silencio_no_pc_salt'
 *   iterations = 480000
 *   length = 32
 *   base64url encoded
 */
export function hashPassword(password: string): string {
  const salt = Buffer.from("silencio_no_pc_salt", "utf-8");
  const key = crypto.pbkdf2Sync(password, salt, 480000, 32, "sha256");
  return key.toString("base64url");
}
