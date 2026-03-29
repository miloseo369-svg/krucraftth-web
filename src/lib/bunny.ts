import crypto from "crypto";

interface TokenOptions {
  videoPath: string;
  expiresIn?: number; // seconds
}

export function generateSignedUrl({ videoPath, expiresIn = 3600 }: TokenOptions): string {
  const cdnUrl = process.env.BUNNY_CDN_URL!;
  const tokenKey = process.env.BUNNY_TOKEN_KEY!;
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const hashableBase = `${tokenKey}${videoPath}${expires}`;

  const token = Buffer.from(
    crypto.createHash("sha256").update(hashableBase).digest()
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${cdnUrl}${videoPath}?token=${token}&expires=${expires}`;
}
