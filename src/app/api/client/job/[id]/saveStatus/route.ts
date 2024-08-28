import { jobService } from "@/app/services/jobService";
import { ErrorResponse } from "@/app/types";
import { Job } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }): Promise<NextResponse<Boolean | ErrorResponse>> {
  try {
    const jobSaveStatus = await jobService.checkJobSavedStatus(params.id);
    return NextResponse.json(jobSaveStatus, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
}