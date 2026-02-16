import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const { rows } = await db.execute({
    sql: "SELECT * FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
    args: [id],
  });

  if (!rows[0]) {
    return NextResponse.json(null);
  }

  const row = rows[0];
  return NextResponse.json({
    ...row,
    content_json: typeof row.content_json === "string" ? JSON.parse(row.content_json as string) : row.content_json,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const { rows: answerRows } = await db.execute({
    sql: "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?",
    args: [id],
  });

  const discoveryMap: Record<string, string> = {};
  for (const a of answerRows) {
    discoveryMap[a.question_key as string] = a.answer as string;
  }

  const result = await generate({
    task: "brandscript",
    discoveryAnswers: discoveryMap,
    userMessage:
      "Generate a complete SB7 BrandScript based on the discovery answers provided. Return ONLY valid JSON, no markdown code fences.",
  });

  let parsed: Record<string, unknown>;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? result);
  } catch {
    parsed = { raw: result };
  }

  const bsId = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO brandscripts (id, project_id, content_json) VALUES (?, ?, ?)",
    args: [bsId, id, JSON.stringify(parsed)],
  });

  const { rows } = await db.execute({
    sql: "SELECT * FROM brandscripts WHERE id = ?",
    args: [bsId],
  });

  const bs = rows[0];
  return NextResponse.json({
    ...bs,
    content_json: typeof bs.content_json === "string" ? JSON.parse(bs.content_json as string) : bs.content_json,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content_json } = await request.json();
  const db = await getDb();

  const { rows: existing } = await db.execute({
    sql: "SELECT id FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1",
    args: [id],
  });

  if (existing[0]) {
    await db.execute({
      sql: "UPDATE brandscripts SET content_json = ? WHERE id = ?",
      args: [JSON.stringify(content_json), existing[0].id as string],
    });
  } else {
    await db.execute({
      sql: "INSERT INTO brandscripts (id, project_id, content_json) VALUES (?, ?, ?)",
      args: [crypto.randomUUID(), id, JSON.stringify(content_json)],
    });
  }

  return NextResponse.json({ ok: true });
}
