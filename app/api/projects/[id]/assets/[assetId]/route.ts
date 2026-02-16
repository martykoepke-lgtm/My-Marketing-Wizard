import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id, assetId } = await params;
  const db = await getDb();

  const { rows: assetRows } = await db.execute({
    sql: "SELECT * FROM assets WHERE id = ? AND project_id = ?",
    args: [assetId, id],
  });

  const asset = assetRows[0];
  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const { rows: versions } = await db.execute({
    sql: "SELECT id, version, created_at FROM assets WHERE project_id = ? AND asset_type = ? ORDER BY version DESC",
    args: [id, asset.asset_type as string],
  });

  const { rows: conversations } = await db.execute({
    sql: "SELECT * FROM conversations WHERE asset_id = ? ORDER BY created_at ASC",
    args: [assetId],
  });

  return NextResponse.json({
    asset,
    versions,
    conversations,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; assetId: string }> }
) {
  const { id, assetId } = await params;
  const db = await getDb();
  await db.execute({
    sql: "DELETE FROM assets WHERE id = ? AND project_id = ?",
    args: [assetId, id],
  });
  return NextResponse.json({ ok: true });
}
