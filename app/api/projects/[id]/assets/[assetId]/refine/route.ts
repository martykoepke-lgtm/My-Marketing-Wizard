import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import { v4 as uuid } from "uuid";
import type { AssetType } from "@/lib/prompts";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id, assetId } = await params;
  const { message } = await request.json();
  const db = getDb();

  // Get the current asset
  const asset = db
    .prepare("SELECT * FROM assets WHERE id = ? AND project_id = ?")
    .get(assetId, id) as {
    asset_type: string;
    content: string;
  } | undefined;

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Get brandscript
  const bs = db
    .prepare(
      "SELECT content_json FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(id) as { content_json: string } | undefined;

  let brandscript: Record<string, unknown> = {};
  if (bs) {
    try {
      brandscript = JSON.parse(bs.content_json);
    } catch {}
  }

  // Get existing conversation
  const conversations = db
    .prepare(
      "SELECT role, message FROM conversations WHERE asset_id = ? ORDER BY created_at ASC"
    )
    .all(assetId) as Array<{ role: string; message: string }>;

  const chatHistory = conversations.map((c) => ({
    role: c.role as "user" | "assistant",
    content: c.message,
  }));

  // Save user message
  db.prepare(
    "INSERT INTO conversations (id, project_id, asset_id, role, message) VALUES (?, ?, ?, ?, ?)"
  ).run(uuid(), id, assetId, "user", message);

  // Generate refinement
  const result = await generate({
    task: "refine",
    assetType: asset.asset_type as AssetType,
    brandscript,
    currentAsset: asset.content,
    chatHistory,
    userMessage: message,
  });

  // Save assistant response
  db.prepare(
    "INSERT INTO conversations (id, project_id, asset_id, role, message) VALUES (?, ?, ?, ?, ?)"
  ).run(uuid(), id, assetId, "assistant", result);

  return NextResponse.json({ role: "assistant", message: result });
}
