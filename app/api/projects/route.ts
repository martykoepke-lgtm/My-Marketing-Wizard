import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();

  const projects = (
    await db.execute({ sql: "SELECT * FROM projects ORDER BY updated_at DESC", args: [] })
  ).rows;

  const result = await Promise.all(
    projects.map(async (p) => {
      const { rows: ac } = await db.execute({
        sql: "SELECT COUNT(*) as cnt FROM assets WHERE project_id = ?",
        args: [p.id as string],
      });
      const { rows: dc } = await db.execute({
        sql: "SELECT COUNT(*) as cnt FROM discovery_answers WHERE project_id = ?",
        args: [p.id as string],
      });
      return {
        ...p,
        asset_count: Number(ac[0]?.cnt ?? 0),
        answer_count: Number(dc[0]?.cnt ?? 0),
      };
    })
  );

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const { name, description } = await request.json();
  const db = await getDb();
  const id = crypto.randomUUID();

  await db.execute({
    sql: "INSERT INTO projects (id, name, description) VALUES (?, ?, ?)",
    args: [id, name, description || ""],
  });

  const { rows } = await db.execute({
    sql: "SELECT * FROM projects WHERE id = ?",
    args: [id],
  });

  return NextResponse.json(rows[0], { status: 201 });
}
