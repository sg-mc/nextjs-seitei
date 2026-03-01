import { NextResponse } from "next/server";

// Build Hook 運用のため、このエンドポイントは現在無効化しています。
// 緊急時に On-Demand ISR を再開する場合は、git logから以前のロジックを復元してください。
export async function POST() {
  return NextResponse.json({ error: "disabled" }, { status: 401 });
}
