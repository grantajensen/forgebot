import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ct = request.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart form data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const entry = formData.get("file");
    if (!(entry instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (entry.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const buf = Buffer.from(await entry.arrayBuffer());

    const out = await sharp(buf, { failOn: "none" })
      .rotate()
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("convert-heif:", e);
    return NextResponse.json(
      { error: "Could not convert this image on the server" },
      { status: 422 }
    );
  }
}
