import { clientService } from "@/app/services/clientService";
import { freelancerService } from "@/app/services/freelancerService";
import { jobService } from "@/app/services/jobService";
import { openaiService } from "@/app/services/openaiService";
import { JobWithProposalCount } from "@/app/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    if (
      (request?.status === "ACTIVE" || request?.status === "DRAFT") &&
      (request.title || request.description)
    ) {
      const res = await openaiService.aiAssistantForJob({
        title: request.title,
        description: request.description,
      });
      if (res.status === "invalid") {
        return NextResponse.json({ error: res }, { status: 500 });
      }
    }
    const job = await jobService.addJob(request);
    if (job.status === "ACTIVE") {
      // note that this function call is not awaited as we don't want to block the response
      // not sure this will really work correctly...
      freelancerService.sendNewJobNotification(job);
      // clientService.sendNewJobNotification(job);
    }
    return NextResponse.json(job, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const jobs: JobWithProposalCount[] = await jobService.getAllJobs();
    return NextResponse.json(jobs, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
