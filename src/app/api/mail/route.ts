import { mailService } from "@/app/services/mailService"
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {
  try {
    console.log("api/mail POST");
    const request = await req.json();
    await mailService.sendMail(request);
    return NextResponse.json({ status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
