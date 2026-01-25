const encoder = new TextEncoder();

function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64Decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  return base64Encode(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    key,
    256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string, saltBase64?: string) {
  const salt = saltBase64 ? base64Decode(saltBase64) : crypto.getRandomValues(new Uint8Array(16));
  const hashBytes = await pbkdf2(password, salt);
  return {
    hash: base64Encode(hashBytes),
    salt: base64Encode(salt),
  };
}

export async function verifyPassword(
  password: string,
  expectedHash: string,
  saltBase64: string
): Promise<boolean> {
  const { hash } = await hashPassword(password, saltBase64);
  return hash === expectedHash;
}

export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes);
}

export async function hashToken(token: string): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return base64Encode(new Uint8Array(hashBuffer));
}
