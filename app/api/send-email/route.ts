import { NextResponse } from "next/server";
import { transporter } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { to, subject, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent to:", to);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("EMAIL ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Email failed" },
      { status: 500 }
    );
  }
}
