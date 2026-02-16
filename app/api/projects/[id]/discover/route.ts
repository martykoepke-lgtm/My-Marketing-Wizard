import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuid } from "uuid";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const answers = db
    .prepare(
      "SELECT * FROM discovery_answers WHERE project_id = ? ORDER BY step_number, question_key"
    )
    .all(id);
  return NextResponse.json(answers);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { step_number, answers } = await request.json();
  const db = getDb();

  const upsert = db.prepare(`
    INSERT INTO discovery_answers (id, project_id, step_number, question_key, answer)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(project_id, question_key) DO UPDATE SET
      answer = excluded.answer,
      step_number = excluded.step_number
  `);

  const saveAll = db.transaction(
    (items: Array<{ key: string; value: string }>) => {
      for (const item of items) {
        upsert.run(uuid(), id, step_number, item.key, item.value);
      }
    }
  );

  const items = Object.entries(answers as Record<string, string>).map(
    ([key, value]) => ({ key, value })
  );
  saveAll(items);

  db.prepare(
    "UPDATE projects SET updated_at = datetime('now') WHERE id = ?"
  ).run(id);

  return NextResponse.json({ ok: true, saved: items.length });
}
