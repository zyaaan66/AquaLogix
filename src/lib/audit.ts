import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface AuditInput {
  actorId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/** Writes an audit trail entry. Never throws — logging failures must not break the request. */
export async function logAudit({ actorId, action, metadata, ipAddress }: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        ipAddress,
      },
    });
  } catch (err) {
    logger.error("Failed to write audit log", { action, err });
  }
}
