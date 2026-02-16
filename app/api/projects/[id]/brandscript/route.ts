import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import { v4 as uuid } from "uuid";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const bs = db
    .prepare(
      "SELECT * FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(id) as { id: string; content_json: string } | undefined;

  if (!bs) {
    return NextResponse.json(null);
  }

  return NextResponse.json({
    ...bs,
    content_json: JSON.parse(bs.content_json),
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const answers = db
    .prepare("SELECT question_key, answer FROM discovery_answers WHERE project_id = ?")
    .all(id) as Array<{ question_key: string; answer: string }>;

  const discoveryMap: Record<string, string> = {};
  for (const a of answers) {
    discoveryMap[a.question_key] = a.answer;
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

  const bsId = uuid();
  db.prepare(
    "INSERT INTO brandscripts (id, project_id, content_json) VALUES (?, ?, ?)"
  ).run(bsId, id, JSON.stringify(parsed));

  return NextResponse.json({ id: bsId, project_id: id, content_json: parsed });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content_json } = await request.json();
  const db = getDb();

  const existing = db
    .prepare(
      "SELECT id FROM brandscripts WHERE project_id = ? ORDER BY created_at DESC LIMIT 1"
    )
    .get(id) as { id: string } | undefined;

  if (existing) {
    db.prepare("UPDATE brandscripts SET content_json = ? WHERE id = ?").run(
      JSON.stringify(content_json),
      existing.id
    );
  } else {
    db.prepare(
      "INSERT INTO brandscripts (id, project_id, content_json) VALUES (?, ?, ?)"
    ).run(uuid(), id, JSON.stringify(content_json));
  }

  return NextResponse.json({ ok: true });
}
