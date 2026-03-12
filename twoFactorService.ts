// Using `otplib` which is browser-compatible for TOTP generation/verification.
// Speakeasy caused a runtime error in the browser (util.deprecate unavailable).
import { authenticator } from 'otplib';

/**
 * Simple 2FA/TOTP helper using `speakeasy`.
 *
 * This file contains the minimal backend logic you'd run on a server.
 * In this workspace we don't have a true server component, but these
 * helpers can be invoked from a Node.js endpoint or from the `apiService`
 * layer when you wire a real backend.
 */

export interface TwoFactorSecret {
  base32: string;          // the secret encoded in base32 (safe for storage)
  otpauthUrl: string;      // URI that can be encoded as a QR code
}

/**
 * Generate a new secret for a given user.  The caller should persist the
 * `base32` value (ideally encrypted) and send the `otpauthUrl` to the
 * frontend so the user can scan it with Google Authenticator / Authy etc.
 */
export function generateTwoFactorSecret(userIdentifier: string): TwoFactorSecret {
  // otplib's authenticator.generateSecret returns an object whose
  // `secret` property is the base32 string. An `otpauth://` URL can be
  // generated using `authenticator.keyuri`.
  const base32 = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(userIdentifier, 'EGTC Fuel Fleet', base32);

  return { base32, otpauthUrl };
}

/**
 * Verify a 6‑digit TOTP code provided by the user.  Returns true when the
 * code is valid for the secret.  By default speakeasy automatically allows
 * a +/- 1 step window to account for small clock skew; you can adjust using
 * the `window` option.
 */
export function verifyTwoFactorToken(secretBase32: string, token: string): boolean {
  // configure window to allow +/- 1 step (~30 seconds each)
  authenticator.options = { window: 1 };
  return authenticator.check(token, secretBase32);
}

// -----------------------------------------------------------------------------
// Additional notes / best practices (not executed code)
// -----------------------------------------------------------------------------
/*
Best practices for storing the secret securely:

* Treat the Base32 secret like a password.  Store it encrypted at rest
  (e.g. using your database's built-in encryption, or use a KMS to encrypt
  before saving).  Do not store it in plaintext in logs or in localStorage.
* When you provision a secret, display the QR code ONCE and advise the user
  to save their recovery code out‑of‑band.  Provide a "print" or "download"
  button so they can keep a physical copy.
* If a user loses their device, allow them to rotate (generate a new secret)
  after passing some other authentication check; revoke the previous secret.

Security must-haves:

* **Encryption** – encrypt secrets in your database; if you must cache them in
  memory avoid leaking to logs.
* **Clock drift** – allow a small window (as shown above).  Do **not** expand
  the window too far or an attacker could replay codes.
* **One-time use** – record the last successful token for a user and refuse to
  accept it again (prevents replay if the same code is intercepted).
* **Rate limiting** – limit attempts per user/IP to mitigate guessing.
* **Backup/Recovery** – show a printable recovery code when enabling 2FA so
  users aren’t permanently locked out.
* **User experience** – let users disable 2FA after verifying with current code.
* **Expiry** – if you rotate the secret (e.g. during a reset), invalidate
  previous codes immediately.
*/