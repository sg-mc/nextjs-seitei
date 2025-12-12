import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type SlugLike = string | { current?: string } | undefined;
type WebhookPayload = {
  slug?: SlugLike;
  body?: { slug?: SlugLike };
  document?: { slug?: SlugLike };
};

function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ ok: false, message }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "SANITY_REVALIDATE_SECRET not set" },
      { status: 500 }
    );
  }

  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;

  // 認証はAuthorizationヘッダーのみ許可（クエリでのsecretは無効化）
  if (bearer !== secret) {
    return unauthorized();
  }

  let payload: WebhookPayload | null = null;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    // no body is fine; we'll just revalidate broad tags
  }

  const tags = new Set<string>();
  // Always include broad tags used by lists
  tags.add("posts");
  tags.add("categories");

  // Try to infer slug from several possible webhook shapes
  const extract = (s: SlugLike): string | undefined => {
    if (!s) return undefined;
    if (typeof s === "string") return s;
    return typeof s.current === "string" ? s.current : undefined;
    };
  const slug =
    extract(payload?.slug) ||
    extract(payload?.body?.slug) ||
    extract(payload?.document?.slug) ||
    undefined;

  if (typeof slug === "string" && slug.length > 0) {
    tags.add(`post:${slug}`);
  }

  for (const tag of tags) {
    revalidateTag(tag, 'max');
  }

  return NextResponse.json({ ok: true, revalidated: Array.from(tags) });
}
