import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const { rows } = await db.execute({
    sql: "SELECT * FROM projects WHERE id = ?",
    args: [id],
  });

  if (!rows[0]) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, description } = await request.json();
  const db = await getDb();

  await db.execute({
    sql: "UPDATE projects SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?",
    args: [name, description, id],
  });

  const { rows } = await db.execute({
    sql: "SELECT * FROM projects WHERE id = ?",
    args: [id],
  });

  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
