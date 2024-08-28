import { jobService } from "@/app/services/jobService";
import { Job } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: any) {
  const searchParams = request.nextUrl.searchParams;
  try {
    const jobs: Job[] = await jobService.getActiveClientJobs(
      Object.fromEntries(searchParams)
    );
    return NextResponse.json(jobs, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
