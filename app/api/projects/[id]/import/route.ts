import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import { KEY_TO_STEP } from "@/lib/coverage";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await request.json();

  const result = await generate({
    task: "import",
    userMessage: `Extract discovery answers from the following content:\n\n${content}`,
  });

  let parsed: Record<string, unknown>;
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] ?? result);
  } catch {
    return NextResponse.json(
      { error: "Could not parse AI response", raw: result },
      { status: 422 }
    );
  }

  if (Array.isArray(parsed.plan_steps)) {
    const steps = parsed.plan_steps as string[];
    steps.forEach((step, i) => {
      if (i < 4) parsed[`plan_step_${i + 1}`] = step;
    });
    delete parsed.plan_steps;
  }

  if (Array.isArray(parsed.audiences)) {
    const audiences = parsed.audiences as string[];
    if (audiences[0]) parsed.audience_primary = audiences[0];
    if (audiences[1]) parsed.audience_secondary = audiences[1];
    delete parsed.audiences;
  }

  if (parsed.authority && !parsed.authority_credentials) {
    parsed.authority_credentials = parsed.authority;
    delete parsed.authority;
  }

  const db = await getDb();

  const stmts: Array<{ sql: string; args: (string | number)[] }> = [];
  let savedCount = 0;

  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string" && value.trim() && KEY_TO_STEP[key]) {
      stmts.push({
        sql: `INSERT INTO discovery_answers (id, project_id, step_number, question_key, answer)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(project_id, question_key) DO UPDATE SET answer = ?, step_number = ?`,
        args: [crypto.randomUUID(), id, KEY_TO_STEP[key], key, value.trim(), value.trim(), KEY_TO_STEP[key]],
      });
      savedCount++;
    }
  }

  if (stmts.length > 0) {
    stmts.push({
      sql: "UPDATE projects SET updated_at = datetime('now') WHERE id = ?",
      args: [id],
    });
    await db.batch(stmts, "write");
  }

  return NextResponse.json({
    extracted: parsed,
    saved: savedCount,
  });
}
