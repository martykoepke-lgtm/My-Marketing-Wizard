import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generate } from "@/lib/claude";
import {
  KEY_TO_STEP,
  computeCoverage,
  formatCoverageGaps,
} from "@/lib/coverage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();

  const { rows: messages } = await db.execute({
    sql: "SELECT role, message, parsed_fields, created_at FROM story_sessions WHERE project_id = ? ORDER BY created_at ASC",
    args: [id],
  });

  const { rows: answerRows } = await db.execute({
    sql: "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?",
    args: [id],
  });

  const answerMap: Record<string, string> = {};
  for (const a of answerRows) {
    answerMap[a.question_key as string] = a.answer as string;
  }

  const coverage = computeCoverage(answerMap);

  return NextResponse.json({
    messages: messages.map((m) => {
      let parsedFields = null;
      if (m.parsed_fields) {
        try { parsedFields = JSON.parse(m.parsed_fields as string); } catch { /* empty */ }
      }
      return {
        role: m.role,
        message: m.message,
        parsedFields,
        createdAt: m.created_at,
      };
    }),
    coverage,
  });
}

function parseStoryResponse(raw: string): {
  conversational: string;
  parsedFields: Record<string, string> | null;
} {
  const marker = "---PARSED---";
  const endMarker = "---END---";

  const markerIndex = raw.indexOf(marker);
  if (markerIndex === -1) {
    return { conversational: raw.trim(), parsedFields: null };
  }

  const conversational = raw.substring(0, markerIndex).trim();
  const endIndex = raw.indexOf(endMarker, markerIndex);
  const jsonStr = raw
    .substring(
      markerIndex + marker.length,
      endIndex === -1 ? raw.length : endIndex
    )
    .trim();

  let parsedFields: Record<string, string> | null = null;
  try {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedFields = JSON.parse(jsonMatch[0]);
    }
  } catch {
    parsedFields = null;
  }

  return { conversational, parsedFields };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { message } = await request.json();
  const db = await getDb();

  // Load chat history
  const { rows: historyRows } = await db.execute({
    sql: "SELECT role, message FROM story_sessions WHERE project_id = ? ORDER BY created_at ASC",
    args: [id],
  });

  let chatHistory = historyRows.map((h) => ({
    role: h.role as "user" | "assistant",
    content: h.message as string,
  }));
  if (chatHistory.length > 40) {
    chatHistory = [
      ...chatHistory.slice(0, 2),
      ...chatHistory.slice(-30),
    ];
  }

  // Load current answers for coverage
  const { rows: answerRows } = await db.execute({
    sql: "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?",
    args: [id],
  });

  const answerMap: Record<string, string> = {};
  for (const a of answerRows) {
    answerMap[a.question_key as string] = a.answer as string;
  }

  const coverage = computeCoverage(answerMap);

  const filledLines = Object.entries(answerMap)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  // Save user message
  await db.execute({
    sql: "INSERT INTO story_sessions (id, project_id, role, message) VALUES (?, ?, ?, ?)",
    args: [crypto.randomUUID(), id, "user", message],
  });

  // Generate AI response
  const result = await generate({
    task: "story-session",
    chatHistory,
    userMessage: message,
    coverageGaps: formatCoverageGaps(coverage),
    filledFields: filledLines || "(none yet)",
  });

  const { conversational, parsedFields } = parseStoryResponse(result);

  // Upsert extracted fields into discovery_answers
  if (parsedFields && Object.keys(parsedFields).length > 0) {
    const stmts: Array<{ sql: string; args: (string | number)[] }> = [];

    for (const [key, value] of Object.entries(parsedFields)) {
      if (typeof value === "string" && value.trim() && KEY_TO_STEP[key]) {
        stmts.push({
          sql: `INSERT INTO discovery_answers (id, project_id, step_number, question_key, answer)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(project_id, question_key) DO UPDATE SET answer = ?, step_number = ?`,
          args: [crypto.randomUUID(), id, KEY_TO_STEP[key], key, value.trim(), value.trim(), KEY_TO_STEP[key]],
        });
      }
    }

    if (stmts.length > 0) {
      stmts.push({
        sql: "UPDATE projects SET updated_at = datetime('now') WHERE id = ?",
        args: [id],
      });
      await db.batch(stmts, "write");
    }
  }

  // Save assistant message
  await db.execute({
    sql: "INSERT INTO story_sessions (id, project_id, role, message, parsed_fields) VALUES (?, ?, ?, ?, ?)",
    args: [
      crypto.randomUUID(),
      id,
      "assistant",
      conversational,
      parsedFields && Object.keys(parsedFields).length > 0
        ? JSON.stringify(parsedFields)
        : null,
    ],
  });

  // Recompute coverage with updated answers
  const { rows: updatedAnswerRows } = await db.execute({
    sql: "SELECT question_key, answer FROM discovery_answers WHERE project_id = ?",
    args: [id],
  });

  const updatedMap: Record<string, string> = {};
  for (const a of updatedAnswerRows) {
    updatedMap[a.question_key as string] = a.answer as string;
  }
  const updatedCoverage = computeCoverage(updatedMap);

  return NextResponse.json({
    role: "assistant",
    message: conversational,
    parsedFields: parsedFields || {},
    coverage: updatedCoverage,
  });
}
