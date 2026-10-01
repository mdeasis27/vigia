import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/client";

export async function GET() {
  try {
    const db = getSql();
    const rows = await db`SELECT id, symbols, stale_docs, auto_corrected, created_at FROM vigia.scans ORDER BY id DESC LIMIT 20`;
    return NextResponse.json({ scans: rows });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error leyendo historial" },
      { status: 500 },
    );
  }
}
