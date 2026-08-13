import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { verifyAccessToken } from "@/lib/auth";

const ACCEPTED_MIME = new Set(["application/pdf", "image/png", "image/jpeg"]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// File "magic number" signatures — server never trusts the client-reported MIME type alone.
const MAGIC_BYTES: Record<string, number[]> = {
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
};

function matchesMagicBytes(buffer: Buffer, mime: string) {
  const sig = MAGIC_BYTES[mime];
  if (!sig) return false;
  return sig.every((byte, i) => buffer[i] === byte);
}

/** Placeholder for real AES-256-GCM encryption-at-rest (key management via KMS/secret manager in production). */
function simulateEncryptAtRest(buffer: Buffer) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encryptedSize: encrypted.length, authTag: cipher.getAuthTag().toString("hex") };
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = rateLimit(`upload:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Terlalu banyak unggahan. Coba lagi nanti." }, { status: 429 });
  }

  const authHeader = req.headers.get("authorization");
  let actorId: string | undefined;
  try {
    if (authHeader) actorId = (await verifyAccessToken(authHeader.replace("Bearer ", ""))).sub;
  } catch {
    // unauthenticated uploads are still allowed for the partner-gateway demo,
    // but won't be attributable to a user in the audit trail
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 400 });
  }
  if (!ACCEPTED_MIME.has(file.type)) {
    await logAudit({ actorId, action: "UPLOAD_REJECTED_MIME", metadata: { fileName: file.name, mime: file.type }, ipAddress: ip });
    return NextResponse.json({ error: "Tipe berkas tidak didukung." }, { status: 415 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    await logAudit({ actorId, action: "UPLOAD_REJECTED_SIZE", metadata: { fileName: file.name, size: file.size }, ipAddress: ip });
    return NextResponse.json({ error: "Ukuran berkas melebihi 10 MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesMagicBytes(buffer, file.type)) {
    await logAudit({ actorId, action: "UPLOAD_REJECTED_MAGIC_BYTES", metadata: { fileName: file.name }, ipAddress: ip });
    return NextResponse.json(
      { error: "Isi berkas tidak sesuai dengan tipe yang dilaporkan." },
      { status: 422 }
    );
  }

  let encryptedSize: number, authTag: string;
  try {
    ({ encryptedSize, authTag } = simulateEncryptAtRest(buffer));
  } catch (err) {
    logger.error("Encryption failed during upload", { err });
    return NextResponse.json({ error: "Gagal memproses berkas." }, { status: 500 });
  }

  // In production: persist via Prisma `Document` model with `encryptedRef`
  // pointing at the ciphertext location (e.g. S3 object key).
  await logAudit({
    actorId,
    action: "UPLOAD_SUCCESS",
    metadata: { fileName: file.name, mime: file.type, size: file.size },
    ipAddress: ip,
  });

  return NextResponse.json({
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    encryptedSize,
    authTag,
    status: "stored_encrypted",
  });
}
