import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSignedUrl } from "@/lib/bunny";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoPath } = await request.json();

  if (!videoPath) {
    return NextResponse.json(
      { error: "videoPath is required" },
      { status: 400 }
    );
  }

  const url = generateSignedUrl({ videoPath, expiresIn: 3600 });

  // Log token generation
  await supabase.from("video_token_logs").insert({
    user_id: user.id,
    token_expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
  });

  return NextResponse.json({ url });
}
