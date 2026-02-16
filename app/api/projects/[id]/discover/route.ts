import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const { rows } = await db.execute({
    sql: "SELECT * FROM discovery_answers WHERE project_id = ? ORDER BY step_number, question_key",
    args: [id],
  });

  return NextResponse.json(rows);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { step_number, answers } = await request.json();
  const db = await getDb();

  const entries = Object.entries(answers as Record<string, string>);
  const stmts = entries.map(([key, value]) => ({
    sql: `INSERT INTO discovery_answers (id, project_id, step_number, question_key, answer)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(project_id, question_key) DO UPDATE SET answer = ?, step_number = ?`,
    args: [crypto.randomUUID(), id, step_number, key, value, value, step_number],
  }));

  stmts.push({
    sql: "UPDATE projects SET updated_at = datetime('now') WHERE id = ?",
    args: [id],
  });

  await db.batch(stmts, "write");

  return NextResponse.json({ ok: true, saved: entries.length });
}
