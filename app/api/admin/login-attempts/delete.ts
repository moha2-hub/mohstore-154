import { NextResponse } from "next/server";
import { recordLoginAttempt } from "@/lib/login-attempts";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
  }
  // Reset attempts for this email
  recordLoginAttempt(email, true);
  return NextResponse.json({ success: true });
}

