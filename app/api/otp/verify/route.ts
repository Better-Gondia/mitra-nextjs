import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, mobileNumber } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing accessToken" },
        { status: 400 }
      );
    }

    const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
    if (!MSG91_AUTH_KEY) {
      return NextResponse.json(
        { error: "Server not configured: MSG91_AUTH_KEY missing" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://control.msg91.com/api/v5/widget/verifyAccessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          authkey: MSG91_AUTH_KEY,
          "access-token": accessToken,
        }),
      }
    );

    if (!response.ok) {
      const details = await response.json().catch(() => undefined);
      console.error("❌ Verification Failed:", details);
      return NextResponse.json(
        { error: "Verification failed", details },
        { status: 400 }
      );
    }

    const data = await response.json();
    console.log("✅ Verified from MSG91:", data);
    return NextResponse.json({ verified: true, mobileNumber });
  } catch (err: any) {
    console.error("❌ Verification Failed:", err?.message || err);
    return NextResponse.json(
      { error: "Verification failed", details: err?.message },
      { status: 400 }
    );
  }
}
