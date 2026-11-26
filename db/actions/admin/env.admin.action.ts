"use server";

import fs from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/app/utils/authz";

const ALLOWED_KEYS = new Set([
  "MONGO_URI",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "BULKSMSBD_API_KEY",
  "BULKSMSBD_SENDER_ID",
]);

async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") throw new Error("Super-admin only");
  return user;
}

function envPath() {
  return path.join(process.cwd(), ".env");
}

function parseEnvFile(content: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    map.set(key, val);
  }
  return map;
}

function writeKeyInFile(content: string, key: string, value: string): string {
  const lines = content.split("\n");
  let found = false;

  const updated = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return line;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return line;
    const lineKey = trimmed.slice(0, eq).trim();
    if (lineKey !== key) return line;
    found = true;
    // Preserve quoting only when value contains spaces or special chars
    const needsQuotes = /[\s"'\\]/.test(value);
    return `${key}=${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`;
  });

  if (!found) {
    updated.push(`${key}=${/[\s"'\\]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value}`);
  }

  return updated.join("\n");
}

export type EnvValues = Record<string, string>;

/** Read current values of the allowed env keys from process.env (live). */
export async function readEnvValues(): Promise<{ ok: true; values: EnvValues } | { ok: false; error: string }> {
  try {
    await requireSuperAdmin();
    const values: EnvValues = {};
    for (const key of ALLOWED_KEYS) {
      values[key] = process.env[key] ?? "";
    }
    return { ok: true, values };
  } catch {
    return { ok: false, error: "Not allowed." };
  }
}

/** Update a group of env keys — writes .env file and patches process.env in-memory. */
export async function updateEnvValues(
  updates: Partial<EnvValues>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireSuperAdmin();
  } catch {
    return { ok: false, error: "Not allowed." };
  }

  const forbidden = Object.keys(updates).filter((k) => !ALLOWED_KEYS.has(k));
  if (forbidden.length) return { ok: false, error: `Key not allowed: ${forbidden.join(", ")}` };

  try {
    let content = "";
    try {
      content = await fs.readFile(envPath(), "utf-8");
    } catch {
      content = "";
    }

    for (const [key, value] of Object.entries(updates)) {
      content = writeKeyInFile(content, key, value ?? "");
      // Patch in-memory immediately (takes effect for subsequent requests)
      process.env[key] = value ?? "";
    }

    await fs.writeFile(envPath(), content, "utf-8");
    return { ok: true };
  } catch (err) {
    console.error("[updateEnvValues]", err);
    return { ok: false, error: "Failed to write .env file." };
  }
}
