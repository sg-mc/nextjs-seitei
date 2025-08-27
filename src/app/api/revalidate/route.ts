import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

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
  const url = new URL(req.url);
  const secretFromQuery = url.searchParams.get("secret");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;

  if (secretFromQuery !== secret && bearer !== secret) {
    return unauthorized();
  }

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    // no body is fine; we'll just revalidate broad tags
  }

  const tags = new Set<string>();
  // Always include broad tags used by lists
  tags.add("posts");
  tags.add("categories");

  // Try to infer slug from several possible webhook shapes
  const slug =
    payload?.slug?.current ||
    payload?.slug ||
    payload?.body?.slug?.current ||
    payload?.body?.slug ||
    payload?.document?.slug?.current ||
    payload?.document?.slug ||
    undefined;

  if (typeof slug === "string" && slug.length > 0) {
    tags.add(`post:${slug}`);
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ ok: true, revalidated: Array.from(tags) });
}

