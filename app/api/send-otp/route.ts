import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  //   const { phone } = await req.json();
  const phone = 9340291210;

  const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY!;
  const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID!;
  const SENDER_ID = process.env.MSG91_SENDER_ID!;

  const url = `https://control.msg91.com/api/v5/otp`;

  const payload = {
    template_id: TEMPLATE_ID,
    mobile: `${phone}`, // Indian phone number format
    authkey: MSG91_AUTH_KEY,
    sender: SENDER_ID,
  };

  console.log("payload === ", payload);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  return NextResponse.json(result);
}
