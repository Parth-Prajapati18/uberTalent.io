import { jobService } from "@/app/services/jobService";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const rate = await jobService.getJobRate();
    return NextResponse.json({ message: "success", rate }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
