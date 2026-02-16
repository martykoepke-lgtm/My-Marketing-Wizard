import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id, assetId } = await params;
  const db = getDb();

  const asset = db
    .prepare("SELECT * FROM assets WHERE id = ? AND project_id = ?")
    .get(assetId, id);

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Get all versions of the same type
  const assetObj = asset as { asset_type: string };
  const versions = db
    .prepare(
      "SELECT id, version, created_at FROM assets WHERE project_id = ? AND asset_type = ? ORDER BY version DESC"
    )
    .all(id, assetObj.asset_type);

  // Get conversation history
  const conversations = db
    .prepare(
      "SELECT * FROM conversations WHERE asset_id = ? ORDER BY created_at ASC"
    )
    .all(assetId);

  return NextResponse.json({ asset, versions, conversations });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id, assetId } = await params;
  const db = getDb();
  db.prepare("DELETE FROM assets WHERE id = ? AND project_id = ?").run(
    assetId,
    id
  );
  return NextResponse.json({ ok: true });
}
