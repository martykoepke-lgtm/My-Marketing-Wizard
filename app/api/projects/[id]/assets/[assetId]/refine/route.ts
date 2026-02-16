import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import type { AssetType } from "@/lib/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id, assetId } = await params;
  const { message } = await request.json();
  const db = await getDb();

  const { rows: assetRows } = await db.execute({
    sql: "SELECT * FROM assets WHERE id = ? AND project_id = ?",
    args: [assetId, id],
  });

  const asset = assetRows[0];
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Get brandscript
  const { rows: bsRows } = await db.execute({
    sql: "SELECT content_json FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
    args: [id],
  });

  let brandscript: Record<string, unknown> = {};
  if (bsRows[0]) {
    try { brandscript = JSON.parse(bsRows[0].content_json as string); } catch { /* empty */ }
  }

  // Get conversation history
  const { rows: convRows } = await db.execute({
    sql: "SELECT role, message FROM conversations WHERE asset_id = ? ORDER BY created_at ASC",
    args: [assetId],
  });

  const chatHistory = convRows.map((c) => ({
    role: c.role as "user" | "assistant",
    content: c.message as string,
  }));

  // Save user message
  await db.execute({
    sql: "INSERT INTO conversations (id, project_id, asset_id, role, message) VALUES (?, ?, ?, ?, ?)",
    args: [crypto.randomUUID(), id, assetId, "user", message],
  });

  const result = await generate({
    task: "refine",
    assetType: asset.asset_type as AssetType,
    brandscript,
    currentAsset: asset.content as string,
    chatHistory,
    userMessage: message,
  });

  // Save assistant response
  await db.execute({
    sql: "INSERT INTO conversations (id, project_id, asset_id, role, message) VALUES (?, ?, ?, ?, ?)",
    args: [crypto.randomUUID(), id, assetId, "assistant", result],
  });

  return NextResponse.json({ role: "assistant", message: result });
}
