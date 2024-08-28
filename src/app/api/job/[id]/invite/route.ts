import { jobService } from "@/app/services/jobService";
import { NextResponse } from "next/server";

export async function POST(
  req: Request
) {
  try {
    const request = await req.json();
    const response = await jobService.addJobInvite(request);
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
